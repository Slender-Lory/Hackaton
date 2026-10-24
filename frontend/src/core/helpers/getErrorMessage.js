import {ApiError} from '@/core/api/client';

const NETWORK_ERROR_MESSAGE = 'Нет связи с сервером';
const FALLBACK_MESSAGE = 'Что-то пошло не так, попробуйте ещё раз';

/**
 * @param {unknown} error
 * @returns {string}
 */
export function getErrorMessage(error) {
    if (!(error instanceof ApiError)) {
        return FALLBACK_MESSAGE;
    }

    if (error.serverMessage) {
        return error.serverMessage;
    }

    return error.status === 0 ? NETWORK_ERROR_MESSAGE : FALLBACK_MESSAGE;
}
