import {describe, expect, it} from 'vitest';
import {professions} from './professions';
import {patients} from './patients';
import {shifts} from './shifts';
import {TRIAGE_PATIENTS} from './triage';

describe('professions', () => {
    it('показывает пять отдельных пациентов и партию поросят без повторного счёта визитов', () => {
        const individualIds = shifts.vet
            .flatMap((shift) => shift.activities)
            .map((activity) => activity.patient.id)
            .filter((id) => !['pigs', 'queue'].includes(id));
        const patientCount = new Set([...individualIds, ...TRIAGE_PATIENTS.map((patient) => patient.id)]).size;
        const vet = professions.find((profession) => profession.code === 'vet');

        expect(patientCount).toBe(5);
        expect(patients.pigs.passport.species).toContain('40 голов');
        expect(vet.stats.find((stat) => stat.icon === 'paw').value).toBe(`${patientCount} + 40 поросят`);
        expect(vet.stats.find((stat) => stat.icon === 'clock').value).toBe('15–20 мин');
    });
    it('коды уникальны', () => {
        const codes = professions.map((profession) => profession.code);

        expect(new Set(codes).size).toBe(codes.length);
    });

    it("играбелен только ветеринар — он есть на backend'е", () => {
        const available = professions.filter((profession) => profession.isAvailable);

        expect(available.map((profession) => profession.code)).toEqual(['vet']);
    });
});
