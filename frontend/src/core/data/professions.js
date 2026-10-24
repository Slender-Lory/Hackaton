/** @typedef {import('@/core/types/profession').Profession} Profession */

/** @type {readonly Profession[]} */
export const professions = Object.freeze([
    {
        code: 'vet',
        title: 'Ветеринар',
        kind: 'Медицина и животные',
        patient: {name: 'Барон', kind: 'dog'},
        tagline: 'Три смены, вспышка рожи на свиноферме и пациенты, которые не умеют сказать, где болит.',
        stats: [
            {icon: 'calendar', label: 'Смены', value: '3'},
            {icon: 'clock', label: 'Время', value: '30–40 мин'},
            {icon: 'paw', label: 'Пациенты', value: '5 и стадо'},
        ],
        isAvailable: true,
    },
    {
        code: 'agro',
        title: 'Агроном',
        kind: 'Поле и урожай',
        tagline: 'Дрон, почва и погода против урожая.',
        stats: [],
        isAvailable: false,
    },
    {
        code: 'zootech',
        title: 'Зоотехник',
        kind: 'Ферма',
        tagline: 'Стадо, корма и порядок на ферме.',
        stats: [],
        isAvailable: false,
    },
    {
        code: 'drone',
        title: 'Оператор агродронов',
        kind: 'Техника',
        tagline: 'Съёмка и обработка полей с воздуха.',
        stats: [],
        isAvailable: false,
    },
    {
        code: 'eco',
        title: 'Эколог',
        kind: 'Природа',
        tagline: 'Вода, почва и чистота у Дона.',
        stats: [],
        isAvailable: false,
    },
]);
