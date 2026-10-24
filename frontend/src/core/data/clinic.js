/** @typedef {import('@/core/types/clinic').ClinicRoom} ClinicRoom */

/** @type {readonly ClinicRoom[]} */
export const clinicRooms = Object.freeze([
    {code: 'reception', title: 'Приёмная', area: '1 / 1 / 3 / 3'},
    {code: 'exam', title: 'Смотровая', area: '1 / 3 / 3 / 5'},
    {
        code: 'lab',
        title: 'Лаборатория',
        area: '1 / 5 / 3 / 7',
        unlock: [{answer: {activity: 'cat-1', step: 'exam'}}],
        lockedLabel: 'После осмотра',
        lockedText: 'Лаборатория откроется, когда осмотришь первого пациента в смотровой',
    },
    {
        code: 'surgery',
        title: 'Операционная',
        area: '3 / 1 / 5 / 4',
        unlock: [{answer: {activity: 'cat-1', step: 'diagnosis'}}],
        lockedLabel: 'После диагноза',
        lockedText: 'Операционная откроется, когда поставишь первый диагноз',
    },
    {
        code: 'ward',
        title: 'Стационар',
        area: '3 / 4 / 5 / 6',
        unlock: [{answer: {activity: 'parrot-2', step: 'diagnosis'}}],
        lockedLabel: 'Позже',
        lockedText: 'Стационар откроется, когда пациенту понадобится капельница',
    },
    {code: 'garage', title: 'Выезд на ферму', area: '3 / 6 / 5 / 7'},
]);
