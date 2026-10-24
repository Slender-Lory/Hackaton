import {describe, expect, it} from 'vitest';
import {professions} from './professions';

describe('professions', () => {
    it('коды уникальны', () => {
        const codes = professions.map((profession) => profession.code);

        expect(new Set(codes).size).toBe(codes.length);
    });

    it("играбелен только ветеринар — он есть на backend'е", () => {
        const available = professions.filter((profession) => profession.isAvailable);

        expect(available.map((profession) => profession.code)).toEqual(['vet']);
    });
});
