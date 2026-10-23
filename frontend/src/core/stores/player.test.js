import {createPinia, setActivePinia} from 'pinia';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {enterPlayer, fetchProfile} from '@/core/api/players';
import {usePlayerStore} from './player';

vi.mock('@/core/api/players', () => ({
    enterPlayer: vi.fn(),
    fetchProfile: vi.fn(),
}));

const PLAYER = {id: '1', nickname: 'Аня', isRegistered: false, email: null, createdAt: ''};

describe('usePlayerStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.stubGlobal('localStorage', {
            data: {},
            getItem(key) {
                return this.data[key] ?? null;
            },
            setItem(key, value) {
                this.data[key] = value;
            },
            removeItem(key) {
                delete this.data[key];
            },
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it('без токена профиль не запрашивает', async () => {
        await usePlayerStore().loadProfile();

        expect(fetchProfile).not.toHaveBeenCalled();
    });

    it('вход сохраняет игрока и токен', async () => {
        enterPlayer.mockResolvedValue({player: PLAYER, token: 'secret', expiresAt: null});
        const store = usePlayerStore();

        await store.enter('  Аня ');

        expect(enterPlayer).toHaveBeenCalledWith('Аня');
        expect(store.isSignedIn).toBe(true);
        expect(localStorage.getItem('hackat.token')).toBe('secret');
    });

    it('процент только у начатой профессии', async () => {
        localStorage.setItem('hackat.token', 'secret');
        fetchProfile.mockResolvedValue({
            player: PLAYER,
            progress: [
                {professionCode: 'vet', percent: 35, revision: 2},
                {professionCode: 'agro', percent: 0, revision: 0},
            ],
        });
        const store = usePlayerStore();

        await store.loadProfile();

        expect(store.getPercent('vet')).toBe(35);
        expect(store.getPercent('agro')).toBeNull();
    });
});
