import {createPinia, setActivePinia} from 'pinia';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import * as playersApi from '@/core/api/players';
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
});
