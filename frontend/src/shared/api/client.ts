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
export const API_BASE = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/+$/, "");

/**
 * Ошибка запроса к API: хранит HTTP-статус, URL и тело ответа.
 * Если backend вернул { error: { code, message } }, они доступны как code и serverMessage
 * (serverMessage — готовый текст для игрока).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly url: string;
  readonly body: string;
  readonly code?: number;
  readonly serverMessage?: string;

  constructor(status: number, url: string, body: string) {
    super(`API ${status} for ${url}`);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
    this.body = body;

    const error = parseErrorBody(body);
    this.code = error?.code;
    this.serverMessage = error?.message;
  }
}

function parseErrorBody(body: string): { code?: number; message?: string } | undefined {
  try {
    const parsed: unknown = JSON.parse(body);
    if (parsed && typeof parsed === "object" && "error" in parsed) {
      const error = (parsed as { error?: { code?: unknown; message?: unknown } | null }).error;
      return {
        code: typeof error?.code === "number" ? error.code : undefined,
        message: typeof error?.message === "string" ? error.message : undefined,
      };
    }
  } catch {
    // не JSON — оставляем только body
  }
  return undefined;
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
