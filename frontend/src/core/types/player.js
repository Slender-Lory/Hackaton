// Зеркало контрактов backend'а: backend/Modules/Players/Hackat.Players.Contracts, docs/api.md.

/** @typedef {'Easy' | 'Normal' | 'Hard'} Difficulty */

/**
 * Аккаунт игрока (гостей сервер не знает).
 * @typedef {object} Player
 * @property {string} id
 * @property {string} nickname
 * @property {string} email
 * @property {string} createdAt
 */

/**
 * Результат регистрации и входа: токен сессии этого устройства (30 дней с последнего запроса).
 * @typedef {object} AuthResult
 * @property {Player} player
 * @property {string} token
 * @property {string} expiresAt
 * @property {string[]} importedProfessions профессии, прогресс которых перенесён из браузера
 * @property {string[]} skippedProfessions в аккаунте уже был свой прогресс — он остался
 */

/**
 * Прогресс по одной профессии. revision = 0 — профессия ещё не начата.
 * @typedef {object} Progress
 * @property {string} professionCode
 * @property {string} professionTitle
 * @property {number} level номер игрового дня
 * @property {number} percent процент прохождения главы
 * @property {Difficulty} difficulty
 * @property {Record<string, unknown> | null} state
 * @property {number} revision
 * @property {string | null} updatedAt
 */

/**
 * @typedef {object} PlayerProfile
 * @property {Player} player
 * @property {Progress[]} progress
 */

/**
 * Тело PUT /players/me/progress/{code}.
 * @typedef {object} SaveProgressForm
 * @property {number} level
 * @property {number} percent
 * @property {Difficulty} [difficulty]
 * @property {Record<string, unknown> | null} [state]
 * @property {number} expectedRevision revision из последнего ответа, 0 — первое сохранение
 */

/**
 * Прогресс гостя в формате API — уходит на сервер при регистрации и входе.
 * @typedef {object} LocalProgress
 * @property {string} professionCode
 * @property {number} level
 * @property {number} percent
 * @property {Difficulty} [difficulty]
 * @property {Record<string, unknown> | null} [state]
 */

/**
 * @typedef {object} GuestProgress
 * @property {number} level
 * @property {number} percent
 * @property {Difficulty} difficulty
 * @property {Record<string, unknown> | null} state
 * @property {string} savedAt
 */

/**
 * Гость: только в localStorage, на сервер не ходит.
 * @typedef {object} Guest
 * @property {string} nickname
 * @property {Record<string, GuestProgress>} progress
 */

export {};
