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
 * @typedef {'bone' | 'hand' | 'grab' | 'shield' | 'towel'} ActionIcon
 */

/**
 * Вариант выбора: эффект и объяснение, почему так.
 * @typedef {object} ChoiceOption
 * @property {string} id
 * @property {string} label
 * @property {ActionIcon} [icon] невербальное действие — иконка вместо реплики
 * @property {Effects} effects
 * @property {string} feedback
 */

/**
 * Процедура в списке обследований.
 * @typedef {object} ChecklistOption
 * @property {string} id
 * @property {string} label
 * @property {number} cost ₽
 * @property {boolean} isNeeded
 */

/**
 * @typedef {object} StoryStep
 * @property {'story'} kind
 * @property {string} id
 * @property {string} title
 * @property {string} text
 * @property {Effects} [effects]
 */

/**
 * @typedef {object} ChoiceStep
 * @property {'choice'} kind
 * @property {string} id
 * @property {string} title
 * @property {string} text
 * @property {string} hint
 * @property {ChoiceOption[]} options
 */

/**
 * Обследование: бюджет ограничен, лишнее снижает репутацию, пропуск важного — вредит пациенту.
 * @typedef {object} ChecklistStep
 * @property {'checklist'} kind
 * @property {string} id
 * @property {string} title
 * @property {string} text
 * @property {string} hint
 * @property {'clinic' | 'owner'} payer клиника тратит выручку, владелец — платит клинике
 * @property {number} [budget] сколько готов потратить владелец, ₽
 * @property {ChecklistOption[]} options
 * @property {Effects} missedEffects что будет, если пропустить нужное
 * @property {Effects} extraEffects что будет за лишние процедуры
 * @property {{exact: string, missed: string, extra: string}} feedback
 */

/** @typedef {StoryStep | ChoiceStep | ChecklistStep} ShiftStep */

/**
 * Пациент сцены: 3D-модель из public/models.
 * @typedef {object} ActivityPatient
 * @property {string} name
 * @property {string} model
 * @property {boolean} isSick
 */

/**
 * Дело смены: приём, выезд. Привязано к комнате на плане клиники.
 * @typedef {object} ShiftActivity
 * @property {string} code
 * @property {string} roomCode
 * @property {string} title
 * @property {string} place
 * @property {ActivityPatient} patient
 * @property {ShiftStep[]} steps
 */

/**
 * @typedef {object} Shift
 * @property {number} number
 * @property {string} title
 * @property {string} lead
 * @property {ShiftActivity[]} activities
 * @property {{title: string, text: string}} finale
 */

/**
 * Ответ на шаг: id варианта, список id процедур или STORY_ANSWER для прочитанной сцены.
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
 * @property {Counters} counters
 * @property {string[]} completedActivities
 * @property {Record<string, ActivityAnswers>} answers
 */

/**
 * @typedef {object} StepResult
 * @property {Effects} effects
 * @property {string} feedback
 */

export {};
