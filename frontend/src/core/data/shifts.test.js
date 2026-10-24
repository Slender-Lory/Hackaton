import {describe, expect, it} from 'vitest';
import {SHIFT_COUNT, STORY_ANSWER} from '@/core/constants';
import {
    applyEffects,
    getLockedOptions,
    getStepResult,
    getStoryVariant,
    getUnaffordableOptionIds,
    pickByConditions,
    startShift,
} from '@/core/utils/shift';
import {clinicRooms} from './clinic';
import {START_COUNTERS, chapterEndings, shifts} from './shifts';

const allShifts = Object.values(shifts).flat();
const allActivities = allShifts.flatMap((shift) => shift.activities.map((activity) => ({shift, activity})));

describe('shifts', () => {
    it('каждое дело стоит в комнате, открытой на этой смене', () => {
        allActivities.forEach(({shift, activity}) => {
            const room = clinicRooms.find((item) => item.code === activity.roomCode);

            expect(room?.unlockShift).toBeLessThanOrEqual(shift.number);
        });
    });

    it('коды дел и шагов внутри дела уникальны', () => {
        const codes = allActivities.map(({activity}) => activity.code);

        expect(new Set(codes).size).toBe(codes.length);
        allActivities.forEach(({activity}) => {
            const stepIds = activity.steps.map((step) => step.id);

            expect(new Set(stepIds).size).toBe(stepIds.length);
        });
    });

    it('у обследования владельца хватает бюджета на все нужные процедуры', () => {
        allActivities
            .flatMap(({activity}) => activity.steps)
            .filter((step) => step.kind === 'checklist' && step.payer === 'owner')
            .forEach((step) => {
                const neededCost = step.options
                    .filter((option) => option.isNeeded)
                    .reduce((total, option) => total + option.cost, 0);

                expect(neededCost).toBeLessThanOrEqual(step.budget ?? Infinity);
            });
    });
});

/** @typedef {import('@/core/types/shift').ShiftState} ShiftState */
/** @typedef {import('@/core/types/shift').ShiftStep} ShiftStep */

const allSteps = allActivities.flatMap(({activity}) => activity.steps.map((step) => ({activity, step})));

/**
 * @param {ShiftStep} step
 * @returns {string[]}
 */
function getAnswerIds(step) {
    if (step.kind === 'story') {
        return step.variants?.map((variant) => variant.id) ?? [STORY_ANSWER];
    }

    return step.options.map((option) => option.id);
}

function getAllConditions() {
    return [
        ...allShifts.flatMap((shift) => shift.morning ?? []).flatMap((event) => event.when ?? []),
        ...allSteps.flatMap(({step}) => step.variants ?? []).flatMap((variant) => variant.when ?? []),
        ...allSteps.flatMap(({step}) => step.options ?? []).flatMap((option) => option.requires ?? []),
        ...Object.values(chapterEndings)
            .flat()
            .flatMap((ending) => ending.when ?? []),
    ];
}

/**
 * Прогон главы без интерфейса: pick решает за игрока на шагах выбора и обследования.
 * @param {(step: ShiftStep, state: ShiftState) => string | string[]} pick
 * @returns {ShiftState}
 */
function playChapter(pick) {
    const initial = {
        version: 1,
        shift: 0,
        counters: {...START_COUNTERS},
        completedActivities: [],
        answers: {},
        morning: {},
    };

    return shifts.vet.reduce((chapterState, shift) => {
        const shiftState = startShift(chapterState, shift);

        return shift.activities.reduce(
            (activityState, activity) =>
                activity.steps.reduce((state, step) => {
                    const answer =
                        step.kind === 'story'
                            ? (getStoryVariant(step, state, null)?.id ?? STORY_ANSWER)
                            : pick(step, state);

                    return {
                        ...state,
                        counters: applyEffects(state.counters, getStepResult(step, answer).effects),
                        answers: {
                            ...state.answers,
                            [activity.code]: {...state.answers[activity.code], [step.id]: answer},
                        },
                    };
                }, activityState),
            shiftState,
        );
    }, initial);
}

/**
 * @param {1 | -1} direction 1 — лучший вариант для поросят и репутации, -1 — худший
 * @returns {(step: ShiftStep, state: ShiftState) => string | string[]}
 */
function pickBy(direction) {
    return (step, state) => {
        if (step.kind === 'checklist') {
            return direction > 0
                ? step.options.filter((option) => option.isNeeded).map((option) => option.id)
                : [step.options.find((option) => !option.isNeeded).id];
        }

        const closedIds = [
            ...Object.keys(getLockedOptions(step.options, state)),
            ...getUnaffordableOptionIds(step.options, state.counters.revenue),
        ];
        const score = (option) => direction * ((option.effects.pigHealth ?? 0) + (option.effects.reputation ?? 0));

        return step.options
            .filter((option) => !closedIds.includes(option.id))
            .reduce((best, option) => (score(option) > score(best) ? option : best)).id;
    };
}

describe('сюжет главы', () => {
    it('смены идут по порядку от первой до последней', () => {
        expect(shifts.vet.map((shift) => shift.number)).toEqual(
            Array.from({length: SHIFT_COUNT}, (_, index) => index + 1),
        );
    });

    it('условия ссылаются на существующие дела, шаги и ответы', () => {
        getAllConditions()
            .filter((condition) => condition.answer)
            .forEach(({answer}) => {
                const step = allSteps.find(
                    (item) => item.activity.code === answer.activity && item.step.id === answer.step,
                )?.step;

                expect(step).toBeDefined();
                expect(getAnswerIds(step)).toEqual(expect.arrayContaining(answer.is));
            });
    });

    it('у вариантов сцен и финалов главы есть запасной вариант без условий', () => {
        const groups = [...allSteps.map(({step}) => step.variants).filter(Boolean), ...Object.values(chapterEndings)];

        groups.forEach((group) => expect(group.at(-1).when).toBeUndefined());
    });

    it('лучшие решения спасают ферму', () => {
        const state = playChapter(pickBy(1));

        expect(state.answers['farm-visit-3'].outcome).toBe('saved');
        expect(['best-clinic', 'farm-saved']).toContain(pickByConditions(chapterEndings.vet, state)?.id);
    });

    it('худшие решения ведут к потерям, но не к концу игры', () => {
        const state = playChapter(pickBy(-1));

        expect(state.answers['farm-visit-3'].outcome).toBe('heavy-loss');
        expect(pickByConditions(chapterEndings.vet, state)).not.toBeNull();
    });
});
