/**
 * Минимальный, но гибкий API-клиент.
 *
 * Базовый URL берётся из VITE_API_URL:
 *  - по умолчанию "/api" — относительный путь:
 *      * dev:  запрос /api/... проксирует Vite → http://localhost:8080 (префикс снимается)
 *      * prod: запрос /api/... проксирует nginx → backend (префикс снимается)
 *  - можно задать абсолютный URL (https://api.example.com), если API живёт отдельно.
 */
export const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/+$/, '');

/** Ошибка запроса к API: хранит HTTP-статус, URL и тело ответа. */
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
        // Сетевая ошибка (нет соединения, CORS, DNS и т.п.)
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

/** Готовые типовые методы. */
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
    delete(path, init) {
        return api(path, {method: 'DELETE', ...init});
    },
};

/** @returns {Promise<import('@/core/types/api').HealthResponse>} */
export function getHealth() {
    return api('/health');
}
