import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import {ApiError} from '@/core/api/client';
import {enterPlayer, fetchProfile} from '@/core/api/players';
import {safeStorage} from '@/core/helpers/safeStorage';

/** @typedef {import('@/core/types/player').Player} Player */
/** @typedef {import('@/core/types/player').Progress} Progress */

// Общий с тестовым меню backend'а (/test/): один вход на оба экрана.
const TOKEN_STORAGE_KEY = 'hackat.token';
const UNAUTHORIZED_STATUS = 401;

export const usePlayerStore = defineStore('player', () => {
    /** @type {import('vue').Ref<Player | null>} */
    const player = ref(null);
    /** @type {import('vue').Ref<Progress[]>} */
    const progress = ref([]);

    const isSignedIn = computed(() => player.value !== null);

    /** Подтянуть профиль по сохранённому токену. Без сервера экран работает, вход спросим при старте игры. */
    async function loadProfile() {
        const token = safeStorage.get(TOKEN_STORAGE_KEY);

        if (!token) {
            return;
        }

        try {
            const profile = await fetchProfile(token);
            player.value = profile.player;
            progress.value = profile.progress;
        } catch (error) {
            if (error instanceof ApiError && error.status === UNAUTHORIZED_STATUS) {
                safeStorage.set(TOKEN_STORAGE_KEY, null);

                return;
            }

            console.error(error);
        }
    }

    /**
     * @param {string} nickname
     * @returns {Promise<Player>}
     */
    async function enter(nickname) {
        const {player: enteredPlayer, token} = await enterPlayer(nickname.trim());
        safeStorage.set(TOKEN_STORAGE_KEY, token);
        player.value = enteredPlayer;
        progress.value = [];

        return enteredPlayer;
    }

    /**
     * Процент прохождения или null, если профессия не начата.
     * @param {string} professionCode
     * @returns {number | null}
     */
    function getPercent(professionCode) {
        const professionProgress = progress.value.find((item) => item.professionCode === professionCode);

        return professionProgress?.revision ? professionProgress.percent : null;
    }

    return {player, progress, isSignedIn, loadProfile, enter, getPercent};
});
