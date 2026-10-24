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
            owner: 'Егор, 15 лет',
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
        isSick: true,
        passport: {
            species: 'Собака',
            breed: 'Мопс',
            sex: 'Кобель',
            birthDate: '2022-03-14',
            owner: 'Марина',
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
            {id: 'weight', label: 'Вес', norm: '6–8 кг', value: '7,5 кг'},
        ],
    },
    pigs: {
        id: 'pigs',
        name: 'Поросята',
        kind: 'pig',
        isSick: false,
        herd: [
            {
                id: 'rumyanka',
                name: 'Румянка',
                condition: 'urticaria',
                label: 'Пятна-ромбы на боках и спине',
                note: 'Жар 41 °C, лежит в углу, не подходит к кормушке',
            },
            {
                id: 'sinka',
                name: 'Синька',
                condition: 'septic',
                label: 'Кожа на шее и брюхе синеет',
                note: 'Жар 42 °C, почти не встаёт — самая тяжёлая',
            },
            {
                id: 'pyatachok',
                name: 'Пятачок',
                condition: 'fever',
                label: 'Жар без пятен',
                note: 'Вялый, пятна могут проявиться через день-два',
            },
            {
                id: 'hromka',
                name: 'Хромка',
                condition: 'lame',
                label: 'Припухли суставы, хромает',
                note: 'Так рожа выглядит, если её запустить',
            },
            {
                id: 'bodrik',
                name: 'Бодрик',
                condition: 'carrier',
                label: 'Внешне здоров',
                note: 'Из той же партии: может носить бактерию без признаков',
            },
        ],
        passport: {
            species: 'Свиньи, новая партия 40 голов',
            breed: 'Крупная белая, 3–4 месяца',
            birthDate: 'Весенний опорос 2026',
            owner: 'Пётр Ильич, ферма',
            vaccinations: [],
            history: [
                'Ферма недавно начала разводить свиней: новые свинарники построены этим летом',
                'Партию купили вчера у разводчика, который уверял, что сам сделал прививки. Документов нет',
            ],
            complaint: 'Датчики в свинарнике показали жар у нескольких поросят',
        },
        vitals: [
            {id: 'temperature', label: 'Температура у больных', norm: '38,5–39,5 °C'},
            {id: 'sick', label: 'Больных в партии', norm: '0'},
        ],
    },
    queue: {
        id: 'queue',
        name: 'Трое в очереди',
        kind: 'dog',
        isSick: true,
        passport: {
            species: 'Собака, кролик и кот',
            owner: 'Олег, Жанна и Борис Аркадьевич',
            vaccinations: [],
            history: [],
            complaint: 'Все трое уверены, что их случай срочный',
        },
        vitals: [],
    },
});
