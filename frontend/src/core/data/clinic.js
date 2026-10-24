/** @typedef {import('@/core/types/clinic').ClinicRoom} ClinicRoom */

/** @type {readonly ClinicRoom[]} */
export const clinicRooms = Object.freeze([
    {code: 'reception', title: 'Приёмная', area: '1 / 1 / 3 / 3', unlockShift: 1},
    {code: 'exam', title: 'Смотровая', area: '1 / 3 / 3 / 5', unlockShift: 1},
    {code: 'lab', title: 'Лаборатория', area: '1 / 5 / 3 / 7', unlockShift: 2},
    {code: 'surgery', title: 'Операционная', area: '3 / 1 / 5 / 4', unlockShift: 2},
    {code: 'ward', title: 'Стационар', area: '3 / 4 / 5 / 6', unlockShift: 3},
    {code: 'garage', title: 'Выезд на ферму', area: '3 / 6 / 5 / 7', unlockShift: 1},
]);
