import {REPUTATION} from '@/core/data/reputation';

/** @typedef {import('@/core/types/shift').Shift} Shift */
/** @typedef {import('@/core/types/shift').Counters} Counters */
/** @typedef {import('@/core/types/shift').ChapterEnding} ChapterEnding */

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

/** @type {Shift} */
const VET_SHIFT_TWO = {
    number: 2,
    title: 'Развилка',
    lead: 'Утром снова звонит Пётр Ильич: слёг соседний загон. Денег на всё не хватит, решай, куда их пустить.',
    morning: [
        {
            id: 'disease-spreads',
            text: 'За ночь ящур не отступил: у двух поросят новые язвы.',
            effects: {pigHealth: -10},
        },
        {
            id: 'no-quarantine',
            when: [
                {answer: {activity: 'farm-visit-1', step: 'treatment', is: ['antiseptic-only', 'cheap-antiseptic']}},
            ],
            text: 'Без карантина зараза перешла в соседний загон.',
            effects: {pigHealth: -10},
        },
        {
            id: 'word-of-mouth',
            when: [{counter: 'reputation', min: 55}],
            text: 'Алина рассказала о клинике подругам: с утра две новые записи.',
            effects: {revenue: 1000},
        },
        {
            id: 'empty-hall',
            when: [{counter: 'reputation', max: 44}],
            text: 'В приёмной пусто: о клинике пошли нехорошие разговоры.',
        },
    ],
    finale: {
        title: 'Вторая смена закончена',
        text: 'Завтра последний выезд. Сколько поросят удастся спасти, решат деньги в кассе и доверие Петра Ильича.',
    },
    activities: [
        {
            code: 'farm-visit-2',
            roomCode: 'garage',
            title: 'Повторный выезд',
            place: 'Свиноферма Петра Ильича',
            patient: {name: 'Поросята', model: '/models/pig.glb', isSick: false},
            steps: [
                {
                    kind: 'story',
                    id: 'call',
                    title: 'Звонок с фермы',
                    text: '«Доктор, в соседнем загоне тоже слюна, а один поросёнок второй день не ест». Снова сорок минут по грунтовке.',
                    effects: {revenue: -500},
                },
                {
                    kind: 'choice',
                    id: 'budget',
                    title: 'Куда пустить деньги?',
                    text: 'Препараты для фермы стоят дорого, а клинике тоже нужны расходники. На всё сразу не хватит.',
                    hint: 'Ящур не ждёт: чем раньше обработка, тем меньше потерь.',
                    options: [
                        {
                            id: 'farm-first',
                            label: 'Купить всё для фермы сразу',
                            effects: {revenue: -1500, pigHealth: 10},
                            feedback:
                                'Антисептики и дезсредства уже в машине. Касса похудела, зато ферме есть чем помочь.',
                        },
                        {
                            id: 'cheap-drugs',
                            label: 'Взять дешёвые аналоги',
                            effects: {revenue: -600, pigHealth: 5},
                            feedback: 'Аналоги слабее, но деньги остались. Лишь бы Пётр Ильич не заметил.',
                        },
                        {
                            id: 'clinic-first',
                            label: 'Сначала клиника, ферме что останется',
                            effects: {pigHealth: -10},
                            feedback: 'Касса цела, но поросята ещё полдня без обработки.',
                        },
                    ],
                },
                {
                    kind: 'choice',
                    id: 'source',
                    title: 'Откуда зараза?',
                    text: 'Пётр Ильич вспоминает: неделю назад купил шесть поросят на рынке, вчера приезжала машина с кормом, сосед заходил за инструментом.',
                    hint: 'Ящур приходит с животными. Вспомни, когда всё началось.',
                    options: [
                        {
                            id: 'market',
                            label: 'Поросята с рынка',
                            effects: {pigHealth: 5},
                            feedback: 'Верно: первыми заболели новенькие. Теперь понятно, где начало цепочки.',
                        },
                        {
                            id: 'feed',
                            label: 'Машина с кормом',
                            effects: {pigHealth: -5},
                            feedback: 'Корм чистый, а настоящий источник так и остался без внимания.',
                        },
                        {
                            id: 'neighbour',
                            label: 'Сосед',
                            effects: {pigHealth: -5},
                            feedback: 'Сосед ни при чём. Пока ищешь не там, вирус делает своё дело.',
                        },
                    ],
                },
                {
                    kind: 'choice',
                    id: 'report',
                    title: 'Кому сообщить?',
                    text: 'О ящуре обязаны знать ветслужба и тот, кто продал поросят. Иначе заболеют другие фермы.',
                    hint: 'Цепочку контактов нужно оборвать там, где она началась.',
                    options: [
                        {
                            id: 'vet-service',
                            label: 'Сообщить в ветслужбу и продавцу',
                            effects: {pigHealth: 5},
                            feedback:
                                'Ветслужба закрыла торговлю на рынке до проверки. Пётр Ильич ворчит, но понимает.',
                        },
                        {
                            id: 'farmer-only',
                            label: 'Предупредить только Петра Ильича',
                            effects: {pigHealth: -5},
                            feedback: 'Продавец так и торгует больными поросятами. Цепочка не оборвана.',
                        },
                        {
                            id: 'keep-quiet',
                            label: 'Никому не говорить, чтобы не пугать',
                            effects: {pigHealth: -10},
                            feedback: 'Скрыть вспышку — худшее решение: через неделю заболеют соседние фермы.',
                        },
                    ],
                },
                {
                    kind: 'checklist',
                    id: 'disinfection',
                    title: 'Обработка фермы',
                    text: 'Что сделаешь на ферме сегодня? Расходники оплачивает клиника.',
                    hint: 'Обработать нужно и животных, и место, где они живут.',
                    payer: 'clinic',
                    options: [
                        {id: 'ulcers', label: 'Обработать язвы антисептиком', cost: 300, isNeeded: true},
                        {id: 'pens', label: 'Продезинфицировать загоны', cost: 600, isNeeded: true},
                        {id: 'mats', label: 'Положить дезковрики на входе', cost: 200, isNeeded: true},
                        {id: 'vitamins', label: 'Витамины всему стаду', cost: 700, isNeeded: false},
                        {id: 'immuno', label: 'Дорогой иммуностимулятор', cost: 1500, isNeeded: false},
                    ],
                    missedEffects: {pigHealth: -10},
                    extraEffects: {},
                    feedback: {
                        exact: 'Язвы обработаны, загоны чистые, на входе дезковрики. Дальше зараза не пойдёт.',
                        missed: 'Что-то упустил: вирус остался там, где его не обработали.',
                        extra: 'Лишнее съело деньги, которые завтра пригодились бы ферме.',
                    },
                },
                {
                    kind: 'story',
                    id: 'evening',
                    title: 'Вечер на ферме',
                    text: 'Пётр Ильич провожает до машины. Завтра контрольный выезд.',
                    variants: [
                        {
                            id: 'holding',
                            when: [{counter: 'pigHealth', min: 60}],
                            title: 'Поросята держатся',
                            text: 'К вечеру новых больных нет. Пётр Ильич впервые за три дня улыбается: «Завтра ждём на контроль».',
                        },
                        {
                            id: 'on-edge',
                            title: 'Ферма на грани',
                            text: 'К вечеру слегли ещё трое. Пётр Ильич молчит. Завтра решится, скольких удастся спасти.',
                        },
                    ],
                },
            ],
        },
    ],
};

/** @type {Shift} */
const VET_SHIFT_THREE = {
    number: 3,
    title: 'Развязка',
    lead: 'Последний выезд на ферму. Сегодня станет ясно, сколько поросят удастся спасти.',
    morning: [
        {
            id: 'cheap-revealed',
            when: [{answer: {activity: 'farm-visit-2', step: 'budget', is: ['cheap-drugs']}}],
            text: 'Пётр Ильич нашёл чек на дешёвые аналоги и позвонил с упрёком.',
            effects: {reputation: REPUTATION.cheapDrugsRevealed},
        },
        {
            id: 'night-decline',
            when: [{counter: 'pigHealth', max: 49}],
            text: 'Ночью двум поросятам стало хуже.',
            effects: {pigHealth: -5},
        },
        {
            id: 'recovery',
            when: [{counter: 'pigHealth', min: 70}],
            text: 'Утром поросята сами подошли к кормушке.',
            effects: {pigHealth: 5},
        },
        {
            id: 'farmer-recommends',
            when: [{counter: 'reputation', min: 60}],
            text: 'Пётр Ильич рассказал о клинике соседу, и тот привёз на осмотр козу.',
            effects: {revenue: 1000},
        },
    ],
    finale: {
        title: 'Глава закончена',
        text: 'Три смены позади.',
    },
    activities: [
        {
            code: 'farm-visit-3',
            roomCode: 'garage',
            title: 'Контрольный выезд',
            place: 'Свиноферма Петра Ильича',
            patient: {name: 'Поросята', model: '/models/pig.glb', isSick: false},
            steps: [
                {
                    kind: 'story',
                    id: 'arrival',
                    title: 'Снова на ферме',
                    text: 'Третий раз по той же грунтовке.',
                    variants: [
                        {
                            id: 'warm',
                            when: [{counter: 'reputation', min: 50}],
                            title: 'Пётр Ильич ждёт',
                            text: 'Пётр Ильич встречает у ворот и сразу ведёт к загонам: «Делай, как скажешь».',
                            effects: {revenue: -500},
                        },
                        {
                            id: 'cold',
                            title: 'Холодный приём',
                            text: 'Пётр Ильич стоит у ворот с соседом и не торопится открывать: «Может, другого врача позвать?»',
                            effects: {revenue: -500},
                        },
                    ],
                },
                {
                    kind: 'checklist',
                    id: 'control',
                    title: 'Контроль',
                    text: 'Что проверишь перед финальной обработкой? Платит клиника.',
                    hint: 'Смотри, заживают ли язвы и нет ли новых больных.',
                    payer: 'clinic',
                    options: [
                        {id: 'temperature', label: 'Измерить температуру всем', cost: 200, isNeeded: true},
                        {id: 'ulcers', label: 'Осмотреть язвы', cost: 0, isNeeded: true},
                        {id: 'new-cases', label: 'Проверить здоровых на новые язвы', cost: 0, isNeeded: true},
                        {id: 'lab', label: 'Повторные пробы в лабораторию', cost: 1500, isNeeded: false},
                        {id: 'xray', label: 'Рентген', cost: 900, isNeeded: false},
                    ],
                    missedEffects: {pigHealth: -10},
                    extraEffects: {},
                    feedback: {
                        exact: 'Язвы подсыхают, новых больных двое. Теперь ясно, кого обрабатывать в первую очередь.',
                        missed: 'Не всех осмотрел: пара больных поросят осталась без помощи.',
                        extra: 'Ответ из лаборатории придёт через неделю, а деньги нужны сегодня.',
                    },
                },
                {
                    kind: 'choice',
                    id: 'course',
                    title: 'Финальная обработка',
                    text: 'Последний шанс помочь поросятам. Чем больше вложишь, тем больше спасёшь.',
                    hint: 'Полный курс сильнее всего, но только если на него хватает денег.',
                    options: [
                        {
                            id: 'full',
                            label: 'Полный курс: антисептики, витамины, дезинфекция',
                            effects: {revenue: -2500, pigHealth: 20},
                            feedback: 'Обработаны все, загоны снова чистые. Сделано всё, что можно.',
                        },
                        {
                            id: 'basic',
                            label: 'Только антисептики',
                            effects: {revenue: -1000, pigHealth: 10},
                            feedback: 'Язвы обработаны, но ослабленным поросятам может не хватить сил.',
                        },
                        {
                            id: 'instructions',
                            label: 'Оставить фермеру инструкции',
                            effects: {pigHealth: -5},
                            feedback: 'Пётр Ильич старается, но без препаратов язвы заживают медленно.',
                        },
                    ],
                },
                {
                    kind: 'choice',
                    id: 'quarantine',
                    title: 'Карантин',
                    text: 'Ещё две недели нельзя вывозить поросят и пускать чужих. Для Петра Ильича это убытки.',
                    hint: 'Согласится ли фермер, зависит от того, доверяет ли он клинике.',
                    options: [
                        {
                            id: 'persuade',
                            label: 'Убедить продлить карантин',
                            requires: [{counter: 'reputation', min: 50}],
                            lockedText: 'Пётр Ильич не доверяет клинике',
                            effects: {pigHealth: 10},
                            feedback: 'Пётр Ильич кивает: «Тебе верю. Две недели — значит две недели».',
                        },
                        {
                            id: 'threaten',
                            label: 'Пригрозить штрафом ветслужбы',
                            effects: {pigHealth: 5},
                            feedback: 'Карантин продлён, но Пётр Ильич обиделся и разговаривает сквозь зубы.',
                        },
                        {
                            id: 'skip',
                            label: 'Не настаивать',
                            effects: {pigHealth: -10},
                            feedback: 'Через неделю Пётр Ильич повёз поросят на рынок, и часть стада заболела снова.',
                        },
                    ],
                },
                {
                    kind: 'story',
                    id: 'outcome',
                    title: 'Итог',
                    text: 'Пора подводить итоги.',
                    variants: [
                        {
                            id: 'saved',
                            when: [{counter: 'pigHealth', min: 70}],
                            title: 'Ферма спасена',
                            text: 'Язвы заживают, новых больных нет. Пётр Ильич жмёт руку и обещает рекомендовать клинику всем фермерам района.',
                            effects: {reputation: REPUTATION.pigsSaved},
                        },
                        {
                            id: 'partial',
                            when: [{counter: 'pigHealth', min: 40}],
                            title: 'Спасли не всех',
                            text: 'Большинство поросят поправляется, но двоих спасти не удалось. Пётр Ильич благодарит, но смотрит в сторону.',
                            effects: {reputation: REPUTATION.pigsLost},
                        },
                        {
                            id: 'heavy-loss',
                            title: 'Тяжёлые потери',
                            text: 'Ящур забрал почти треть стада. Пётр Ильич говорит, что больше не обратится в клинику. Не всех удаётся спасти — это тоже часть профессии.',
                            effects: {reputation: REPUTATION.pigsLost},
                        },
                    ],
                },
            ],
        },
    ],
};

/** @type {Readonly<Record<string, readonly Shift[]>>} */
export const shifts = Object.freeze({
    vet: Object.freeze([VET_SHIFT_ONE, VET_SHIFT_TWO, VET_SHIFT_THREE]),
});

/** @type {Readonly<Record<string, readonly ChapterEnding[]>>} */
export const chapterEndings = Object.freeze({
    vet: Object.freeze([
        {
            id: 'best-clinic',
            when: [
                {answer: {activity: 'farm-visit-3', step: 'outcome', is: ['saved']}},
                {counter: 'reputation', min: 70},
            ],
            title: 'Лучшая клиника района',
            text: 'Поросята спасены, а о клинике говорят и владельцы питомцев, и фермеры. Ты прошёл путь ветеринара от первого звонка до спасённого стада.',
        },
        {
            id: 'farm-saved',
            when: [{answer: {activity: 'farm-visit-3', step: 'outcome', is: ['saved']}}],
            title: 'Ферма спасена',
            text: 'Поросята здоровы, Пётр Ильич доволен. Репутацию клиники ещё есть куда растить, но главное сделано.',
        },
        {
            id: 'hard-lesson',
            when: [{counter: 'reputation', min: 50}],
            title: 'Тяжёлый урок',
            text: 'Часть поросят погибла, но владельцы питомцев по-прежнему доверяют клинике. Ты знаешь, где ошибся, и в следующий раз решишь иначе.',
        },
        {
            id: 'cost-of-mistakes',
            title: 'Цена ошибок',
            text: 'Ферма понесла потери, а о клинике говорят без восторга. Ветеринар каждый день выбирает, кому помочь первым, и иногда эти выборы стоят дорого.',
        },
    ]),
});
