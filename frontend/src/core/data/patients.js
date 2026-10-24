/** @typedef {import('@/core/types/shift').ActivityPatient} ActivityPatient */

/** @type {Readonly<Record<string, ActivityPatient>>} */
export const patients = Object.freeze({
    marquis: {
        id: 'marquis',
        name: 'Маркиз',
        kind: 'cat',
        isSick: true,
        passport: {
            species: 'Кошка',
            breed: 'Беспородный',
            sex: 'Кот, кастрирован',
            birthDate: '2021-05-20',
            owner: 'Тимур, 15 лет',
            vaccinations: [
                {name: 'Бешенство', date: '2026-03-11'},
                {name: 'Комплексная: панлейкопения, калицивироз, ринотрахеит', date: '2026-03-11'},
            ],
            history: ['2023 — отравился лилией из букета, промывание, обошлось', '2025 — зубной камень, чистка'],
            complaint: 'Второй день хромает на переднюю лапу и почти не ест',
        },
        vitals: [
            {id: 'temperature', label: 'Температура', norm: '38–39,2 °C'},
            {id: 'pulse', label: 'Пульс', norm: '140–220 уд/мин'},
            {id: 'weight', label: 'Вес', norm: '3,5–5 кг', value: '4,6 кг'},
        ],
    },
    baron: {
        id: 'baron',
        name: 'Барон',
        kind: 'dog',
        model: '/models/shiba-inu.glb',
        isSick: true,
        passport: {
            species: 'Собака',
            breed: 'Сиба-ину',
            sex: 'Кобель',
            birthDate: '2022-03-14',
            owner: 'Алина',
            vaccinations: [
                {name: 'Бешенство', date: '2026-04-02'},
                {name: 'Комплексная: чума, парвовирус, гепатит', date: '2026-04-02'},
                {name: 'Обработка от клещей и блох', date: '2026-09-10'},
            ],
            history: ['2024 — аллергия на курицу, сменили корм', '2025 — порезал лапу на прогулке, швы'],
            complaint: 'Третий день чешется, на ушах и лапах проплешины',
        },
        vitals: [
            {id: 'temperature', label: 'Температура', norm: '37,5–39 °C'},
            {id: 'pulse', label: 'Пульс', norm: '70–120 уд/мин'},
            {id: 'weight', label: 'Вес', norm: '8–12 кг', value: '11 кг'},
        ],
    },
    pigs: {
        id: 'pigs',
        name: 'Поросята',
        kind: 'pig',
        model: '/models/pig.glb',
        isSick: false,
        passport: {
            species: 'Свиньи, стадо 40 голов',
            breed: 'Крупная белая',
            birthDate: 'Весенний опорос 2026',
            owner: 'Пётр Ильич, свиноферма',
            vaccinations: [
                {name: 'Классическая чума свиней', date: '2026-05-15'},
                {name: 'Рожа свиней', date: '2026-06-01'},
            ],
            history: [
                '2025 — понос у поросят после смены корма, прошёл за неделю',
                'Неделю назад куплены шесть поросят на рынке',
            ],
            complaint: 'Поросята не встают, у троих слюна',
        },
        vitals: [
            {id: 'temperature', label: 'Температура у больных', norm: '38,5–39,5 °C'},
            {id: 'sick', label: 'Больных в стаде', norm: '0'},
        ],
    },
    kesha: {
        id: 'kesha',
        name: 'Кеша',
        kind: 'bird',
        isSick: true,
        passport: {
            species: 'Волнистый попугай',
            sex: 'Самец',
            birthDate: '2019-07-01',
            owner: 'Вера Николаевна',
            vaccinations: [],
            history: ['2023 — подрезали отросшие когти', '2024 — тяжёлая линька, курс витаминов'],
            complaint: 'Со вчера сидит нахохлившись, не ест, много пьёт',
        },
        vitals: [
            {id: 'weight', label: 'Вес', norm: '35–45 г'},
            {id: 'breathing', label: 'Дыхание', norm: '60–80 в минуту'},
        ],
    },
});
