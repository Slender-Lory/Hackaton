import {PASSWORD_MIN_LENGTH} from '@/core/constants';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AUTH_ERRORS = Object.freeze({
    emailEmpty: 'Введите почту',
    emailInvalid: 'Проверьте почту: например, anya@mail.ru',
    passwordEmpty: 'Введите пароль',
    passwordShort: `Пароль — не короче ${PASSWORD_MIN_LENGTH} символов`,
});

/**
 * @param {string} value
 * @returns {string | null}
 */
export function validateEmail(value) {
    const email = value.trim();

    if (!email) {
        return AUTH_ERRORS.emailEmpty;
    }

    return EMAIL_PATTERN.test(email) ? null : AUTH_ERRORS.emailInvalid;
}

/**
 * @param {string} value
 * @param {{isNew: boolean}} options для регистрации проверяется длина
 * @returns {string | null}
 */
export function validatePassword(value, {isNew}) {
    if (!value) {
        return AUTH_ERRORS.passwordEmpty;
    }

    return isNew && value.length < PASSWORD_MIN_LENGTH ? AUTH_ERRORS.passwordShort : null;
}
