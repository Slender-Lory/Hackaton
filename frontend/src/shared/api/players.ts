/**
 * API игрока: регистрация, вход, профиль, прогресс, выход, удаление аккаунта.
 * Функции возвращают result из ответа backend'а и бросают ApiError при ошибке —
 * в ApiError.code код из ErrorCode, в ApiError.serverMessage текст для игрока.
 * Пути — относительно /api (см. client.ts).
 */
import { ApiError, api } from "./client";
import { clearGuest, getGuest, toLocalProgress } from "./guest";
import { authHeaders, getToken, setToken } from "./session";
import type {
  AppResult,
  AuthResult,
  ErrorCode,
  GameState,
  LoginForm,
  PlayerProfile,
  ProfessionCode,
  ProgressModel,
  RegisterForm,
  SaveProgressForm,
} from "./types";

const BASE = "/v1/players";

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await api<AppResult<T>>(`${BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers as Record<string, string> | undefined) },
  });
  return response?.result as T;
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

/** Ошибка API с конкретным кодом? Например: isApiError(e, ErrorCode.ProgressConflict). */
export function isApiError(error: unknown, code?: ErrorCode): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code);
}

/** Текст ошибки для игрока: сообщение backend'а или общий текст. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.serverMessage) return error.serverMessage;
    if (error.status === 0) return "Нет связи с сервером";
  }
  return "Что-то пошло не так, попробуйте ещё раз";
}

// ── Регистрация и вход ───────────────────────────────────────────────

/** Регистрация. Сохраняет токен. Чтобы перенести прогресс гостя, используйте registerFromGuest(). */
export async function register(form: RegisterForm): Promise<AuthResult> {
  const result = await call<AuthResult>("/register", json("POST", form));
  setToken(result.token);
  return result;
}

/** Вход по почте. Сохраняет токен. Чтобы перенести прогресс гостя, используйте loginFromGuest(). */
export async function login(form: LoginForm): Promise<AuthResult> {
  const result = await call<AuthResult>("/login", json("POST", form));
  setToken(result.token);
  return result;
}

/**
 * «Сохранить прогресс» (ТЗ 2.1.3): регистрация гостя с его никнеймом и прогрессом из браузера.
 * После успеха гость стирается из localStorage.
 */
export async function registerFromGuest(email: string, password: string, nickname?: string): Promise<AuthResult> {
  const guest = getGuest();
  const result = await register({
    email,
    password,
    nickname: nickname ?? guest?.nickname ?? "",
    progress: toLocalProgress(guest),
  });
  clearGuest();
  return result;
}

/**
 * Вход в существующий аккаунт из браузера, где играл гость: прогресс гостя переносится
 * в профессии, не начатые в аккаунте (result.importedProfessions / skippedProfessions).
 */
export async function loginFromGuest(email: string, password: string): Promise<AuthResult> {
  const result = await login({ email, password, progress: toLocalProgress() });
  clearGuest();
  return result;
}

/** Выход с этого устройства. Токен стирается даже если сервер недоступен. */
export async function logout(): Promise<void> {
  try {
    if (getToken()) await call<boolean>("/logout", { method: "POST" });
  } finally {
    setToken(null);
  }
}

/** Удаление аккаунта (нужен пароль): аккаунт, прогресс и сессии на всех устройствах. */
export async function deleteAccount(password: string): Promise<void> {
  await call<boolean>("/me", json("DELETE", { password }));
  setToken(null);
}

// ── Профиль ──────────────────────────────────────────────────────────

/** Профиль и прогресс по всем профессиям. 401 (ErrorCode.Unauthorized) — сессии нет. */
export function getProfile<TState extends GameState = GameState>(): Promise<PlayerProfile<TState>> {
  return call<PlayerProfile<TState>>("/me");
}

/**
 * Восстановить сессию при открытии сайта: есть токен — вернёт профиль,
 * токена нет или он истёк/аккаунт удалён — сотрёт токен и вернёт null.
 */
export async function restoreSession<TState extends GameState = GameState>(): Promise<PlayerProfile<TState> | null> {
  if (!getToken()) return null;
  try {
    return await getProfile<TState>();
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      setToken(null);
      return null;
    }
    throw error;
  }
}

// ── Прогресс (только аккаунт; гость — см. guest.ts) ──────────────────

export function getAllProgress<TState extends GameState = GameState>(): Promise<ProgressModel<TState>[]> {
  return call<ProgressModel<TState>[]>("/me/progress");
}

/** Прогресс по профессии; revision = 0 — не начата (новая игра). */
export function getProgress<TState extends GameState = GameState>(
  professionCode: ProfessionCode,
): Promise<ProgressModel<TState>> {
  return call<ProgressModel<TState>>(`/me/progress/${encodeURIComponent(professionCode)}`);
}

/**
 * Сохранить прогресс. expectedRevision — revision из последнего ответа (0 для первого сохранения);
 * в ответе новая revision — её передать в следующий раз.
 * ApiError с ErrorCode.ProgressConflict — игра открыта в другой вкладке/устройстве: перечитать getProgress().
 */
export function saveProgress<TState extends GameState = GameState>(
  professionCode: ProfessionCode,
  form: SaveProgressForm<TState>,
): Promise<ProgressModel<TState>> {
  return call<ProgressModel<TState>>(`/me/progress/${encodeURIComponent(professionCode)}`, json("PUT", form));
}
