import {createPinia, setActivePinia} from 'pinia';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import * as playersApi from '@/core/api/players';
import {ERROR_CODES} from '@/core/constants';
import {getGuest} from '@/core/helpers/guestStorage';
import {usePlayerStore} from './player';

vi.mock('@/core/api/players', () => ({
    restoreSession: vi.fn(),
    register: vi.fn(),
    registerFromGuest: vi.fn(),
    login: vi.fn(),
    loginFromGuest: vi.fn(),
    getProfile: vi.fn(),
    logout: vi.fn(),
    deleteAccount: vi.fn(),
    saveProgress: vi.fn(),
    getProgress: vi.fn(),
    isApiError: (error, code) => error?.code === code,
}));

const ACCOUNT = {id: '1', nickname: 'Аня', email: 'anya@example.com', createdAt: ''};
const PROFILE = {
    player: ACCOUNT,
    progress: [
        {professionCode: 'vet', level: 2, percent: 35, revision: 3},
        {professionCode: 'agro', level: 0, percent: 0, revision: 0},
    ],
};

function stubLocalStorage() {
    const data = {};
    vi.stubGlobal('localStorage', {
        getItem: (key) => data[key] ?? null,
        setItem: (key, value) => {
            data[key] = value;
        },
        removeItem: (key) => {
            delete data[key];
        },
    });
}

describe('usePlayerStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        stubLocalStorage();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it('без сессии на сервере поднимает гостя из браузера', async () => {
        playersApi.restoreSession.mockResolvedValue(null);
        localStorage.setItem('hackat.guest', JSON.stringify({nickname: 'Гость', progress: {}}));
        const store = usePlayerStore();

        await store.restore();

        expect(store.isGuest).toBe(true);
        expect(store.nickname).toBe('Гость');
    });

    it('гость сохраняется только в браузере', () => {
        const store = usePlayerStore();

        store.startAsGuest('  Аня  ');

        expect(store.isSignedIn).toBe(true);
        expect(getGuest()).toEqual({nickname: 'Аня', progress: {}});
        expect(playersApi.register).not.toHaveBeenCalled();
    });

    it('регистрация гостя переносит его прогресс и стирает гостя', async () => {
        playersApi.registerFromGuest.mockResolvedValue({skippedProfessions: []});
        playersApi.getProfile.mockResolvedValue(PROFILE);
        const store = usePlayerStore();
        store.startAsGuest('Аня');

        await store.register({email: 'anya@example.com', password: 'secret-123'});

        expect(playersApi.registerFromGuest).toHaveBeenCalledWith('anya@example.com', 'secret-123', undefined);
        expect(store.isAccount).toBe(true);
        expect(store.guest).toBeNull();
    });

    it('процент только у начатой профессии аккаунта', async () => {
        playersApi.restoreSession.mockResolvedValue(PROFILE);
        const store = usePlayerStore();

        await store.restore();

        expect(store.getPercent('vet')).toBe(35);
        expect(store.getPercent('agro')).toBeNull();
    });

    it('гость сохраняет прогресс игры в браузер', async () => {
        const store = usePlayerStore();
        store.startAsGuest('Аня');

        await store.saveProgress('vet', {level: 1, percent: 17, state: {version: 1}});

        expect(store.getProgressState('vet')).toEqual({version: 1});
        expect(getGuest().progress.vet.percent).toBe(17);
        expect(playersApi.saveProgress).not.toHaveBeenCalled();
    });

    it('аккаунт сохраняет прогресс с последней revision', async () => {
        playersApi.restoreSession.mockResolvedValue(PROFILE);
        playersApi.saveProgress.mockResolvedValue({professionCode: 'vet', level: 2, percent: 40, revision: 4});
        const store = usePlayerStore();
        await store.restore();

        await store.saveProgress('vet', {level: 2, percent: 40, state: {}});

        expect(playersApi.saveProgress).toHaveBeenCalledWith('vet', expect.objectContaining({expectedRevision: 3}));
        expect(store.getPercent('vet')).toBe(40);
    });

    it('при конфликте перечитывает прогресс с сервера', async () => {
        playersApi.restoreSession.mockResolvedValue(PROFILE);
        playersApi.saveProgress.mockRejectedValue({code: ERROR_CODES.progressConflict});
        playersApi.getProgress.mockResolvedValue({professionCode: 'vet', level: 2, percent: 50, revision: 5});
        const store = usePlayerStore();
        await store.restore();

        await expect(store.saveProgress('vet', {level: 2, percent: 40, state: {}})).rejects.toBeDefined();

        expect(store.getPercent('vet')).toBe(50);
    });
});
