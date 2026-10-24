import {describe, expect, it} from 'vitest';
import {AUTH_ERRORS, validateEmail, validatePassword} from './authValidation';

describe('validateEmail', () => {
    it('принимает обычную почту', () => {
        expect(validateEmail(' anya@mail.ru ')).toBeNull();
    });

    it('пустая и без домена — ошибка', () => {
        expect(validateEmail('')).toBe(AUTH_ERRORS.emailEmpty);
        expect(validateEmail('anya@mail')).toBe(AUTH_ERRORS.emailInvalid);
    });
});

describe('validatePassword', () => {
    it('при регистрации — не короче 8 символов', () => {
        expect(validatePassword('1234567', {isNew: true})).toBe(AUTH_ERRORS.passwordShort);
        expect(validatePassword('12345678', {isNew: true})).toBeNull();
    });

    it('при входе длину не проверяет', () => {
        expect(validatePassword('123', {isNew: false})).toBeNull();
        expect(validatePassword('', {isNew: false})).toBe(AUTH_ERRORS.passwordEmpty);
    });
});
