import {http} from '@/core/api/client';

/** @typedef {import('@/core/types/player').AuthResult} AuthResult */
/** @typedef {import('@/core/types/player').PlayerProfile} PlayerProfile */

const ENTER_PATH = '/api/v1/players/enter';
const PROFILE_PATH = '/api/v1/players/me';

/**
 * @param {string} token
 * @returns {HeadersInit}
 */
function getAuthHeaders(token) {
    return {Authorization: `Player ${token}`};
}

/**
 * @param {string} nickname
 * @returns {Promise<AuthResult>}
 */
export async function enterPlayer(nickname) {
    const {result} = await http.post(ENTER_PATH, {nickname});

    return result;
}

/**
 * @param {string} token
 * @returns {Promise<PlayerProfile>}
 */
export async function fetchProfile(token) {
    const {result} = await http.get(PROFILE_PATH, {headers: getAuthHeaders(token)});

    return result;
}
