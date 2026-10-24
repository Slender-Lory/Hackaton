/**
 * Счётчики главы (ТЗ 2.4.3).
 * @typedef {object} Counters
 * @property {number} revenue выручка клиники, ₽
 * @property {number} reputation 0–100
 * @property {number} pigHealth здоровье поросят, 0–100
 */

/**
 * Изменение счётчиков: только те, что меняются.
 * @typedef {Partial<Counters>} Effects
 */

/**
 * Условие по состоянию главы: счётчик в границах (включительно) или ответ, данный раньше.
 * @typedef {object} Condition
 * @property {keyof Counters} [counter]
 * @property {number} [min]
 * @property {number} [max]
 * @property {{activity: string, step: string, is?: string[]}} [answer] на шаг ответили; с is — одним из вариантов
 */

/**
 * Подсказки по сложности: на лёгкой — подробная, на обычной — намёк, на сложной подсказок нет.
 * @typedef {object} Hints
 * @property {string} easy
 * @property {string} normal
 */

/**
 * @typedef {'bone' | 'hand' | 'grab' | 'shield' | 'towel' | 'eye' | 'ear' | 'paw' | 'thermometer'
 *     | 'stethoscope' | 'scale' | 'feather' | 'search'} ActionIcon
 */

/**
 * Измерение, которое открывается при осмотре или анализе и попадает в карту пациента.
 * @typedef {object} VitalReading
 * @property {string} vital id показателя из ActivityPatient.vitals
 * @property {string} value
 * @property {boolean} [isAbnormal]
 */

/**
 * Вариант выбора: эффект и что из этого вышло.
 * @typedef {object} ChoiceOption
 * @property {string} id
 * @property {string} label
 * @property {ActionIcon} [icon] невербальное действие — иконка вместо реплики
 * @property {Effects} effects
 * @property {string} feedback
 * @property {Condition[]} [requires] без них вариант закрыт
 * @property {string} [lockedText] почему закрыт: показывается на варианте
 */

/**
 * Действие осмотра: сразу показывает находку.
 * @typedef {object} ExamOption
 * @property {string} id
 * @property {string} label
 * @property {ActionIcon} [icon]
 * @property {string} finding что увидел ветеринар
 * @property {VitalReading[]} [reveals]
 * @property {string[]} [after] появляется только после этих действий: «уши горячие» → «измерить температуру»
 * @property {Effects} [effects]
 */

/**
 * Процедура или анализ: стоит денег, результат попадает в карту.
 * @typedef {object} ChecklistOption
 * @property {string} id
 * @property {string} label
 * @property {number} cost ₽
 * @property {boolean} isNeeded
 * @property {string} [finding] результат
 * @property {VitalReading[]} [reveals]
 */

/**
 * Кто говорит в сцене: реплика показывается с именем и ролью.
 * @typedef {object} Speaker
 * @property {string} name
 * @property {string} role
 */

/**
 * Вариант сцены: срабатывает первый, чьи условия выполнены. Последний вариант — без условий.
 * @typedef {object} StoryVariant
 * @property {string} id
 * @property {Condition[]} [when]
 * @property {string} title
 * @property {string} text
 * @property {Speaker} [speaker]
 * @property {Effects} [effects]
 */

/**
 * Сцена. С variants текст и эффект зависят от того, как прошла глава; ответом сохраняется id варианта.
 * @typedef {object} StoryStep
 * @property {boolean} [patientPresent] false для звонков и разговоров до встречи с пациентом
 * @property {'story'} kind
 * @property {string} id
 * @property {string} title
 * @property {string} text
 * @property {Speaker} [speaker]
 * @property {Effects} [effects]
 * @property {StoryVariant[]} [variants]
 * @property {Hints} [hints] сцена вместо выбора: подсказка объясняет, почему поступили так
 */

/**
 * @typedef {object} ChoiceStep
 * @property {'choice'} kind
 * @property {string} id
 * @property {string} title
 * @property {string} text
 * @property {Speaker} [speaker]
 * @property {Hints} hints
 * @property {ChoiceOption[]} options
 */

/**
 * Осмотр перед назначением: игрок сам решает, что проверить, и видит находки. Ответ — id действий по порядку.
 * @typedef {object} ExamStep
 * @property {'exam'} kind
 * @property {string} id
 * @property {string} title
 * @property {string} text
 * @property {Hints} hints
 * @property {ExamOption[]} options
 */

/**
 * Анализы или процедуры: бюджет ограничен, лишнее стоит денег и доверия, пропуск нужного — здоровья.
 * @typedef {object} ChecklistStep
 * @property {'checklist'} kind
 * @property {string} id
 * @property {string} title
 * @property {string} text
 * @property {Hints} hints
 * @property {'clinic' | 'owner'} payer клиника тратит выручку, владелец — платит клинике
 * @property {number} [budget] сколько готов потратить владелец, ₽
 * @property {ChecklistOption[]} options
 * @property {Effects} missedEffects что будет, если пропустить нужное
 * @property {Effects} extraEffects что будет за лишние процедуры
 * @property {{exact: string, missed: string, extra: string}} feedback что из этого вышло — без оценок игрока
 */

/** @typedef {StoryStep | ChoiceStep | ExamStep | ChecklistStep} ShiftStep */

/**
 * Показатель в карте пациента. value — известен заранее (из паспорта), остальное открывает осмотр.
 * @typedef {object} Vital
 * @property {string} id
 * @property {string} label
 * @property {string} norm
 * @property {string} [value]
 */

/**
 * @typedef {object} Vaccination
 * @property {string} name
 * @property {string} date ISO-дата
 */

/**
 * Паспорт животного: открывается в любой момент дела.
 * @typedef {object} Passport
 * @property {string} species
 * @property {string} [breed]
 * @property {string} [sex]
 * @property {string} birthDate ISO-дата или год
 * @property {string} owner
 * @property {Vaccination[]} vaccinations
 * @property {string[]} history чем болел раньше
 * @property {string} complaint с чем пришли
 */

/**
 * Болезнь поросёнка: от неё зависят пометки на 2D-иллюстрации.
 * @typedef {'urticaria' | 'septic' | 'lame' | 'fever' | 'carrier'} PigCondition
 */

/**
 * Поросёнок из стада: в карточке пациента их листают.
 * @typedef {object} HerdPig
 * @property {string} id
 * @property {string} name
 * @property {PigCondition} condition
 * @property {string} label что с ним
 * @property {string} note что видно при взгляде
 */

/**
 * Пациент: 2D-иллюстрация по виду животного. У стада — несколько поросят.
 * @typedef {object} ActivityPatient
 * @property {string} id
 * @property {string} name
 * @property {'dog' | 'cat' | 'pig'} kind
 * @property {HerdPig[]} [herd]
 * @property {boolean} isSick
 * @property {Passport} passport
 * @property {Vital[]} vitals
 */

/**
 * Дело смены: приём, выезд. Привязано к комнате на плане клиники.
 * @typedef {object} ShiftActivity
 * @property {string} code
 * @property {'triage'} [kind] очередь из трёх пациентов: своя сцена вместо шагов, состояние — в answers[code].triage
 * @property {string} roomCode
 * @property {string} title
 * @property {string} place
 * @property {ActivityPatient} patient
 * @property {Condition[]} [requires] до этого дело ждёт
 * @property {string} [lockedText] чего ждёт
 * @property {ShiftStep[]} steps
 */

/**
 * Что случилось за ночь: применяется один раз в начале смены, если выполнены условия.
 * @typedef {object} MorningEvent
 * @property {string} id
 * @property {Condition[]} [when]
 * @property {string} text
 * @property {Effects} [effects]
 */

/**
 * @typedef {object} Shift
 * @property {number} number
 * @property {string} title
 * @property {string} lead
 * @property {Hints} hints с чего начать смену
 * @property {MorningEvent[]} [morning]
 * @property {ShiftActivity[]} activities
 * @property {{title: string, text: string}} finale
 */

/**
 * Финал главы: срабатывает первый, чьи условия выполнены. Последний — без условий.
 * @typedef {object} ChapterEnding
 * @property {string} id
 * @property {Condition[]} [when]
 * @property {string} title
 * @property {string} text
 */

/**
 * Ответ на шаг: id варианта, список id процедур или действий осмотра, STORY_ANSWER для прочитанной сцены.
 * @typedef {string | string[]} StepAnswer
 */

/**
 * Ответы игрока по делу: id шага → ответ. Шаг с ответом пройден.
 * @typedef {Record<string, StepAnswer>} ActivityAnswers
 */

/**
 * Состояние главы в Progress.state: из него игра продолжается после перезагрузки и на другом устройстве.
 * @typedef {object} ShiftState
 * @property {number} version
 * @property {number} shift номер текущей смены
 * @property {import('@/core/types/player').Difficulty | null} difficulty null — ещё не выбрана
 * @property {Counters} counters
 * @property {string[]} completedActivities
 * @property {Record<string, ActivityAnswers>} answers
 * @property {Record<string, string[]>} morning номер смены → id утренних событий, которые сработали
 */

/**
 * @typedef {object} StepResult
 * @property {Effects} effects
 * @property {string} feedback
 */

/**
 * Запись в карте пациента: находка осмотра или результат анализа.
 * @typedef {object} ChartFinding
 * @property {string} id
 * @property {string} source шаг, на котором найдено: «Осмотр», «Анализы»
 * @property {string} label
 * @property {string} text
 */

/**
 * Карта пациента, собранная из ответов: что нашли и что измерили.
 * @typedef {object} PatientChart
 * @property {ChartFinding[]} findings
 * @property {Record<string, VitalReading>} readings показатель → последнее измерение
 */

export {};
