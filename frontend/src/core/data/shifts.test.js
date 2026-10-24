import {describe, expect, it} from 'vitest';
import {SHIFT_COUNT, STORY_ANSWER} from '@/core/constants';
import {
    applyEffects,
    getLockedOptions,
    getStepResult,
    getStoryVariant,
    getAvailableExamOptions,
    getUnaffordableOptionIds,
    meetsConditions,
    pickByConditions,
    startShift,
} from '@/core/utils/shift';
import {createTriageState, resolveTriage} from '@/core/utils/triage';
import {clinicRooms} from './clinic';
import {START_COUNTERS, chapterEndings, shifts} from './shifts';

const allShifts = Object.values(shifts).flat();
const allActivities = allShifts.flatMap((shift) => shift.activities.map((activity) => ({shift, activity})));

describe('shifts', () => {
    it('каждое дело стоит в существующей комнате, и в смене одно дело на комнату', () => {
        allShifts.forEach((shift) => {
            const roomCodes = shift.activities.map((activity) => activity.roomCode);

            expect(new Set(roomCodes).size).toBe(roomCodes.length);
            roomCodes.forEach((code) => expect(clinicRooms.map((room) => room.code)).toContain(code));
        });
    });

    it('на каждом шаге с решением есть подсказки для лёгкой и обычной сложности', () => {
        allActivities
            .flatMap(({activity}) => activity.steps)
            .filter((step) => step.kind !== 'story')
            .forEach((step) => {
                expect(step.hints?.easy, step.id).toBeTruthy();
                expect(step.hints?.normal, step.id).toBeTruthy();
            });
        allShifts.forEach((shift) => expect(shift.hints?.easy).toBeTruthy());
    });

    it('объяснения описывают последствия, а не оценивают игрока', () => {
        const texts = allActivities
            .flatMap(({activity}) => activity.steps)
            .flatMap((step) => [
                ...(step.options ?? []).map((option) => option.feedback ?? ''),
                ...Object.values(step.feedback ?? {}),
            ]);

        texts.forEach((text) => expect(text).not.toMatch(/(^|[^а-яё])(не)?верно|ошиб|ты пропустил/i));
    });

    it('действия осмотра открываются после существующих действий', () => {
        allActivities
            .flatMap(({activity}) => activity.steps)
            .filter((step) => step.kind === 'exam')
            .forEach((step) => {
                const ids = step.options.map((option) => option.id);

                step.options.flatMap((option) => option.after ?? []).forEach((id) => expect(ids).toContain(id));
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
        ...clinicRooms.flatMap((room) => room.unlock ?? []),
        ...allActivities.flatMap(({activity}) => activity.requires ?? []),
    ];
}

/**
 * Прогон главы без интерфейса: pick решает за игрока на шагах выбора и обследования.
 * @param {(step: ShiftStep, state: ShiftState) => string | string[]} pick
 * @returns {ShiftState}
 */
function playChapter(pick, triagePlan) {
    const initial = {
        version: 2,
        shift: 0,
        difficulty: 'Normal',
        counters: {...START_COUNTERS},
        completedActivities: [],
        answers: {},
        morning: {},
    };

    return shifts.vet.reduce((chapterState, shift) => {
        const shiftState = startShift(chapterState, shift);

        return shift.activities.reduce((activityState, activity) => {
            const room = clinicRooms.find((item) => item.code === activity.roomCode);

            expect(meetsConditions(room.unlock, activityState), `${activity.code}: комната`).toBe(true);
            expect(meetsConditions(activity.requires, activityState), `${activity.code}: условия`).toBe(true);

            if (activity.kind === 'triage') {
                const [doctor, assistant] = triagePlan;
                const triage = {...createTriageState(0), assignments: {doctor, assistant}};
                const result = resolveTriage(triage);

                return {
                    ...activityState,
                    counters: applyEffects(activityState.counters, result.effects),
                    answers: {
                        ...activityState.answers,
                        [activity.code]: {triage: {...triage, outcomeId: result.outcomeId}},
                    },
                };
            }

            return activity.steps.reduce((state, step) => {
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
            }, activityState);
        }, shiftState);
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

        if (step.kind === 'exam') {
            return direction > 0 ? examEverything(step) : [getAvailableExamOptions(step, [])[0].id];
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

/**
 * @param {import('@/core/types/shift').ExamStep} step
 * @returns {string[]}
 */
function examEverything(step) {
    let picked = [];

    while (picked.length < step.options.length) {
        const next = getAvailableExamOptions(step, picked).find((option) => !picked.includes(option.id));

        if (!next) {
            return picked;
        }

        picked = [...picked, next.id];
    }

    return picked;
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
                const activity = allActivities.find((item) => item.activity.code === answer.activity)?.activity;

                if (activity?.kind === 'triage') {
                    expect(answer.step).toBe('triage');

                    return;
                }

                const step = allSteps.find(
                    (item) => item.activity.code === answer.activity && item.step.id === answer.step,
                )?.step;

                expect(step, `${answer.activity}/${answer.step}`).toBeDefined();
                expect(getAnswerIds(step)).toEqual(expect.arrayContaining(answer.is ?? []));
            });
    });

    it('у вариантов сцен и финалов главы есть запасной вариант без условий', () => {
        const groups = [...allSteps.map(({step}) => step.variants).filter(Boolean), ...Object.values(chapterEndings)];

        groups.forEach((group) => expect(group.at(-1).when).toBeUndefined());
    });

    it('лучшие решения спасают ферму, и на прививки хватает денег', () => {
        const state = playChapter(pickBy(1), ['dog', 'rabbit']);

        expect(state.answers['farm-visit-2'].vaccination).toBe('all-now');
        expect(state.answers['farm-visit-3'].outcome).toBe('saved');
        expect(['clinic-thrives', 'farm-saved']).toContain(pickByConditions(chapterEndings.vet, state)?.id);
    });

    it('если очередь отняла деньги, привить всех клинике не по карману', () => {
        let lockedIds = [];
        const pick = (step, current) => {
            if (step.id === 'vaccination') {
                lockedIds = getUnaffordableOptionIds(step.options, current.counters.revenue);
            }

            return pickBy(1)(step, current);
        };

        playChapter(pick, ['rabbit', 'cat']);

        expect(lockedIds).toContain('all-now');
    });

    it('честная передача фермы ведёт к средней концовке', () => {
        const state = playChapter(
            (step, current) => (step.id === 'vaccination' ? 'hand-over' : pickBy(1)(step, current)),
            ['dog', 'rabbit'],
        );

        expect(state.answers['farm-visit-3'].outcome).toBe('handed-over');
        expect(pickByConditions(chapterEndings.vet, state)?.id).toBe('honest-handover');
    });

    it('худшие решения ведут к потерям, но не к концу игры', () => {
        const state = playChapter(pickBy(-1), ['cat', 'rabbit']);

        expect(state.answers['farm-visit-3'].outcome).toBe('heavy-loss');
        expect(pickByConditions(chapterEndings.vet, state)).not.toBeNull();
    });
});
