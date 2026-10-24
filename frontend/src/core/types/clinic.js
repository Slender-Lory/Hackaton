/**
 * Помещение на плане клиники. Открывается по ходу главы, когда выполнены условия unlock.
 * @typedef {object} ClinicRoom
 * @property {string} code
 * @property {string} title
 * @property {string} area grid-area на плане
 * @property {import('@/core/types/shift').Condition[]} [unlock] без условий — открыто с начала
 * @property {string} [lockedLabel] коротко на плашке закрытой комнаты
 * @property {string} [lockedText] подробно во всплывающем уведомлении
 */

export {};
