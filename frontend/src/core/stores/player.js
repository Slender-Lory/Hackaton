import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import * as playersApi from '@/core/api/players';
import {DIFFICULTIES, ERROR_CODES} from '@/core/constants';
import {clearGuest, getGuest, saveGuestProgress, startGuest} from '@/core/helpers/guestStorage';

/** @typedef {import('@/core/types/player').Player} Player */
/** @typedef {import('@/core/types/player').Progress} Progress */
/** @typedef {import('@/core/types/player').Guest} Guest */
/** @typedef {import('@/core/types/player').AuthResult} AuthResult */
/**
 * @typedef {object} GameProgress
 * @property {number} level
 * @property {number} percent
 * @property {Record<string, unknown> | null} state
 * @property {import('@/core/types/player').Difficulty} [difficulty]
 */

/** @type {Readonly<GameProgress>} */
const EMPTY_PROGRESS = Object.freeze({level: 0, percent: 0, state: null});

/**
 * Сброшенный прогресс сервер хранит с новой revision, поэтому «не начата» — это нулевые уровень и процент.
 * @param {{level: number, percent: number} | undefined} progress
 * @returns {boolean}
 */
function isStarted(progress) {
    return Boolean(progress && (progress.level > 0 || progress.percent > 0));
}

export const usePlayerStore = defineStore('player', () => {
    /** @type {import('vue').Ref<Player | null>} */
    const account = ref(null);
    /** @type {import('vue').Ref<Progress[]>} */
    const accountProgress = ref([]);
    /** @type {import('vue').Ref<Guest | null>} */
    const guest = ref(null);
    const isRestored = ref(false);

    let saveQueue = Promise.resolve();

    const isAccount = computed(() => account.value !== null);
    const isGuest = computed(() => !isAccount.value && guest.value !== null);
    const isSignedIn = computed(() => isAccount.value || isGuest.value);
    const nickname = computed(() => account.value?.nickname ?? guest.value?.nickname ?? '');

    async function restore() {
        try {
            const profile = await playersApi.restoreSession();

            if (profile) {
                applyProfile(profile);
            }
        } catch (error) {
            console.error(error);
        } finally {
            guest.value = isAccount.value ? null : getGuest();
            isRestored.value = true;
        }
    }

    /** @param {import('@/core/types/player').PlayerProfile} profile */
    function applyProfile(profile) {
        account.value = profile.player;
        accountProgress.value = profile.progress;
    }

    /** @param {string} name */
    function startAsGuest(name) {
        guest.value = startGuest(name);
    }

    /**
     * @param {{email: string, password: string, nickname?: string}} form
     * @returns {Promise<AuthResult>}
     */
    async function register({email, password, nickname: name}) {
        const result = isGuest.value
            ? await playersApi.registerFromGuest(email, password, name)
            : await playersApi.register({email, password, nickname: name ?? ''});

        await afterAuth();

        return result;
    }

    /**
     * @param {{email: string, password: string}} form
     * @returns {Promise<AuthResult>}
     */
    async function login({email, password}) {
        const result = isGuest.value
            ? await playersApi.loginFromGuest(email, password)
            : await playersApi.login({email, password});

        await afterAuth();

        return result;
    }

    async function afterAuth() {
        applyProfile(await playersApi.getProfile());
        guest.value = null;
    }

    async function logout() {
        await playersApi.logout();
        account.value = null;
        accountProgress.value = [];
    }

    function leaveGuest() {
        clearGuest();
        guest.value = null;
    }

    /** @param {string} password */
    async function deleteAccount(password) {
        await playersApi.deleteAccount(password);
        account.value = null;
        accountProgress.value = [];
    }

    /**
     * @param {string} professionCode
     * @returns {{level: number, percent: number} | null}
     */
    function getProgressSummary(professionCode) {
        const progress = isAccount.value ? findAccountProgress(professionCode) : guest.value?.progress[professionCode];

        return isStarted(progress) ? {level: progress.level, percent: progress.percent} : null;
    }

    /**
     * @param {string} professionCode
     * @returns {number | null}
     */
    function getPercent(professionCode) {
        return getProgressSummary(professionCode)?.percent ?? null;
    }

    /**
     * @param {string} professionCode
     * @returns {Record<string, unknown> | null}
     */
    function getProgressState(professionCode) {
        if (isAccount.value) {
            return findAccountProgress(professionCode)?.state ?? null;
        }

        return guest.value?.progress[professionCode]?.state ?? null;
    }

    /**
     * Сохранения идут строго по очереди: иначе второе уйдёт со старой revision и получит конфликт.
     * @param {string} professionCode
     * @param {GameProgress} progress
     * @returns {Promise<void>}
     */
    function saveProgress(professionCode, progress) {
        const save = saveQueue.then(() => writeProgress(professionCode, progress));
        saveQueue = save.catch(() => undefined);

        return save;
    }

    /**
     * Начать профессию заново. Сброс важнее чужой вкладки: при конфликте повторяем с новой revision.
     * @param {string} professionCode
     * @returns {Promise<void>}
     */
    async function resetProgress(professionCode) {
        try {
            await saveProgress(professionCode, EMPTY_PROGRESS);
        } catch (error) {
            if (!playersApi.isApiError(error, ERROR_CODES.progressConflict)) {
                throw error;
            }

            await saveProgress(professionCode, EMPTY_PROGRESS);
        }
    }

    /**
     * @param {string} professionCode
     * @param {GameProgress} progress
     */
    async function writeProgress(professionCode, {level, percent, state, difficulty}) {
        if (!isAccount.value) {
            saveGuestProgress(professionCode, {level, percent, difficulty: difficulty ?? DIFFICULTIES.normal, state});
            guest.value = getGuest();

            return;
        }

        const current = findAccountProgress(professionCode);

        try {
            replaceAccountProgress(
                await playersApi.saveProgress(professionCode, {
                    level,
                    percent,
                    difficulty: difficulty ?? current?.difficulty ?? DIFFICULTIES.normal,
                    state,
                    expectedRevision: current?.revision ?? 0,
                }),
            );
        } catch (error) {
            if (playersApi.isApiError(error, ERROR_CODES.progressConflict)) {
                replaceAccountProgress(await playersApi.getProgress(professionCode));
            }

            throw error;
        }
    }

    /**
     * @param {string} professionCode
     * @returns {Progress | undefined}
     */
    function findAccountProgress(professionCode) {
        return accountProgress.value.find((item) => item.professionCode === professionCode);
    }

    /** @param {Progress} progress */
    function replaceAccountProgress(progress) {
        const others = accountProgress.value.filter((item) => item.professionCode !== progress.professionCode);
        accountProgress.value = [...others, progress];
    }

    return {
        account,
        accountProgress,
        guest,
        isRestored,
        isAccount,
        isGuest,
        isSignedIn,
        nickname,
        restore,
        startAsGuest,
        register,
        login,
        logout,
        leaveGuest,
        deleteAccount,
        getProgressSummary,
        getPercent,
        getProgressState,
        saveProgress,
        resetProgress,
    };
});
