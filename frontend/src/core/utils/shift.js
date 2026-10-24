/** @typedef {import('@/core/types/shift').Counters} Counters */
/** @typedef {import('@/core/types/shift').Effects} Effects */
/** @typedef {import('@/core/types/shift').ShiftStep} ShiftStep */
/** @typedef {import('@/core/types/shift').ChecklistStep} ChecklistStep */
/** @typedef {import('@/core/types/shift').ChoiceOption} ChoiceOption */
/** @typedef {import('@/core/types/shift').StepAnswer} StepAnswer */
/** @typedef {import('@/core/types/shift').ActivityAnswers} ActivityAnswers */
/** @typedef {import('@/core/types/shift').StepResult} StepResult */
/** @typedef {import('@/core/types/shift').Condition} Condition */
/** @typedef {import('@/core/types/shift').StoryStep} StoryStep */
/** @typedef {import('@/core/types/shift').StoryVariant} StoryVariant */
/** @typedef {import('@/core/types/shift').Shift} Shift */
/** @typedef {import('@/core/types/shift').ShiftState} ShiftState */
/** @typedef {import('@/core/types/shift').Hints} Hints */
/** @typedef {import('@/core/types/shift').ExamStep} ExamStep */
/** @typedef {import('@/core/types/shift').ExamOption} ExamOption */
/** @typedef {import('@/core/types/shift').PatientChart} PatientChart */
/** @typedef {import('@/core/types/player').Difficulty} Difficulty */

const PERCENT_MAX = 100;
const DEFAULT_DIFFICULTY = 'Normal';

/** @type {Readonly<Partial<Record<Difficulty, keyof Hints>>>} */
const HINT_LEVELS = Object.freeze({Easy: 'easy', Normal: 'normal'});

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

    if (step.kind === 'exam') {
        const pickedIds = Array.isArray(answer) ? answer : [];
        const picked = step.options.filter((option) => pickedIds.includes(option.id));

        return {effects: mergeEffects(...picked.map((option) => option.effects ?? {})), feedback: ''};
    }

    if (step.variants) {
        const variant = step.variants.find((item) => item.id === answer);

        return {effects: variant?.effects ?? {}, feedback: ''};
    }

    return {effects: step.effects ?? {}, feedback: ''};
}

/**
 * @param {Condition} condition
 * @param {ShiftState} state
 * @returns {boolean}
 */
function meetsCondition({counter, min = -Infinity, max = Infinity, answer}, state) {
    if (counter && (state.counters[counter] < min || state.counters[counter] > max)) {
        return false;
    }

    if (!answer) {
        return true;
    }

    const given = state.answers[answer.activity]?.[answer.step];

    if (given === undefined) {
        return false;
    }

    const givenIds = Array.isArray(given) ? given : [given];

    return !answer.is || givenIds.some((id) => answer.is.includes(id));
}

/**
 * @param {readonly Condition[] | undefined} conditions
 * @param {ShiftState} state
 * @returns {boolean}
 */
export function meetsConditions(conditions, state) {
    return (conditions ?? []).every((condition) => meetsCondition(condition, state));
}

/**
 * Первый элемент, чьи условия when выполнены: вариант сцены, финал главы.
 * @template {{when?: Condition[]}} T
 * @param {readonly T[]} items
 * @param {ShiftState} state
 * @returns {T | null}
 */
export function pickByConditions(items, state) {
    return items.find((item) => meetsConditions(item.when, state)) ?? null;
}

/**
 * Вариант сцены: уже показанный, если на шаг ответили, иначе — подходящий сейчас.
 * @param {StoryStep} step
 * @param {ShiftState} state
 * @param {StepAnswer | null} answer
 * @returns {StoryVariant | null}
 */
export function getStoryVariant(step, state, answer) {
    if (!step.variants) {
        return null;
    }

    if (answer !== null) {
        return step.variants.find((variant) => variant.id === answer) ?? null;
    }

    return pickByConditions(step.variants, state);
}

/**
 * Варианты выбора, закрытые условиями: id → почему закрыт.
 * @param {readonly ChoiceOption[]} options
 * @param {ShiftState} state
 * @returns {Record<string, string>}
 */
export function getLockedOptions(options, state) {
    return Object.fromEntries(
        options
            .filter((option) => !meetsConditions(option.requires, state))
            .map((option) => [option.id, option.lockedText ?? 'Сейчас недоступно']),
    );
}

/**
 * Начало смены: утренние события проверяются по итогам прошлого дня и применяются один раз.
 * @param {ShiftState} state
 * @param {Shift} shift
 * @returns {ShiftState}
 */
export function startShift(state, shift) {
    const events = (shift.morning ?? []).filter((event) => meetsConditions(event.when, state));

    return {
        ...state,
        shift: shift.number,
        counters: applyEffects(state.counters, mergeEffects(...events.map((event) => event.effects ?? {}))),
        morning: {...state.morning, [shift.number]: events.map((event) => event.id)},
    };
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

/**
 * Подсказка под сложность. На сложной подсказок нет.
 * @param {Hints | undefined} hints
 * @param {Difficulty | null} difficulty
 * @returns {string | null}
 */
export function getHint(hints, difficulty) {
    const level = HINT_LEVELS[difficulty ?? DEFAULT_DIFFICULTY];

    return level ? (hints?.[level] ?? null) : null;
}

/**
 * Действия осмотра, доступные сейчас: те, что открываются после других, ждут своей очереди.
 * @param {ExamStep} step
 * @param {readonly string[]} pickedIds
 * @returns {ExamOption[]}
 */
export function getAvailableExamOptions(step, pickedIds) {
    return step.options.filter((option) => (option.after ?? []).every((id) => pickedIds.includes(id)));
}

/**
 * Карта пациента из ответов главы: находки осмотров и результаты анализов по порядку, последние измерения.
 * @param {readonly Shift[]} chapter
 * @param {ShiftState} state
 * @param {string} patientId
 * @returns {PatientChart}
 */
export function getPatientChart(chapter, state, patientId) {
    const entries = chapter
        .flatMap((shift) => shift.activities)
        .filter((activity) => activity.patient.id === patientId)
        .flatMap((activity) =>
            activity.steps
                .filter((step) => step.kind === 'exam' || step.kind === 'checklist')
                .flatMap((step) => {
                    const answer = state.answers[activity.code]?.[step.id];
                    const pickedIds = Array.isArray(answer) ? answer : [];

                    return pickedIds
                        .map((id) => step.options.find((option) => option.id === id))
                        .filter((option) => option?.finding)
                        .map((option) => ({activity, step, option}));
                }),
        );

    return {
        findings: entries.map(({activity, step, option}) => ({
            id: `${activity.code}/${step.id}/${option.id}`,
            source: step.title,
            label: option.label,
            text: option.finding,
        })),
        readings: Object.fromEntries(
            entries.flatMap(({option}) => (option.reveals ?? []).map((reading) => [reading.vital, reading])),
        ),
    };
}
