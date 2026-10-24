/** @typedef {import('@/core/types/clinic').ClinicRoom} ClinicRoom */

/** @type {readonly ClinicRoom[]} */
export const clinicRooms = Object.freeze([
    {code: 'reception', title: 'Приёмная'},
    {code: 'exam', title: 'Смотровая'},
    {
        code: 'lab',
        title: 'Лаборатория',
        unlock: [{answer: {activity: 'baron-2', step: 'exam'}}],
        lockedLabel: 'После осмотра',
        lockedText: 'Лаборатория откроется, когда осмотришь пациента в смотровой',
    },
    {
        code: 'surgery',
        title: 'Операционная',
        unlock: [{answer: {activity: 'cat-3', step: 'diagnosis'}}],
        lockedLabel: 'После диагноза',
        lockedText: 'Операционная откроется, когда поставишь первый диагноз',
    },
    {
        code: 'ward',
        title: 'Стационар',
        isClosed: true,
        lockedLabel: 'Закрыт',
        lockedText: 'Стационар закрыт: после увольнений некому дежурить в нём ночью',
    },
    {code: 'garage', title: 'Выезд на ферму'},
]);
