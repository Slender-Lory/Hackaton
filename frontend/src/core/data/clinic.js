/** @typedef {import('@/core/types/clinic').ClinicRoom} ClinicRoom */

/** @type {readonly ClinicRoom[]} */
export const clinicRooms = Object.freeze([
    {code: 'reception', title: 'Приёмная'},
    {code: 'exam', title: 'Смотровая'},
    {
        code: 'lab',
        title: 'Лаборатория',
        unlock: [{answer: {activity: 'cat-1', step: 'exam'}}],
        lockedLabel: 'После осмотра',
        lockedText: 'Лаборатория откроется, когда осмотришь первого пациента в смотровой',
    },
    {
        code: 'surgery',
        title: 'Операционная',
        unlock: [{answer: {activity: 'cat-1', step: 'diagnosis'}}],
        lockedLabel: 'После диагноза',
        lockedText: 'Операционная откроется, когда поставишь первый диагноз',
    },
    {
        code: 'ward',
        title: 'Стационар',
        unlock: [{answer: {activity: 'parrot-2', step: 'diagnosis'}}],
        lockedLabel: 'Позже',
        lockedText: 'Стационар откроется, когда пациенту понадобится капельница',
    },
    {code: 'garage', title: 'Выезд на ферму'},
]);
