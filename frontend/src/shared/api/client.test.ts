import { afterEach, describe, expect, it, vi } from "vitest";
import { API_BASE, ApiError, api, getHealth, http } from "./client";

describe("api client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses relative /api by default when VITE_API_URL is unset", () => {
    expect(API_BASE).toBe("/api");
  });

  it("joins base and path (no duplicate slashes)", async () => {
    expect.assertions(1);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        expect(url).toBe("/api/health");
        return new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );

    await getHealth();
  });

  it("getHealth resolves with status ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ status: "ok" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );

    await expect(getHealth()).resolves.toEqual({ status: "ok" });
  });

  it("parses JSON responses through api()", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ value: 42 }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );

    await expect(api<{ value: number }>("/x")).resolves.toEqual({ value: 42 });
  });

  it("returns undefined for 204 No Content", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 204 })));

    await expect(api<undefined>("/x")).resolves.toBeUndefined();
  });

  it("getHealth rejects with ApiError on non-2xx", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 500 })));

    const err = await getHealth().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toHaveProperty("status", 500);
    expect((err as ApiError).body).toBe("boom");
    expect((err as ApiError).message).toContain("API 500");
  });

  it("throws ApiError(status 0) on network failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("Failed to fetch"))));

    const err = await api<unknown>("/x").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(0);
  });

  it("sends JSON Content-Type when body is provided", async () => {
    expect.assertions(1);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        const headers = new Headers(init.headers);
        expect(headers.get("Content-Type")).toBe("application/json");
        return new Response("{}", { status: 200 });
      }),
    );

    await http.post("/x", { a: 1 });
  });
});
