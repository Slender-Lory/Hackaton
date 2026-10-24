import {describe, expect, it} from 'vitest';
import {ApiError} from '@/core/api/client';
import {getErrorMessage} from './getErrorMessage';

describe('getErrorMessage', () => {
    it("берёт текст из error.message ответа backend'а", () => {
        const body = JSON.stringify({result: null, error: {code: 20000003, message: 'Почта уже зарегистрирована'}});

        expect(getErrorMessage(new ApiError(409, '/api/v1/players/register', body))).toBe('Почта уже зарегистрирована');
    });

    it('сетевая ошибка — понятный текст', () => {
        expect(getErrorMessage(new ApiError(0, '/api/x', 'Failed to fetch'))).toBe('Нет связи с сервером');
    });

    it('тело не JSON — общий текст', () => {
        expect(getErrorMessage(new ApiError(502, '/api/x', '<html>'))).toBe('Что-то пошло не так, попробуйте ещё раз');
    });

    it('не ApiError — общий текст', () => {
        expect(getErrorMessage(new Error('boom'))).toBe('Что-то пошло не так, попробуйте ещё раз');
    });
});
