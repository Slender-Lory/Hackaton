/**
 * Ошибка backend'а: code — 8-значный AppErrorCodes, message — текст для игрока.
 * @typedef {object} AppError
 * @property {number} code
 * @property {string} message
 */

/**
 * Обёртка всех ответов контроллеров backend'а.
 * @template T
 * @typedef {object} AppResult
 * @property {T} result
 * @property {AppError | null} error
 */

/**
 * @typedef {object} HealthResponse
 * @property {string} status
 * @property {string} [service]
 */

export {};
