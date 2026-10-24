import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./client";
import { getGuest, getGuestProgress, saveGuestProgress, startGuest, toLocalProgress } from "./guest";
import {
  deleteAccount,
  errorMessage,
  getProgress,
  isApiError,
  login,
  logout,
  registerFromGuest,
  restoreSession,
  saveProgress,
} from "./players";
import { getToken, setToken } from "./session";
import { ErrorCode, type AuthResult } from "./types";

/** localStorage в памяти — в node-окружении vitest его нет. */
function fakeLocalStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, String(value)),
  };
}

interface Call {
  url: string;
  method: string;
  headers: Headers;
  body: unknown;
}

/** Подменяет fetch: отвечает body/status и запоминает запросы. */
function mockFetch(...responses: { status?: number; body: unknown }[]): Call[] {
  const calls: Call[] = [];
  const queue = [...responses];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      calls.push({
        url,
        method: init.method ?? "GET",
        headers: new Headers(init.headers),
        body: init.body ? JSON.parse(init.body as string) : undefined,
      });
      const next = queue.shift() ?? { body: { result: null } };
      return new Response(JSON.stringify(next.body), { status: next.status ?? 200 });
    }),
  );
  return calls;
}

const authResult: AuthResult = {
  player: { id: "p1", nickname: "Вася", email: "vasya@example.com", createdAt: "2026-10-24T10:00:00+00:00" },
  token: "token-1",
  expiresAt: "2026-11-23T10:00:00+00:00",
  importedProfessions: ["vet"],
  skippedProfessions: [],
};

describe("players api", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", fakeLocalStorage());
    setToken(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("registers a guest with nickname and browser progress, then stores token and clears guest", async () => {
    startGuest("  Вася   Пупкин ");
    saveGuestProgress("vet", { level: 2, percent: 35, difficulty: "Normal", state: { day: 2 } });
    const calls = mockFetch({ body: { result: authResult } });

    const result = await registerFromGuest("vasya@example.com", "secret-123");

    expect(calls[0].url).toBe("/api/v1/players/register");
    expect(calls[0].method).toBe("POST");
    expect(calls[0].body).toEqual({
      email: "vasya@example.com",
      password: "secret-123",
      nickname: "Вася Пупкин",
      progress: [{ professionCode: "vet", level: 2, percent: 35, difficulty: "Normal", state: { day: 2 } }],
    });
    expect(result.importedProfessions).toEqual(["vet"]);
    expect(getToken()).toBe("token-1");
    expect(getGuest()).toBeNull();
  });

  it("sends Authorization: Player <token> once logged in", async () => {
    const calls = mockFetch(
      { body: { result: authResult } },
      { body: { result: { professionCode: "vet", revision: 0 } } },
    );

    await login({ email: "vasya@example.com", password: "secret-123" });
    await getProgress("vet");

    expect(calls[0].headers.has("Authorization")).toBe(false);
    expect(calls[1].url).toBe("/api/v1/players/me/progress/vet");
    expect(calls[1].headers.get("Authorization")).toBe("Player token-1");
  });

  it("exposes backend error code and message on ApiError", async () => {
    setToken("token-1");
    mockFetch({
      status: 409,
      body: { result: null, error: { code: ErrorCode.ProgressConflict, message: "Прогресс был сохранён в другой вкладке" } },
    });

    const error = await saveProgress("vet", { level: 1, percent: 10, expectedRevision: 1 }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(isApiError(error, ErrorCode.ProgressConflict)).toBe(true);
    expect(isApiError(error, ErrorCode.Unauthorized)).toBe(false);
    expect((error as ApiError).status).toBe(409);
    expect(errorMessage(error)).toBe("Прогресс был сохранён в другой вкладке");
  });

  it("restoreSession clears an expired token and returns null", async () => {
    setToken("expired");
    mockFetch({ status: 401, body: { error: { code: ErrorCode.Unauthorized, message: "Требуется вход в игру" } } });

    await expect(restoreSession()).resolves.toBeNull();
    expect(getToken()).toBeNull();
  });

  it("restoreSession without token does not call the server", async () => {
    const calls = mockFetch();

    await expect(restoreSession()).resolves.toBeNull();
    expect(calls).toHaveLength(0);
  });

  it("logout clears token even if the server is unreachable", async () => {
    setToken("token-1");
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("Failed to fetch"))));

    await expect(logout()).rejects.toBeInstanceOf(ApiError);
    expect(getToken()).toBeNull();
  });

  it("deleteAccount sends password with DELETE /me and clears token", async () => {
    setToken("token-1");
    const calls = mockFetch({ body: { result: true } });

    await deleteAccount("secret-123");

    expect(calls[0].method).toBe("DELETE");
    expect(calls[0].url).toBe("/api/v1/players/me");
    expect(calls[0].body).toEqual({ password: "secret-123" });
    expect(getToken()).toBeNull();
  });

  it("errorMessage falls back to network text", () => {
    expect(errorMessage(new ApiError(0, "/api/x", "Failed to fetch"))).toBe("Нет связи с сервером");
  });
});

describe("guest storage", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", fakeLocalStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps guest progress in localStorage between reads", () => {
    startGuest("Гость");
    saveGuestProgress("vet", { level: 3, percent: 80, difficulty: "Hard", state: { pigHealth: 40 } });

    const stored = JSON.parse(localStorage.getItem("hackat.guest")!);
    expect(stored.nickname).toBe("Гость");
    expect(getGuestProgress<{ pigHealth: number }>("vet")?.state?.pigHealth).toBe(40);
    expect(toLocalProgress()).toEqual([
      { professionCode: "vet", level: 3, percent: 80, difficulty: "Hard", state: { pigHealth: 40 } },
    ]);
  });

  it("returns empty progress when there is no guest", () => {
    expect(getGuest()).toBeNull();
    expect(toLocalProgress()).toEqual([]);
  });
});
