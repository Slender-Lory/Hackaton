import {describe, expect, it} from 'vitest';
import {DIFFICULTIES} from '@/core/constants';
import {shifts} from '@/core/data/shifts';
import {
    getNextActivity,
    getPassportPrompt,
    getShiftGuidance,
    isPatientPresent,
    personalizeDialogue,
} from './gamePresentation';

describe('следующее дело смены', () => {
    const activities = [
        {code: 'farm', roomCode: 'garage'},
        {code: 'dog', roomCode: 'exam'},
        {code: 'queue', roomCode: 'reception', kind: 'triage'},
    ];
    const rooms = ['garage', 'exam', 'reception'];

    it('показывает ферму, когда остальные дела закрыты', () => {
        expect(getNextActivity(activities, {farm: 'new', dog: 'locked', queue: 'locked'}, rooms)?.code).toBe('farm');
    });

    it('сначала предлагает продолжить начатое дело', () => {
        expect(getNextActivity(activities, {farm: 'started', dog: 'new', queue: 'new'}, rooms)?.code).toBe('farm');
    });

    it('после завершения выбирает доступное дело в порядке комнат на плане', () => {
        expect(getNextActivity(activities, {farm: 'done', dog: 'new', queue: 'locked'}, rooms)?.code).toBe('dog');
        expect(getNextActivity(activities, {farm: 'new', dog: 'new', queue: 'new'}, rooms)?.kind).toBe('triage');
    });

    it('не предлагает закрытые комнаты и завершённые дела', () => {
        expect(
            getNextActivity(activities, {farm: 'new', dog: 'done', queue: 'locked'}, ['exam', 'reception']),
        ).toBeNull();
        expect(getNextActivity([], {}, rooms)).toBeNull();
    });
});

describe('обращение к игроку', () => {
    it('вставляет ник только в предусмотренных репликах', () => {
        expect(personalizeDialogue('«{nickname}, проходите».', '  Саша  ')).toBe('«Саша, проходите».');
        expect(personalizeDialogue('Поросята ждут.', 'Саша')).toBe('Поросята ждут.');
    });

    it('не оставляет пустое обращение или шаблон без ника', () => {
        expect(personalizeDialogue('«{nickname}, помогите».', '')).toBe('«доктор, помогите».');
        expect(personalizeDialogue(undefined, null)).toBe('');
    });

    it('не интерпретирует специальные символы ника как подстановки', () => {
        expect(personalizeDialogue('{nickname}', '$&')).toBe('$&');
    });
});

describe('инструкция к смене', () => {
    it.each(Object.values(DIFFICULTIES))('доступен на сложности %s', (difficulty) => {
        for (const shift of shifts.vet) {
            expect(getShiftGuidance(shift, difficulty).length).toBeGreaterThan(20);
        }
    });

    it('не раскрывает лечебные и диагностические подсказки на любой сложности', () => {
        const shift = {hints: {easy: 'Подробное лечение', normal: 'Диагностический намёк'}};
        for (const difficulty of Object.values(DIFFICULTIES)) {
            const instruction = getShiftGuidance(shift, difficulty);
            expect(instruction).toContain('Нажми на подсвеченную комнату');
            expect(instruction).toContain('начать или продолжить дело');
            expect(instruction).not.toContain(shift.hints.easy);
            expect(instruction).not.toContain(shift.hints.normal);
        }
    });
});

describe('контекст паспорта', () => {
    it('во время звонка и разговора перед выездом пациент ещё не присутствует', () => {
        for (const code of ['farm-visit-1', 'farm-visit-2']) {
            const activity = shifts.vet.flatMap((shift) => shift.activities).find((item) => item.code === code);
            expect(isPatientPresent(activity.steps.find((step) => step.id === 'call'))).toBe(false);
        }
        const activity = shifts.vet[0].activities[0];
        expect(isPatientPresent(activity.steps.find((step) => step.id === 'contract'))).toBe(false);
        expect(isPatientPresent(activity.steps.find((step) => step.id === 'arrival'))).toBe(true);
    });

    it('не предлагает паспорт до встречи с пациентом', () => {
        expect(isPatientPresent(null)).toBe(false);
        expect(getPassportPrompt({kind: 'story', patientPresent: false})).toBeNull();
        expect(getPassportPrompt({kind: 'exam'})).toContain('сравнить показатели с нормой');
        expect(getPassportPrompt({kind: 'story'})).toContain('сведения о пациенте');
    });
});
