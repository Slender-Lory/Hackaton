import {safeStorage} from '@/core/helpers/safeStorage';

const TOKEN_KEY = 'hackat.token';

let memoryToken = null;

/** @returns {string | null} */
export function getToken() {
    return safeStorage.get(TOKEN_KEY) ?? memoryToken;
}

/** @param {string | null} token */
export function setToken(token) {
    memoryToken = token;
    safeStorage.set(TOKEN_KEY, token);
}

/** @returns {Record<string, string>} */
export function getAuthHeaders() {
    const token = getToken();

    return token ? {Authorization: `Player ${token}`} : {};
}
