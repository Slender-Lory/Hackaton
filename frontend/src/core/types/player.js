// Зеркало контрактов backend'а: backend/Modules/Players/Hackat.Players.Contracts.

/** @typedef {'Easy' | 'Normal' | 'Hard'} Difficulty */

/**
 * Игрок. email = null — гость.
 * @typedef {object} Player
 * @property {string} id
 * @property {string} nickname
 * @property {boolean} isRegistered
 * @property {string | null} email
 * @property {string} createdAt
 */

/**
 * Результат входа: токен сессии этого устройства.
 * @typedef {object} AuthResult
 * @property {Player} player
 * @property {string} token
 * @property {string | null} expiresAt null — сессия гостя, не истекает
 */

/**
 * Прогресс по одной профессии. revision = 0 — профессия ещё не начата.
 * @typedef {object} Progress
 * @property {string} professionCode
 * @property {string} professionTitle
 * @property {number} level
 * @property {number} percent
 * @property {Difficulty} difficulty
 * @property {unknown} state
 * @property {number} revision
 * @property {string | null} updatedAt
 */

/**
 * @typedef {object} PlayerProfile
 * @property {Player} player
 * @property {Progress[]} progress
 */

export {};
