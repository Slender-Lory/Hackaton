import {describe, expect, it} from 'vitest';
import {ApiError} from '@/core/api/client';
import {getErrorMessage} from './getErrorMessage';

describe('getErrorMessage', () => {
    it("берёт текст из error.message ответа backend'а", () => {
        const body = JSON.stringify({result: null, error: {code: 10000001, message: 'Введите никнейм'}});

        expect(getErrorMessage(new ApiError(400, '/api/v1/players/enter', body))).toBe('Введите никнейм');
    });

    it('сетевая ошибка — понятный текст', () => {
        expect(getErrorMessage(new ApiError(0, '/api/x', 'Failed to fetch'))).toBe('Нет связи с сервером');
    });

    it('тело не JSON — код статуса', () => {
        expect(getErrorMessage(new ApiError(502, '/api/x', '<html>'))).toBe('Ошибка 502');
    });

    it('обычная ошибка — её текст', () => {
        expect(getErrorMessage(new Error('boom'))).toBe('boom');
    });
});
