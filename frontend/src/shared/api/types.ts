/**
 * Контракт API backend'а (ASP.NET, /api/v1). Типы повторяют C#-модели
 * из backend/Modules/Players/Hackat.Players.Contracts — меняются вместе с ними.
 * Описание эндпоинтов и сценариев: docs/api.md.
 */

// ── Общий формат ответа ──────────────────────────────────────────────

/** Коды ошибок backend'а (AppErrorCodes): 8 цифр, первые две — группа. */
export const ErrorCode = {
  Ok: 10000001,
  UnknownError: 10000002,
  InvalidForm: 10000003,
  Unauthorized: 10000004,
  Forbidden: 10000005,
  TooManyRequests: 10000006,

  PlayerNotFound: 20000002,
  EmailTaken: 20000003,
  WrongEmailOrPassword: 20000004,
  WrongPassword: 20000006,

  UnknownProfession: 21000001,
  ProgressConflict: 21000002,

  InvalidCredentials: 30000001,
  AdminLoginDisabled: 30000002,
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Ошибка в ответе: message — готовый текст для игрока (на русском). */
export interface AppError {
  code: ErrorCode;
  message: string;
}

/** Любой ответ контроллера: либо result, либо error (+ HTTP-статус по коду ошибки). */
export interface AppResult<T> {
  result?: T | null;
  error?: AppError | null;
}

/** Даты приходят строкой ISO 8601 с часовым поясом. */
export type IsoDateTime = string;

// ── Профессии и прогресс ─────────────────────────────────────────────

/** Код профессии из ProfessionCatalog на backend'е. Сейчас только ветеринар. */
export type ProfessionCode = "vet";

export const Professions = {
  Veterinarian: "vet",
} as const satisfies Record<string, ProfessionCode>;

export type Difficulty = "Easy" | "Normal" | "Hard";

/**
 * Произвольный JSON-объект состояния игры (до 32 КБ): день, сцена, счётчики, решения.
 * Формат определяет фронт; можно задать свой тип через параметр TState.
 */
export type GameState = Record<string, unknown>;

/** Прогресс по профессии. revision = 0 — профессия ещё не начата. */
export interface ProgressModel<TState extends GameState = GameState> {
  professionCode: ProfessionCode;
  professionTitle: string;
  /** Удобно: номер игрового дня. */
  level: number;
  /** 0–100 — процент прохождения главы. */
  percent: number;
  difficulty: Difficulty;
  state: TState | null;
  revision: number;
  updatedAt: IsoDateTime | null;
}

/** Тело PUT /players/me/progress/{code}. */
export interface SaveProgressForm<TState extends GameState = GameState> {
  /** 0–1000. */
  level: number;
  /** 0–100. */
  percent: number;
  difficulty?: Difficulty;
  state?: TState | null;
  /** Ревизия из последнего ответа сервера; 0 — первое сохранение. */
  expectedRevision: number;
}

/** Прогресс гостя из localStorage — уходит на сервер при регистрации/входе. */
export interface LocalProgress<TState extends GameState = GameState> {
  professionCode: ProfessionCode;
  level: number;
  percent: number;
  difficulty?: Difficulty;
  state?: TState | null;
}

// ── Игрок и аккаунт ──────────────────────────────────────────────────

export interface PlayerModel {
  id: string;
  /** Как к игроку обращаются персонажи. Не уникален. */
  nickname: string;
  email: string;
  createdAt: IsoDateTime;
}

export interface PlayerProfile<TState extends GameState = GameState> {
  player: PlayerModel;
  /** По одной записи на каждую профессию каталога (не начатые — с revision = 0). */
  progress: ProgressModel<TState>[];
}

export interface RegisterForm {
  email: string;
  /** Не короче 8 символов. */
  password: string;
  /** 2–24 символа: буквы, цифры, пробел, «_», «-». */
  nickname: string;
  /** Прогресс гостя — аккаунт создаётся сразу с ним. */
  progress?: LocalProgress[];
}

export interface LoginForm {
  email: string;
  password: string;
  /** Прогресс гостя — переносится в профессии, не начатые в аккаунте. */
  progress?: LocalProgress[];
}

/** Ответ регистрации и входа. */
export interface AuthResult {
  player: PlayerModel;
  /** Токен сессии устройства: Authorization: Player <token>. Хранить в localStorage. */
  token: string;
  /** Сессия продлевается при использовании (30 дней с последнего запроса). */
  expiresAt: IsoDateTime;
  /** Профессии, прогресс которых перенесён из браузера. */
  importedProfessions: ProfessionCode[];
  /** Профессии из браузера, которые в аккаунте уже были начаты — там остался прогресс аккаунта. */
  skippedProfessions: ProfessionCode[];
}
