import {ApiError, api} from '@/core/api/client';
import {clearGuest, getGuest, toLocalProgress} from '@/core/helpers/guestStorage';
import {getAuthHeaders, getToken, setToken} from '@/core/helpers/tokenStorage';

/** @typedef {import('@/core/types/player').AuthResult} AuthResult */
/** @typedef {import('@/core/types/player').PlayerProfile} PlayerProfile */
/** @typedef {import('@/core/types/player').Progress} Progress */
/** @typedef {import('@/core/types/player').SaveProgressForm} SaveProgressForm */

const PLAYERS_PATH = '/v1/players';
const UNAUTHORIZED_STATUS = 401;

/**
 * @template T
 * @param {string} path
 * @param {RequestInit} [init]
 * @returns {Promise<T>}
 */
async function call(path, init = {}) {
    const response = await api(`${PLAYERS_PATH}${path}`, {
        ...init,
        headers: {...getAuthHeaders(), ...init.headers},
    });

    return response?.result;
}

/**
 * @param {string} method
 * @param {unknown} body
 * @returns {RequestInit}
 */
function withJson(method, body) {
    return {method, body: JSON.stringify(body)};
}

/**
 * @param {unknown} error
 * @param {number} [code] значение из ERROR_CODES
 * @returns {boolean}
 */
export function isApiError(error, code) {
    return error instanceof ApiError && (code === undefined || error.code === code);
}

/**
 * @param {{email: string, password: string, nickname: string, progress?: import('@/core/types/player').LocalProgress[]}} form
 * @returns {Promise<AuthResult>}
 */
export async function register(form) {
    const result = await call('/register', withJson('POST', form));
    setToken(result.token);

    return result;
}

/**
 * @param {{email: string, password: string, progress?: import('@/core/types/player').LocalProgress[]}} form
 * @returns {Promise<AuthResult>}
 */
export async function login(form) {
    const result = await call('/login', withJson('POST', form));
    setToken(result.token);

    return result;
}

/**
 * @param {string} email
 * @param {string} password
 * @param {string} [nickname]
 * @returns {Promise<AuthResult>}
 */
export async function registerFromGuest(email, password, nickname) {
    const guest = getGuest();
    const result = await register({
        email,
        password,
        nickname: nickname ?? guest?.nickname ?? '',
        progress: toLocalProgress(guest),
    });
    clearGuest();

    return result;
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<AuthResult>}
 */
export async function loginFromGuest(email, password) {
    const result = await login({email, password, progress: toLocalProgress()});
    clearGuest();

    return result;
}

export async function logout() {
    try {
        if (getToken()) {
            await call('/logout', {method: 'POST'});
        }
    } finally {
        setToken(null);
    }
}

/** @param {string} password */
export async function deleteAccount(password) {
    await call('/me', withJson('DELETE', {password}));
    setToken(null);
}

/** @returns {Promise<PlayerProfile>} */
export function getProfile() {
    return call('/me');
}

/** @returns {Promise<PlayerProfile | null>} */
export async function restoreSession() {
    if (!getToken()) {
        return null;
    }

    try {
        return await getProfile();
    } catch (error) {
        if (isApiError(error) && error.status === UNAUTHORIZED_STATUS) {
            setToken(null);

            return null;
        }

        throw error;
    }
}

/**
 * @param {string} professionCode
 * @returns {Promise<Progress>}
 */
export function getProgress(professionCode) {
    return call(`/me/progress/${encodeURIComponent(professionCode)}`);
}

/**
 * @param {string} professionCode
 * @param {SaveProgressForm} form
 * @returns {Promise<Progress>}
 */
export function saveProgress(professionCode, form) {
    return call(`/me/progress/${encodeURIComponent(professionCode)}`, withJson('PUT', form));
}
