/**
 * Гостевой режим (ТЗ 2.1.1): никнейм и прогресс хранятся только в localStorage, сервер о госте не знает.
 * Перезагрузка страницы прогресс не сбрасывает. При регистрации/входе прогресс уходит на сервер
 * (toLocalProgress), после успеха гостя нужно стереть (clearGuest).
 */
import type { Difficulty, GameState, LocalProgress, ProfessionCode } from "./types";

const GUEST_KEY = "hackat.guest";

export interface GuestProgress<TState extends GameState = GameState> {
  level: number;
  percent: number;
  difficulty: Difficulty;
  state: TState | null;
  /** Когда сохранено в браузере (для отображения). */
  savedAt: string;
}

export interface Guest {
  nickname: string;
  progress: Partial<Record<ProfessionCode, GuestProgress>>;
}

let memoryGuest: Guest | null = null;

export function getGuest(): Guest | null {
  try {
    const raw = globalThis.localStorage?.getItem(GUEST_KEY);
    if (raw === undefined) return memoryGuest;
    return raw ? (JSON.parse(raw) as Guest) : null;
  } catch {
    return memoryGuest;
  }
}

function writeGuest(guest: Guest | null): void {
  memoryGuest = guest;
  try {
    if (guest) globalThis.localStorage?.setItem(GUEST_KEY, JSON.stringify(guest));
    else globalThis.localStorage?.removeItem(GUEST_KEY);
  } catch {
    // localStorage недоступен — хватит памяти
  }
}

/** Начать игру гостем. Никнейм не проверяется на уникальность. */
export function startGuest(nickname: string): Guest {
  const guest: Guest = { nickname: nickname.trim().replace(/\s+/g, " "), progress: {} };
  writeGuest(guest);
  return guest;
}

/** Сохранить прогресс гостя по профессии (вызывать в тех же контрольных точках, что и у аккаунта). */
export function saveGuestProgress<TState extends GameState>(
  professionCode: ProfessionCode,
  progress: Omit<GuestProgress<TState>, "savedAt">,
): void {
  const guest = getGuest();
  if (!guest) throw new Error("Гость не начал игру: сначала startGuest()");
  guest.progress[professionCode] = { ...progress, savedAt: new Date().toISOString() };
  writeGuest(guest);
}

export function getGuestProgress<TState extends GameState = GameState>(
  professionCode: ProfessionCode,
): GuestProgress<TState> | null {
  return (getGuest()?.progress[professionCode] as GuestProgress<TState> | undefined) ?? null;
}

/** Прогресс гостя в формате API — для register({ progress }) и login({ progress }). */
export function toLocalProgress(guest: Guest | null = getGuest()): LocalProgress[] {
  if (!guest) return [];
  return (Object.entries(guest.progress) as [ProfessionCode, GuestProgress | undefined][])
    .filter((entry): entry is [ProfessionCode, GuestProgress] => entry[1] !== undefined)
    .map(([professionCode, p]) => ({
      professionCode,
      level: p.level,
      percent: p.percent,
      difficulty: p.difficulty,
      state: p.state,
    }));
}

/** Стереть гостя: после регистрации/входа или если гость «выходит» (прогресс пропадёт). */
export function clearGuest(): void {
  writeGuest(null);
}
