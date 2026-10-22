/**
 * Минимальный, но гибкий API-клиент.
 *
 * Базовый URL берётся из VITE_API_URL:
 *  - по умолчанию "/api" — относительный путь:
 *      * dev:  запрос /api/... проксирует Vite → http://localhost:8080 (префикс снимается)
 *      * prod: запрос /api/... проксирует nginx → backend (префикс снимается)
 *  - можно задать абсолютный URL (https://api.example.com), если API живёт отдельно.
 */
export const API_BASE = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/+$/, "");

/** Ошибка запроса к API: хранит HTTP-статус, URL и тело ответа. */
export class ApiError extends Error {
  readonly status: number;
  readonly url: string;
  readonly body: string;

  constructor(status: number, url: string, body: string) {
    super(`API ${status} for ${url}`);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

/** Универсальная функция запроса: JSON in/out, поддержка 204, сетевых и HTTP-ошибок. */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (cause) {
    // Сетевая ошибка (нет соединения, CORS, DNS и т.п.)
    throw new ApiError(0, url, cause instanceof Error ? cause.message : String(cause));
  }

  if (!res.ok) {
    throw new ApiError(res.status, url, await res.text());
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Готовые типовые методы. */
export const http = {
  get: <T>(path: string, init?: RequestInit) => api<T>(path, { method: "GET", ...init }),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    api<T>(path, { method: "POST", body: JSON.stringify(body ?? {}), ...init }),
  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    api<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}), ...init }),
  patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
    api<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}), ...init }),
  delete: <T>(path: string, init?: RequestInit) => api<T>(path, { method: "DELETE", ...init }),
};

/** Тип ответа /health backend'а. */
export interface HealthResponse {
  status: string;
  service?: string;
}

export function getHealth() {
  return api<HealthResponse>("/health");
}
