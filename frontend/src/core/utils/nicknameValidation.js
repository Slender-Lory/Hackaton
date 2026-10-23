import {NICKNAME_MAX_LENGTH, NICKNAME_MIN_LENGTH} from '@/core/constants';

// Буквы любого алфавита, цифры, пробел, «_» и «-» — как в EnterForm на backend'е.
const NICKNAME_PATTERN = /^[\p{L}\p{Nd}_\- ]+$/u;

export const NICKNAME_ERRORS = Object.freeze({
    tooShort: `Минимум ${NICKNAME_MIN_LENGTH} символа`,
    tooLong: `Максимум ${NICKNAME_MAX_LENGTH} символа`,
    invalidCharacters: 'Только буквы, цифры, пробел, «_» и «-»',
});

/**
 * Текст ошибки для игрока или null, если никнейм подходит.
 * @param {string} value
 * @returns {string | null}
 */
export function validateNickname(value) {
    const nickname = value.trim();

    if (nickname.length < NICKNAME_MIN_LENGTH) {
        return NICKNAME_ERRORS.tooShort;
    }

    if (nickname.length > NICKNAME_MAX_LENGTH) {
        return NICKNAME_ERRORS.tooLong;
    }

    if (!NICKNAME_PATTERN.test(nickname)) {
        return NICKNAME_ERRORS.invalidCharacters;
    }

    return null;
}
