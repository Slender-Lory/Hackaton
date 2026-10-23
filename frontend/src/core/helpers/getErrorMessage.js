import {ApiError} from '@/core/api/client';

/**
 * Сообщение для игрока: error.message из ответа backend'а ({result, error}) или общий текст.
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

    try {
        const message = JSON.parse(error.body)?.error?.message;

        if (message) {
            return message;
        }
    } catch {
        // Тело не JSON — ниже общий текст
    }

    return `Ошибка ${error.status}`;
}
