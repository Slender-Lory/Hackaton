/**
 * Помещение на плане клиники. Открывается по ходу главы, когда выполнены условия unlock.
 * @typedef {object} ClinicRoom
 * @property {string} code
 * @property {string} title
 * @property {import('@/core/types/shift').Condition[]} [unlock] без условий — открыто с начала
 * @property {boolean} [isClosed] закрыто на всю главу, условия не помогут
 * @property {string} [lockedLabel] коротко на плашке закрытой комнаты
 * @property {string} [lockedText] подробно во всплывающем уведомлении
 */

export {};
