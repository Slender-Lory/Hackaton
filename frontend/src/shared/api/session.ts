/**
 * Токен сессии аккаунта в localStorage. Передаётся в заголовке Authorization: Player <token>.
 * localStorage может быть недоступен (приватный режим, тесты) — тогда токен живёт только в памяти.
 */
const TOKEN_KEY = "hackat.token";

let memoryToken: string | null = null;

export function getToken(): string | null {
  try {
    return globalThis.localStorage?.getItem(TOKEN_KEY) ?? memoryToken;
  } catch {
    return memoryToken;
  }
}

export function setToken(token: string | null): void {
  memoryToken = token;
  try {
    if (token) globalThis.localStorage?.setItem(TOKEN_KEY, token);
    else globalThis.localStorage?.removeItem(TOKEN_KEY);
  } catch {
    // localStorage недоступен — хватит памяти
  }
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Player ${token}` } : {};
}
