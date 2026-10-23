import {describe, expect, it} from 'vitest';
import {NICKNAME_ERRORS, validateNickname} from './nicknameValidation';

describe('validateNickname', () => {
    it('принимает буквы, цифры, пробел, _ и -', () => {
        expect(validateNickname('Аня_2-я ')).toBeNull();
    });

    it('обрезает пробелы по краям перед проверкой длины', () => {
        expect(validateNickname(' a ')).toBe(NICKNAME_ERRORS.tooShort);
    });

    it('отклоняет слишком длинный ник', () => {
        expect(validateNickname('x'.repeat(25))).toBe(NICKNAME_ERRORS.tooLong);
    });

    it('отклоняет спецсимволы', () => {
        expect(validateNickname('Аня!')).toBe(NICKNAME_ERRORS.invalidCharacters);
    });
});
