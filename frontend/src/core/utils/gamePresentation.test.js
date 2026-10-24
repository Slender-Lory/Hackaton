import {describe, expect, it} from 'vitest';
import {DIFFICULTIES} from '@/core/constants';
import {shifts} from '@/core/data/shifts';
import {getPassportPrompt, getShiftGuidance, isPatientPresent, personalizeDialogue} from './gamePresentation';

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

describe('план смены', () => {
    it.each(Object.values(DIFFICULTIES))('доступен на сложности %s', (difficulty) => {
        for (const shift of shifts.vet) {
            expect(getShiftGuidance(shift, difficulty).length).toBeGreaterThan(20);
        }
    });

    it('не раскрывает обучающие подсказки на сложном уровне', () => {
        const shift = {hints: {easy: 'Подробное лечение', normal: 'Диагностический намёк'}};
        expect(getShiftGuidance(shift, DIFFICULTIES.easy)).toBe('Подробное лечение');
        expect(getShiftGuidance(shift, DIFFICULTIES.normal)).toBe('Диагностический намёк');
        expect(getShiftGuidance(shift, DIFFICULTIES.hard)).toContain('плане клиники');
        expect(getShiftGuidance(shift, DIFFICULTIES.hard)).not.toContain('лечение');
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
