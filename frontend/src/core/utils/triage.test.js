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
    ['parrot', 'dog', 'accept', 'parrot-dog', true, true],
    ['parrot', 'cat', 'accept', 'parrot-cat', true, false],
    ['dog', 'parrot', 'accept', 'dog-parrot', true, true],
    ['cat', 'parrot', 'accept', 'cat-parrot', true, false],
    ['dog', 'cat', 'accept', 'dog-cat', false, false],
    ['cat', 'dog', 'accept', 'cat-dog', false, false],
    ['parrot', 'cat', 'refer', 'stray-refused', true, false],
    ['parrot', 'dog', 'refer', 'owner-left', true, true],
];

function makeState(doctor, assistant, waitingDecision = 'accept') {
    return {...createTriageState(1000), assignments: {doctor, assistant}, waitingDecision};
}

describe('resolveTriage', () => {
    it.each(PLANS)('%s / %s / %s → %s', (doctor, assistant, decision, outcomeId, parrotSaved, correctPriority) => {
        const result = resolveTriage(makeState(doctor, assistant, decision));
        expect(result.outcomeId).toBe(outcomeId);
        expect(result.flags.parrotSaved).toBe(parrotSaved);
        expect(result.flags.correctPriority).toBe(correctPriority);
        expect(result.effects.reputation).toBe(result.reputationEvents.reduce((sum, event) => sum + event.value, 0));
        expect(result.patientOutcomes.parrot).toBe(parrotSaved ? 'stable' : 'lost');
    });

    it('все 12 допустимых распределений дают ровно восемь исходов', () => {
        const outcomes = new Set();
        for (const doctor of ['parrot', 'dog', 'cat']) {
            for (const assistant of ['parrot', 'dog', 'cat'].filter((patient) => patient !== doctor)) {
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
        const result = resolveTriage(makeState('dog', 'parrot'));
        expect(result.effects).toEqual({revenue: -1000, reputation: 43});
        expect(result.reputationEvents.map((event) => event.value)).toEqual([8, 10, 15, 10]);
        expect(new Set(result.reputationEvents.map((event) => event.code)).size).toBe(result.reputationEvents.length);
    });

    it('не начисляет выручку за бесплатную помощь собаке', () => {
        const result = resolveTriage(makeState('dog', 'parrot', 'refer'));
        expect(result.outcomeId).toBe('owner-left');
        expect(result.effects.revenue).toBe(-5500);
        expect(result.patientOutcomes.cat).toBe('referred');
        expect(result.reputationEvents.some((event) => event.code === 'triageNoLosses')).toBe(false);
    });

    it('различает уход пациента и его смерть', () => {
        const result = resolveTriage(makeState('cat', 'parrot', 'refer'));
        expect(result.outcomeId).toBe('stray-refused');
        expect(result.patientOutcomes.dog).toBe('referred');
        expect(result.reputationEvents.some((event) => event.code === 'triageLoss')).toBe(false);
        expect(result.reputationEvents.find((event) => event.code === 'strayRefused').value).toBe(-10);
    });

    it('не позволяет вариантом ожидания спасти оставленного без помощи попугая', () => {
        expect(resolveTriage(makeState('cat', 'dog', 'refer')).patientOutcomes.parrot).toBe('lost');
    });

    it('не меняет состояние при расчёте и отвергает неполное распределение', () => {
        const state = makeState('dog', 'parrot');
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
        expect(assignTriagePatient({doctor: 'dog', assistant: 'parrot'}, 'doctor', 'parrot')).toEqual({
            doctor: 'parrot',
            assistant: 'dog',
        });
        expect(assignTriagePatient({doctor: null, assistant: 'parrot'}, 'doctor', 'parrot')).toEqual({
            doctor: 'parrot',
            assistant: null,
        });
        expect(getWaitingPatient({doctor: 'parrot', assistant: 'dog'})).toBe('cat');
    });

    it('таймаут сохраняет частичный выбор и заполняет только свободные роли', () => {
        expect(completeTimedOutAssignment({doctor: 'parrot', assistant: null})).toEqual({
            doctor: 'parrot',
            assistant: 'cat',
        });
        expect(completeTimedOutAssignment({doctor: null, assistant: null})).toEqual({doctor: 'cat', assistant: 'dog'});
    });

    it('валидирует JSON сохранения, сценарий и согласованность результата', () => {
        const state = createTriageState(0);
        expect(isTriageState(JSON.parse(JSON.stringify(state)))).toBe(true);
        for (const invalid of [
            null,
            {},
            {...state, deadlineAt: NaN},
            {...state, scenarioId: 'other'},
            {...state, assignments: {doctor: 'dog', assistant: 'dog'}},
            {...state, assignments: {}},
            {...state, outcomeId: 'constructor'},
            {...state, resolvedAt: 2},
        ]) {
            expect(isTriageState(invalid)).toBe(false);
        }
        const resolved = {...makeState('dog', 'parrot'), outcomeId: 'dog-parrot', resolvedAt: 100};
        expect(isTriageState(resolved)).toBe(true);
        expect(isTriageState({...resolved, outcomeId: 'cat-dog'})).toBe(false);
    });
});
