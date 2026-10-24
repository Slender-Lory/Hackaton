import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import * as playersApi from '@/core/api/players';
import {clearGuest, getGuest, startGuest} from '@/core/helpers/guestStorage';

/** @typedef {import('@/core/types/player').Player} Player */
/** @typedef {import('@/core/types/player').Progress} Progress */
/** @typedef {import('@/core/types/player').Guest} Guest */
/** @typedef {import('@/core/types/player').AuthResult} AuthResult */

export const usePlayerStore = defineStore('player', () => {
    /** @type {import('vue').Ref<Player | null>} */
    const account = ref(null);
    /** @type {import('vue').Ref<Progress[]>} */
    const accountProgress = ref([]);
    /** @type {import('vue').Ref<Guest | null>} */
    const guest = ref(null);
    const isRestored = ref(false);

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
        if (isAccount.value) {
            const progress = accountProgress.value.find((item) => item.professionCode === professionCode);

            return progress?.revision ? {level: progress.level, percent: progress.percent} : null;
        }

        const progress = guest.value?.progress[professionCode];

        return progress ? {level: progress.level, percent: progress.percent} : null;
    }

    /**
     * @param {string} professionCode
     * @returns {number | null}
     */
    function getPercent(professionCode) {
        return getProgressSummary(professionCode)?.percent ?? null;
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
    };
});
