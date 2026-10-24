/** @typedef {import('@/core/types/shift').Counters} Counters */
/** @typedef {import('@/core/types/shift').Effects} Effects */
/** @typedef {import('@/core/types/shift').ShiftStep} ShiftStep */
/** @typedef {import('@/core/types/shift').ChecklistStep} ChecklistStep */
/** @typedef {import('@/core/types/shift').ChoiceOption} ChoiceOption */
/** @typedef {import('@/core/types/shift').StepAnswer} StepAnswer */
/** @typedef {import('@/core/types/shift').ActivityAnswers} ActivityAnswers */
/** @typedef {import('@/core/types/shift').StepResult} StepResult */

const PERCENT_MAX = 100;

/** @type {Readonly<Record<keyof Counters, {min: number, max: number}>>} */
const COUNTER_LIMITS = Object.freeze({
    revenue: {min: 0, max: Infinity},
    reputation: {min: 0, max: 100},
    pigHealth: {min: 0, max: 100},
});

/**
 * @param {number} value
 * @param {{min: number, max: number}} limits
 * @returns {number}
 */
function clamp(value, {min, max}) {
    return Math.min(max, Math.max(min, value));
}

/**
 * @param {Effects[]} effectsList
 * @returns {Effects}
 */
export function mergeEffects(...effectsList) {
    return effectsList.reduce((merged, effects) => {
        const next = {...merged};

        Object.entries(effects).forEach(([counter, value]) => {
            next[counter] = (next[counter] ?? 0) + value;
        });

        return next;
    }, {});
}

/**
 * @param {Counters} counters
 * @param {Effects} effects
 * @returns {Counters}
 */
export function applyEffects(counters, effects) {
    return Object.fromEntries(
        Object.entries(counters).map(([counter, value]) => [
            counter,
            clamp(value + (effects[counter] ?? 0), COUNTER_LIMITS[counter]),
        ]),
    );
}

/**
 * @param {ChecklistStep} step
 * @param {readonly string[]} selectedIds
 * @returns {number}
 */
export function getChecklistCost(step, selectedIds) {
    return step.options
        .filter((option) => selectedIds.includes(option.id))
        .reduce((total, option) => total + option.cost, 0);
}

/**
 * Сколько можно потратить на обследование: деньги владельца или касса клиники.
 * @param {ChecklistStep} step
 * @param {number} revenue
 * @returns {number}
 */
export function getChecklistBudget(step, revenue) {
    return step.payer === 'owner' ? (step.budget ?? Infinity) : revenue;
}

/**
 * @param {ChecklistStep} step
 * @param {readonly string[]} selectedIds
 * @returns {StepResult}
 */
function getChecklistResult(step, selectedIds) {
    const cost = getChecklistCost(step, selectedIds);
    const isMissed = step.options.some((option) => option.isNeeded && !selectedIds.includes(option.id));
    const isExtra = step.options.some((option) => !option.isNeeded && selectedIds.includes(option.id));
    const costEffects = {revenue: step.payer === 'owner' ? cost : -cost};

    if (!isMissed && !isExtra) {
        return {effects: costEffects, feedback: step.feedback.exact};
    }

    return {
        effects: mergeEffects(costEffects, isMissed ? step.missedEffects : {}, isExtra ? step.extraEffects : {}),
        feedback: [isMissed && step.feedback.missed, isExtra && step.feedback.extra].filter(Boolean).join(' '),
    };
}

/**
 * Что даёт ответ на шаг: изменение счётчиков и объяснение.
 * @param {ShiftStep} step
 * @param {StepAnswer} answer
 * @returns {StepResult}
 */
export function getStepResult(step, answer) {
    if (step.kind === 'checklist') {
        return getChecklistResult(step, Array.isArray(answer) ? answer : []);
    }

    if (step.kind === 'choice') {
        const option = step.options.find((item) => item.id === answer);

        return {effects: option?.effects ?? {}, feedback: option?.feedback ?? ''};
    }

    return {effects: step.effects ?? {}, feedback: ''};
}

/**
 * Варианты, на которые не хватает денег. Если не хватает ни на один — доступны все, чтобы смена не встала.
 * @param {readonly ChoiceOption[]} options
 * @param {number} revenue
 * @returns {string[]}
 */
export function getUnaffordableOptionIds(options, revenue) {
    const unaffordableIds = options
        .filter((option) => revenue + (option.effects.revenue ?? 0) < 0)
        .map((option) => option.id);

    return unaffordableIds.length === options.length ? [] : unaffordableIds;
}

/**
 * Индекс первого шага без ответа; если ответы есть на всё — последний шаг.
 * @param {readonly ShiftStep[]} steps
 * @param {ActivityAnswers} answers
 * @returns {number}
 */
export function getOpenStepIndex(steps, answers) {
    const index = steps.findIndex((step) => !(step.id in answers));

    return index === -1 ? steps.length - 1 : index;
}

/**
 * @param {readonly ShiftStep[]} steps
 * @param {ActivityAnswers} answers
 * @returns {boolean}
 */
export function isActivityFinished(steps, answers) {
    return steps.every((step) => step.id in answers);
}

/**
 * Процент главы: пройденные смены плюс доля закрытых дел текущей.
 * @param {{shiftNumber: number, completedCount: number, activityCount: number, shiftCount: number}} progress
 * @returns {number}
 */
export function getChapterPercent({shiftNumber, completedCount, activityCount, shiftCount}) {
    const shiftShare = activityCount ? completedCount / activityCount : 0;

    return Math.round(((shiftNumber - 1 + shiftShare) / shiftCount) * PERCENT_MAX);
}
