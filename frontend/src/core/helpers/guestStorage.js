import {safeStorage} from '@/core/helpers/safeStorage';

/** @typedef {import('@/core/types/player').Guest} Guest */
/** @typedef {import('@/core/types/player').GuestProgress} GuestProgress */
/** @typedef {import('@/core/types/player').LocalProgress} LocalProgress */

const GUEST_KEY = 'hackat.guest';

let memoryGuest = null;

/** @returns {Guest | null} */
export function getGuest() {
    const raw = safeStorage.get(GUEST_KEY);

    if (raw === null) {
        return memoryGuest;
    }

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

/** @param {Guest | null} guest */
function writeGuest(guest) {
    memoryGuest = guest;
    safeStorage.set(GUEST_KEY, guest ? JSON.stringify(guest) : null);
}

/**
 * @param {string} nickname
 * @returns {Guest}
 */
export function startGuest(nickname) {
    const guest = {nickname: nickname.trim().replace(/\s+/g, ' '), progress: {}};
    writeGuest(guest);

    return guest;
}

/**
 * @param {string} professionCode
 * @param {Omit<GuestProgress, 'savedAt'>} progress
 */
export function saveGuestProgress(professionCode, progress) {
    const guest = getGuest();

    if (!guest) {
        throw new Error('Гость не начал игру: сначала startGuest()');
    }

    writeGuest({
        ...guest,
        progress: {...guest.progress, [professionCode]: {...progress, savedAt: new Date().toISOString()}},
    });
}

/**
 * @param {string} professionCode
 * @returns {GuestProgress | null}
 */
export function getGuestProgress(professionCode) {
    return getGuest()?.progress[professionCode] ?? null;
}

/**
 * @param {Guest | null} [guest]
 * @returns {LocalProgress[]}
 */
export function toLocalProgress(guest = getGuest()) {
    if (!guest) {
        return [];
    }

    return Object.entries(guest.progress).map(([professionCode, progress]) => ({
        professionCode,
        level: progress.level,
        percent: progress.percent,
        difficulty: progress.difficulty,
        state: progress.state,
    }));
}

export function clearGuest() {
    writeGuest(null);
}
