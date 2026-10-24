import {REPUTATION} from '@/core/data/reputation';

/** @typedef {import('@/core/types/shift').Shift} Shift */
/** @typedef {import('@/core/types/shift').Counters} Counters */

/** @type {Readonly<Counters>} */
export const START_COUNTERS = Object.freeze({revenue: 3000, reputation: 50, pigHealth: 60});

/** @type {Readonly<Record<keyof Counters, string>>} */
export const COUNTER_LABELS = Object.freeze({
    revenue: 'Выручка',
    reputation: 'Репутация',
    pigHealth: 'Здоровье поросят',
});

/** @type {Shift} */
const VET_SHIFT_ONE = {
    number: 1,
    title: 'Первый вызов',
    lead: '6:40, звонит Пётр Ильич: поросята не встают, у троих слюна. До фермы сорок минут, а в приёмной уже ждёт Барон.',
    finale: {
        title: 'Смена закончена',
        text: 'Ферму за один визит не спасти: Пётр Ильич ждёт тебя завтра. Деньги и репутация, заработанные сегодня, решат, на что хватит сил во второй смене.',
    },
    activities: [
        {
            code: 'farm-visit-1',
            roomCode: 'garage',
            title: 'Выезд на ферму',
            place: 'Свиноферма Петра Ильича',
            patient: {name: 'Поросята', model: '/models/pig.glb', isSick: false},
            steps: [
                {
                    kind: 'story',
                    id: 'arrival',
                    title: 'Ферма',
                    text: 'Сорок минут по грунтовке. Пётр Ильич ждёт у ворот: «Вчера ели, а сегодня лежат. И слюни, как у собак».',
                    effects: {revenue: -500},
                },
                {
                    kind: 'choice',
                    id: 'approach',
                    title: 'С чего начнёшь?',
                    text: 'В загоне двенадцать поросят. Трое лежат, у них течёт слюна.',
                    hint: 'Сначала подумай, как не дать болезни уйти дальше.',
                    options: [
                        {
                            id: 'isolate',
                            label: 'Отделить больных от остальных',
                            effects: {pigHealth: 5},
                            feedback: 'Верно: если это инфекция, она не пойдёт дальше по загону.',
                        },
                        {
                            id: 'inspect-all',
                            label: 'Осмотреть всех подряд',
                            effects: {pigHealth: -5},
                            feedback: 'Пока ты ходишь от поросёнка к поросёнку, здоровые стоят рядом с больными.',
                        },
                        {
                            id: 'antibiotics',
                            label: 'Сразу уколоть всем антибиотик',
                            effects: {revenue: -600, pigHealth: -5},
                            feedback: 'Антибиотик не действует на вирус. Деньги ушли, поросятам не легче.',
                        },
                    ],
                },
                {
                    kind: 'checklist',
                    id: 'exam',
                    title: 'Осмотр',
                    text: 'Что проверишь? Анализы для фермы оплачивает клиника.',
                    hint: 'Слюна и хромота: смотри туда, где их видно.',
                    payer: 'clinic',
                    options: [
                        {id: 'mouth', label: 'Осмотреть рот', cost: 0, isNeeded: true},
                        {id: 'hooves', label: 'Осмотреть копыта', cost: 0, isNeeded: true},
                        {id: 'temperature', label: 'Измерить температуру', cost: 100, isNeeded: true},
                        {id: 'blood', label: 'Анализ крови всего стада', cost: 1200, isNeeded: false},
                        {id: 'xray', label: 'Рентген', cost: 900, isNeeded: false},
                    ],
                    missedEffects: {pigHealth: -10},
                    extraEffects: {reputation: REPUTATION.extraTests},
                    feedback: {
                        exact: 'Язвы во рту и на копытах, температура 41°. Картина ясная.',
                        missed: 'Ты пропустил важное, и болезнь успела зайти дальше.',
                        extra: 'Лишние анализы съели деньги и время, а Пётр Ильич занервничал.',
                    },
                },
                {
                    kind: 'choice',
                    id: 'diagnosis',
                    title: 'Предварительный диагноз',
                    text: 'Язвы во рту и на копытах, высокая температура, слюна.',
                    hint: 'Язвы во рту и на ногах вместе — признак одной известной болезни.',
                    options: [
                        {
                            id: 'fmd',
                            label: 'Ящур',
                            effects: {},
                            feedback: 'Похоже на ящур: заразная болезнь. Пробы ушли в областную лабораторию.',
                        },
                        {
                            id: 'cold',
                            label: 'Простуда',
                            effects: {pigHealth: -10},
                            feedback: 'При простуде не бывает язв. Время упущено.',
                        },
                        {
                            id: 'poison',
                            label: 'Отравление кормом',
                            effects: {pigHealth: -10},
                            feedback: 'Корм чистый, а язвы так и не обработаны.',
                        },
                    ],
                },
                {
                    kind: 'choice',
                    id: 'treatment',
                    title: 'Первая обработка',
                    text: 'Лекарства от ящура нет: лечат симптомы и не дают заразе уйти дальше.',
                    hint: 'Одних лекарств мало, если зараза свободно ходит по ферме.',
                    options: [
                        {
                            id: 'antiseptic-quarantine',
                            label: 'Обработать язвы и закрыть карантин',
                            effects: {revenue: -800, pigHealth: 15},
                            feedback: 'Язвы обработаны, ферма на карантине. Поросятам легче, но это только начало.',
                        },
                        {
                            id: 'antiseptic-only',
                            label: 'Только обработать язвы',
                            effects: {revenue: -800, pigHealth: 5},
                            feedback: 'Без карантина болезнь пойдёт по соседним загонам.',
                        },
                        {
                            id: 'cheap-antiseptic',
                            label: 'Взять дешёвый антисептик',
                            effects: {revenue: -300, pigHealth: 5, reputation: REPUTATION.cheapDrugsRevealed},
                            feedback: 'Сэкономил, но Пётр Ильич увидел этикетку. Доверия стало меньше.',
                        },
                    ],
                },
                {
                    kind: 'story',
                    id: 'not-finished',
                    title: 'Одного визита мало',
                    text: 'Пётр Ильич провожает до машины: «Завтра приедешь?» Ящур за день не лечится: нужны повторная обработка и контроль.',
                },
            ],
        },
        {
            code: 'reception-1',
            roomCode: 'reception',
            title: 'Приём',
            place: 'Приёмная',
            patient: {name: 'Барон', model: '/models/shiba-inu.glb', isSick: true},
            steps: [
                {
                    kind: 'story',
                    id: 'owner',
                    title: 'Алина и Барон',
                    text: 'Алина держит Барона на поводке: «У него проплешины на ушах и лапах, третий день чешется. Я заплачу, только сделайте всё как надо».',
                },
                {
                    kind: 'choice',
                    id: 'trust',
                    title: 'Барон нервничает',
                    text: 'Пёс прижал уши и пятится. Как подойдёшь?',
                    hint: 'Собаке нужно время, чтобы понять, что ты не опасен.',
                    options: [
                        {
                            id: 'treat',
                            label: 'Лакомство',
                            icon: 'bone',
                            effects: {},
                            feedback: 'Барон берёт лакомство и успокаивается.',
                        },
                        {
                            id: 'hand',
                            label: 'Присесть и протянуть руку',
                            icon: 'hand',
                            effects: {},
                            feedback: 'Барон обнюхивает руку и разрешает себя осмотреть.',
                        },
                        {
                            id: 'grab',
                            label: 'Сразу на стол',
                            icon: 'grab',
                            effects: {reputation: REPUTATION.roughHandling},
                            feedback: 'Барон цапнул за рукав, Алина нахмурилась. Пять минут ждёте, пока он успокоится.',
                        },
                        {
                            id: 'muzzle',
                            label: 'Намордник',
                            icon: 'shield',
                            effects: {},
                            feedback: 'Безопасно, но Барон испугался ещё сильнее. Спокойному псу это лишнее.',
                        },
                    ],
                },
                {
                    kind: 'checklist',
                    id: 'tests',
                    title: 'Что проверить?',
                    text: 'Платит Алина. Лишние анализы её расстроят.',
                    hint: 'Проблема в коже и шерсти, а не в костях и крови.',
                    payer: 'owner',
                    budget: 2500,
                    options: [
                        {id: 'wood-lamp', label: 'Лампа Вуда', cost: 300, isNeeded: true},
                        {id: 'scraping', label: 'Соскоб с кожи', cost: 500, isNeeded: true},
                        {id: 'blood', label: 'Анализ крови', cost: 900, isNeeded: false},
                        {id: 'xray', label: 'Рентген', cost: 1200, isNeeded: false},
                    ],
                    missedEffects: {reputation: REPUTATION.missedTests},
                    extraEffects: {reputation: REPUTATION.extraTests},
                    feedback: {
                        exact: 'Ровно то, что нужно. Алина довольна, что не переплатила.',
                        missed: 'Без нужных проб легко ошибиться: Алине придётся прийти снова.',
                        extra: 'Анализы оплачены, но половина была лишней. Алина недовольна.',
                    },
                },
                {
                    kind: 'choice',
                    id: 'diagnosis',
                    title: 'Диагноз по фото',
                    text: 'Под лампой Вуда пятна светятся зеленоватым. Круглые проплешины с чёткими краями.',
                    hint: 'Зелёное свечение под лампой дают грибки.',
                    options: [
                        {
                            id: 'dermatophytosis',
                            label: 'Лишай',
                            effects: {},
                            feedback: 'Дерматофитоз, он же лишай: грибок кожи. Не опасно, но заразно.',
                        },
                        {
                            id: 'allergy',
                            label: 'Аллергия',
                            effects: {reputation: REPUTATION.wrongDiagnosis},
                            feedback: 'Аллергия не светится под лампой Вуда. Лечение не поможет.',
                        },
                        {
                            id: 'fleas',
                            label: 'Блохи',
                            effects: {reputation: REPUTATION.wrongDiagnosis},
                            feedback: 'Блох нет, а пятна остались. Алина сомневается в клинике.',
                        },
                    ],
                },
                {
                    kind: 'choice',
                    id: 'treatment',
                    title: 'Лечение',
                    text: 'Лишай заразен для людей и других животных.',
                    hint: 'Грибок живёт не только на собаке, но и дома.',
                    options: [
                        {
                            id: 'full',
                            label: 'Шампунь, мазь и обработка дома',
                            effects: {revenue: 1500, reputation: REPUTATION.exactDiagnosis},
                            feedback: 'Алина записала всё в телефон. Через месяц Барон будет как новый.',
                        },
                        {
                            id: 'ointment',
                            label: 'Только мазь',
                            effects: {revenue: 800},
                            feedback: 'Пятна пройдут, но споры останутся дома, и лишай может вернуться.',
                        },
                        {
                            id: 'antibiotic',
                            label: 'Антибиотик',
                            effects: {revenue: 600, reputation: REPUTATION.wrongDiagnosis},
                            feedback: 'Антибиотики не действуют на грибок. Алина вернётся недовольной.',
                        },
                    ],
                },
                {
                    kind: 'story',
                    id: 'payment',
                    title: 'Приём окончен',
                    text: 'Алина оплачивает анализы и лечение. Деньги пригодятся на ферме.',
                },
            ],
        },
    ],
};

/** @type {Readonly<Record<string, readonly Shift[]>>} */
export const shifts = Object.freeze({
    vet: Object.freeze([VET_SHIFT_ONE]),
});
