import {describe, expect, it} from 'vitest';
import {
    applyEffects,
    getChapterPercent,
    getChecklistBudget,
    getLockedOptions,
    getOpenStepIndex,
    getStepResult,
    getStoryVariant,
    getUnaffordableOptionIds,
    meetsConditions,
    startShift,
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

/** @type {import('@/core/types/shift').ShiftState} */
const STATE = {
    version: 1,
    shift: 1,
    counters: {revenue: 1000, reputation: 40, pigHealth: 65},
    completedActivities: [],
    answers: {farm: {treatment: 'quarantine', exam: ['mouth', 'hooves']}},
    morning: {},
};

describe('meetsConditions', () => {
    it('проверяет счётчик в границах включительно', () => {
        expect(meetsConditions([{counter: 'pigHealth', min: 65, max: 70}], STATE)).toBe(true);
        expect(meetsConditions([{counter: 'reputation', min: 50}], STATE)).toBe(false);
    });

    it('проверяет ответ, в том числе выбранную процедуру', () => {
        expect(meetsConditions([{answer: {activity: 'farm', step: 'treatment', is: ['quarantine']}}], STATE)).toBe(
            true,
        );
        expect(meetsConditions([{answer: {activity: 'farm', step: 'exam', is: ['hooves']}}], STATE)).toBe(true);
        expect(meetsConditions([{answer: {activity: 'farm', step: 'diagnosis', is: ['fmd']}}], STATE)).toBe(false);
    });

    it('без условий — выполнено', () => {
        expect(meetsConditions(undefined, STATE)).toBe(true);
    });
});

describe('getStoryVariant', () => {
    const step = {
        kind: 'story',
        id: 'outcome',
        title: '',
        text: '',
        variants: [
            {id: 'saved', when: [{counter: 'pigHealth', min: 70}], title: '', text: '', effects: {reputation: 20}},
            {id: 'lost', title: '', text: '', effects: {reputation: -20}},
        ],
    };

    it('до ответа выбирает подходящий вариант', () => {
        expect(getStoryVariant(step, STATE, null)?.id).toBe('lost');
    });

    it('после ответа держится за показанный вариант и его эффект', () => {
        expect(getStoryVariant(step, STATE, 'saved')?.id).toBe('saved');
        expect(getStepResult(step, 'saved').effects).toEqual({reputation: 20});
    });
});

describe('getLockedOptions', () => {
    it('закрывает варианты без нужной репутации и объясняет почему', () => {
        const options = [
            {id: 'persuade', requires: [{counter: 'reputation', min: 50}], lockedText: 'Не доверяет', effects: {}},
            {id: 'skip', effects: {}},
        ];

        expect(getLockedOptions(options, STATE)).toEqual({persuade: 'Не доверяет'});
    });
});

describe('startShift', () => {
    it('применяет подходящие утренние события и запоминает их', () => {
        const shift = {
            number: 2,
            morning: [
                {id: 'always', text: '', effects: {pigHealth: -10}},
                {id: 'popular', when: [{counter: 'reputation', min: 55}], text: '', effects: {revenue: 1000}},
                {
                    id: 'quarantine',
                    when: [{answer: {activity: 'farm', step: 'treatment', is: ['quarantine']}}],
                    text: '',
                },
            ],
            activities: [],
        };

        const next = startShift(STATE, shift);

        expect(next.shift).toBe(2);
        expect(next.counters).toEqual({revenue: 1000, reputation: 40, pigHealth: 55});
        expect(next.morning).toEqual({2: ['always', 'quarantine']});
    });
});
