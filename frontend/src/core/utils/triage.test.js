import {describe, expect, it} from 'vitest';
import {TRIAGE_OUTCOMES} from '@/core/data/triage';
import {
    assignTriagePatient,
    completeTimedOutAssignment,
    createTriageState,
    getRemainingSeconds,
    getWaitingPatient,
    isTriageState,
    resolveTriage,
} from './triage';

const PLANS = [
    ['dog', 'rabbit', 'accept', 'dog-rabbit', true, true],
    ['dog', 'cat', 'accept', 'dog-cat', true, false],
    ['rabbit', 'dog', 'accept', 'rabbit-dog', true, true],
    ['cat', 'dog', 'accept', 'cat-dog', true, false],
    ['rabbit', 'cat', 'accept', 'rabbit-cat', false, false],
    ['cat', 'rabbit', 'accept', 'cat-rabbit', false, false],
    ['dog', 'cat', 'refer', 'rabbit-refused', true, false],
    ['dog', 'rabbit', 'refer', 'cat-refused', true, true],
];

function makeState(doctor, assistant, waitingDecision = 'accept') {
    return {...createTriageState(1000), assignments: {doctor, assistant}, waitingDecision};
}

describe('resolveTriage', () => {
    it.each(PLANS)('%s / %s / %s → %s', (doctor, assistant, decision, outcomeId, dogHelped, correctPriority) => {
        const result = resolveTriage(makeState(doctor, assistant, decision));
        expect(result.outcomeId).toBe(outcomeId);
        expect(result.flags.dogHelped).toBe(dogHelped);
        expect(result.flags.correctPriority).toBe(correctPriority);
        expect(result.effects.reputation).toBe(result.reputationEvents.reduce((sum, event) => sum + event.value, 0));
        expect(result.patientOutcomes.dog).toBe(dogHelped ? 'stable' : 'worse');
    });

    it('все 12 допустимых распределений дают ровно восемь исходов', () => {
        const outcomes = new Set();
        for (const doctor of ['dog', 'rabbit', 'cat']) {
            for (const assistant of ['dog', 'rabbit', 'cat'].filter((patient) => patient !== doctor)) {
                for (const decision of ['accept', 'refer']) {
                    const result = resolveTriage(makeState(doctor, assistant, decision));
                    outcomes.add(result.outcomeId);
                    expect(result.feedback).toBeTruthy();
                    expect(Number.isFinite(result.effects.reputation)).toBe(true);
                }
            }
        }
        expect([...outcomes].sort()).toEqual(Object.keys(TRIAGE_OUTCOMES).sort());
    });

    it('начисляет точные бонусы ТЗ без дублирования', () => {
        const result = resolveTriage(makeState('rabbit', 'dog'));
        expect(result.effects).toEqual({revenue: 5000, reputation: 43});
        expect(result.reputationEvents.map((event) => event.value)).toEqual([10, 8, 15, 10]);
        expect(new Set(result.reputationEvents.map((event) => event.code)).size).toBe(result.reputationEvents.length);
    });

    it('ушедший хозяин кота не платит, помощь псу бесплатна', () => {
        const result = resolveTriage(makeState('rabbit', 'dog', 'refer'));
        expect(result.outcomeId).toBe('cat-refused');
        expect(result.effects.revenue).toBe(500);
        expect(result.patientOutcomes.cat).toBe('referred');
        expect(result.reputationEvents.some((event) => event.code === 'triageNoLosses')).toBe(false);
    });

    it('отказ Жанне — это плохой отзыв, а не ухудшение пациента', () => {
        const result = resolveTriage(makeState('cat', 'dog', 'refer'));
        expect(result.outcomeId).toBe('rabbit-refused');
        expect(result.patientOutcomes.rabbit).toBe('referred');
        expect(result.flags.triplePaid).toBe(true);
        expect(result.reputationEvents.some((event) => event.code === 'triageDogWorse')).toBe(false);
        expect(result.reputationEvents.find((event) => event.code === 'triageBadReview').value).toBe(-10);
    });

    it('не позволяет вариантом ожидания отменить ухудшение оставленного пса', () => {
        expect(resolveTriage(makeState('cat', 'rabbit', 'refer')).patientOutcomes.dog).toBe('worse');
    });

    it('не меняет состояние при расчёте и отвергает неполное распределение', () => {
        const state = makeState('rabbit', 'dog');
        const copy = structuredClone(state);
        resolveTriage(state);
        expect(state).toEqual(copy);
        expect(() => resolveTriage(createTriageState(0))).toThrow();
    });
});

describe('состояние и назначения', () => {
    it('даёт ровно минуту и округляет остаток вверх', () => {
        expect(createTriageState(2000).deadlineAt).toBe(62_000);
        expect(getRemainingSeconds(62_000, 61_001)).toBe(1);
        expect(getRemainingSeconds(62_000, 62_000)).toBe(0);
        expect(getRemainingSeconds(62_000, 70_000)).toBe(0);
    });

    it('меняет пациентов местами, но не назначает одного обоим', () => {
        expect(assignTriagePatient({doctor: 'rabbit', assistant: 'dog'}, 'doctor', 'dog')).toEqual({
            doctor: 'dog',
            assistant: 'rabbit',
        });
        expect(assignTriagePatient({doctor: null, assistant: 'dog'}, 'doctor', 'dog')).toEqual({
            doctor: 'dog',
            assistant: null,
        });
        expect(getWaitingPatient({doctor: 'dog', assistant: 'rabbit'})).toBe('cat');
    });

    it('таймаут сохраняет частичный выбор и заполняет только свободные роли', () => {
        expect(completeTimedOutAssignment({doctor: 'dog', assistant: null})).toEqual({
            doctor: 'dog',
            assistant: 'cat',
        });
        expect(completeTimedOutAssignment({doctor: null, assistant: null})).toEqual({
            doctor: 'cat',
            assistant: 'rabbit',
        });
    });

    it('валидирует JSON сохранения, сценарий и согласованность результата', () => {
        const state = createTriageState(0);
        expect(isTriageState(JSON.parse(JSON.stringify(state)))).toBe(true);
        for (const invalid of [
            null,
            {},
            {...state, deadlineAt: NaN},
            {...state, scenarioId: 'other'},
            {...state, assignments: {doctor: 'rabbit', assistant: 'rabbit'}},
            {...state, assignments: {}},
            {...state, outcomeId: 'constructor'},
            {...state, resolvedAt: 2},
        ]) {
            expect(isTriageState(invalid)).toBe(false);
        }
        const resolved = {...makeState('rabbit', 'dog'), outcomeId: 'rabbit-dog', resolvedAt: 100};
        expect(isTriageState(resolved)).toBe(true);
        expect(isTriageState({...resolved, outcomeId: 'cat-dog'})).toBe(false);
    });
});
