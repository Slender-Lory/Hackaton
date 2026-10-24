import {ApiError} from '@/core/api/client';

/**
 * @param {unknown} error
 * @returns {string}
 */
export function getErrorMessage(error) {
    if (!(error instanceof ApiError)) {
        return error instanceof Error ? error.message : String(error);
    }

    if (error.status === 0) {
        return 'Нет связи с сервером';
    }

    const fallback = `Ошибка ${error.status}`;

    try {
        return JSON.parse(error.body)?.error?.message || fallback;
    } catch {
        return fallback;
    }
}
