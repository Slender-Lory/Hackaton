/**
 * Минимальный, но гибкий API-клиент.
 *
 * Базовый URL берётся из VITE_API_URL — это корень /api backend'а:
 *  - по умолчанию "/api" — относительный путь:
 *      * dev:  запрос /api/... проксирует Vite → http://localhost:8080/api/... (путь не меняется)
 *      * prod: запрос /api/... проксирует nginx → backend (путь не меняется)
 *  - можно задать абсолютный URL (https://api.example.com/api), если API живёт отдельно.
 *
 * Пути в вызовах — относительно /api: api("/v1/players/me") → /api/v1/players/me.
 */
export const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/+$/, '');

/**
 * @param {string} body
 * @returns {{code?: number, message?: string} | undefined}
 */
function parseErrorBody(body) {
    try {
        const error = JSON.parse(body)?.error;

        return {
            code: typeof error?.code === 'number' ? error.code : undefined,
            message: typeof error?.message === 'string' ? error.message : undefined,
        };
    } catch {
        return undefined;
    }
}

/**
 * Ошибка запроса к API: хранит HTTP-статус, URL и тело ответа.
 * Если backend вернул { error: { code, message } }, они доступны как code и serverMessage.
 */
export class ApiError extends Error {
    /**
     * @param {number} status HTTP-статус (0 — сетевая ошибка)
     * @param {string} url
     * @param {string} body
     */
    constructor(status, url, body) {
        super(`API ${status} for ${url}`);
        this.name = 'ApiError';
        this.status = status;
        this.url = url;
        this.body = body;

        const error = parseErrorBody(body);
        this.code = error?.code;
        this.serverMessage = error?.message;
    }
}

/**
 * Универсальная функция запроса: JSON in/out, поддержка 204, сетевых и HTTP-ошибок.
 * @template T
 * @param {string} path
 * @param {RequestInit} [init]
 * @returns {Promise<T>}
 */
export async function api(path, init) {
    const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
    const headers = new Headers(init?.headers);

    if (!headers.has('Content-Type') && init?.body && typeof init.body === 'string') {
        headers.set('Content-Type', 'application/json');
    }

    let response;

    try {
        response = await fetch(url, {...init, headers});
    } catch (cause) {
        throw new ApiError(0, url, cause instanceof Error ? cause.message : String(cause));
    }

    if (!response.ok) {
        throw new ApiError(response.status, url, await response.text());
    }

    if (response.status === 204) {
        return undefined;
    }

    const text = await response.text();

    return text ? JSON.parse(text) : undefined;
}

export const http = {
    get(path, init) {
        return api(path, {method: 'GET', ...init});
    },
    post(path, body, init) {
        return api(path, {method: 'POST', body: JSON.stringify(body ?? {}), ...init});
    },
    put(path, body, init) {
        return api(path, {method: 'PUT', body: JSON.stringify(body ?? {}), ...init});
    },
    patch(path, body, init) {
        return api(path, {method: 'PATCH', body: JSON.stringify(body ?? {}), ...init});
    },
    delete(path, body, init) {
        return api(path, {method: 'DELETE', body: body === undefined ? undefined : JSON.stringify(body), ...init});
    },
};

/** @returns {Promise<import('@/core/types/api').HealthResponse>} */
export function getHealth() {
    return api('/health');
}
