export const ROUTE_NAMES = Object.freeze({
    professions: 'professions',
    prologue: 'prologue',
    game: 'game',
    profile: 'profile',
});

export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 24;
export const PASSWORD_MIN_LENGTH = 8;

export const SHIFT_COUNT = 3;
export const STORY_ANSWER = 'read';

export const DIFFICULTIES = Object.freeze({
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
});

// Совпадают с AppErrorCodes на backend'е.
export const ERROR_CODES = Object.freeze({
    unknownError: 10000002,
    invalidForm: 10000003,
    unauthorized: 10000004,
    tooManyRequests: 10000006,
    playerNotFound: 20000002,
    emailTaken: 20000003,
    wrongEmailOrPassword: 20000004,
    wrongPassword: 20000006,
    unknownProfession: 21000001,
    progressConflict: 21000002,
});
