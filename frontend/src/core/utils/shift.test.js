import {describe, expect, it} from 'vitest';
import {
    applyEffects,
    getChapterPercent,
    getChecklistBudget,
    getOpenStepIndex,
    getStepResult,
    getUnaffordableOptionIds,
} from './shift';

/** @type {import('@/core/types/shift').ChecklistStep} */
const CHECKLIST = {
    kind: 'checklist',
    id: 'tests',
    title: '',
    text: '',
    hint: '',
    payer: 'owner',
    budget: 2500,
    options: [
        {id: 'lamp', label: '', cost: 300, isNeeded: true},
        {id: 'scraping', label: '', cost: 500, isNeeded: true},
        {id: 'xray', label: '', cost: 1200, isNeeded: false},
    ],
    missedEffects: {reputation: -5},
    extraEffects: {reputation: -5},
    feedback: {exact: 'exact', missed: 'missed', extra: 'extra'},
};

describe('applyEffects', () => {
    it('складывает изменения и не выходит за пределы шкал', () => {
        const counters = {revenue: 300, reputation: 98, pigHealth: 5};

        expect(applyEffects(counters, {revenue: -500, reputation: 5, pigHealth: -10})).toEqual({
            revenue: 0,
            reputation: 100,
            pigHealth: 0,
        });
    });
});

describe('getStepResult', () => {
    it('владелец платит клинике за ровно нужные анализы', () => {
        expect(getStepResult(CHECKLIST, ['lamp', 'scraping'])).toEqual({effects: {revenue: 800}, feedback: 'exact'});
    });

    it('клиника сама платит за анализы', () => {
        const result = getStepResult({...CHECKLIST, payer: 'clinic'}, ['lamp', 'scraping']);

        expect(result.effects).toEqual({revenue: -800});
    });

    it('штрафует и за пропуск нужного, и за лишнее', () => {
        expect(getStepResult(CHECKLIST, ['lamp', 'xray'])).toEqual({
            effects: {revenue: 1500, reputation: -10},
            feedback: 'missed extra',
        });
    });

    it('у выбора берёт эффект и объяснение варианта', () => {
        const step = {
            kind: 'choice',
            id: 'diagnosis',
            options: [{id: 'fmd', label: '', effects: {pigHealth: 5}, feedback: 'верно'}],
        };

        expect(getStepResult(step, 'fmd')).toEqual({effects: {pigHealth: 5}, feedback: 'верно'});
    });

    it('сцена без эффекта ничего не меняет', () => {
        expect(getStepResult({kind: 'story', id: 'intro', title: '', text: ''}, 'read')).toEqual({
            effects: {},
            feedback: '',
        });
    });
});

describe('getChecklistBudget', () => {
    it('у владельца свой бюджет, у клиники — касса', () => {
        expect(getChecklistBudget(CHECKLIST, 100)).toBe(2500);
        expect(getChecklistBudget({...CHECKLIST, payer: 'clinic'}, 100)).toBe(100);
    });
});

describe('getUnaffordableOptionIds', () => {
    const options = [
        {id: 'expensive', effects: {revenue: -800}},
        {id: 'cheap', effects: {revenue: -300}},
    ];

    it('блокирует варианты дороже кассы', () => {
        expect(getUnaffordableOptionIds(options, 500)).toEqual(['expensive']);
    });

    it('не блокирует всё сразу, чтобы смена не встала', () => {
        expect(getUnaffordableOptionIds(options, 100)).toEqual([]);
    });
});

describe('getOpenStepIndex', () => {
    const steps = [{id: 'a'}, {id: 'b'}, {id: 'c'}];

    it('открывает первый шаг без ответа', () => {
        expect(getOpenStepIndex(steps, {a: 'read'})).toBe(1);
    });

    it('на пройденном деле остаётся на последнем шаге', () => {
        expect(getOpenStepIndex(steps, {a: 'read', b: 'x', c: 'read'})).toBe(2);
    });
});

describe('getChapterPercent', () => {
    it('считает долю главы по сменам и делам', () => {
        expect(getChapterPercent({shiftNumber: 1, completedCount: 1, activityCount: 2, shiftCount: 3})).toBe(17);
        expect(getChapterPercent({shiftNumber: 2, completedCount: 0, activityCount: 2, shiftCount: 3})).toBe(33);
    });
});
