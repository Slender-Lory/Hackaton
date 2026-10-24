# API для фронтенда

Контракт backend'а (ASP.NET, PostgreSQL) для Vue-фронта. Готовые типы и функции —
в `frontend/src/shared/api/` (импорт из `shared/api/index.ts`), ниже — что они делают и что отправляют.
Путь игрока целиком — в [`app-flow.md`](app-flow.md).

## Как ходить в API

- **База** — `VITE_API_URL` (по умолчанию `/api`). В dev Vite, в Docker nginx проксируют `/api/...` на backend
  без изменений. Все пути ниже — от `/api`.
- **JSON**, camelCase. Даты — строки ISO 8601 с часовым поясом.
- **Токен аккаунта** — `Authorization: Player <token>`. Выдаётся при регистрации/входе, хранится в
  `localStorage` (`hackat.token`, модуль `session.ts`), функции из `players.ts` подставляют его сами.
  Сессия живёт 30 дней с последнего запроса, у каждого устройства своя.
- **Гость** на сервер не ходит: никнейм и прогресс — в `localStorage` (`hackat.guest`, модуль `guest.ts`).
- **Ответ** всегда `{ result, error }`. Успех — HTTP 200 и `result`. Ошибка — HTTP-статус по коду и
  `error: { code, message }`, где `message` — готовый текст для игрока.
  Функции из `players.ts` возвращают `result`, а при ошибке бросают `ApiError`
  (`status`, `code`, `serverMessage`); `errorMessage(e)` даёт текст для показа, `isApiError(e, ErrorCode.X)` — проверку.

## Коды ошибок (`ErrorCode`)

| Код | Имя | HTTP | Когда |
|---|---|---|---|
| 10000003 | `InvalidForm` | 400 | неверные поля формы (текст — что именно) |
| 10000004 | `Unauthorized` | 401 | нет токена, он истёк или аккаунт удалён — показать вход |
| 10000006 | `TooManyRequests` | 429 | больше 10 попыток регистрации/входа/удаления в минуту |
| 20000002 | `PlayerNotFound` | 404 | игрок не найден |
| 20000003 | `EmailTaken` | 409 | почта уже зарегистрирована |
| 20000004 | `WrongEmailOrPassword` | 401 | неверная почта или пароль (одна ошибка на оба случая) |
| 20000006 | `WrongPassword` | 403 | неверный пароль при удалении аккаунта (сессия при этом жива) |
| 21000001 | `UnknownProfession` | 400 | неизвестный код профессии |
| 21000002 | `ProgressConflict` | 409 | прогресс уже сохранили в другой вкладке/на другом устройстве |
| 10000002 | `UnknownError` | 500 | сбой на сервере |

## Эндпоинты игрока

| Метод и путь | Функция | Нужен токен |
|---|---|---|
| `POST /v1/players/register` | `register()`, `registerFromGuest()` | нет |
| `POST /v1/players/login` | `login()`, `loginFromGuest()` | нет |
| `POST /v1/players/logout` | `logout()` | да |
| `DELETE /v1/players/me` | `deleteAccount()` | да |
| `GET /v1/players/me` | `getProfile()`, `restoreSession()` | да |
| `GET /v1/players/me/progress` | `getAllProgress()` | да |
| `GET /v1/players/me/progress/{code}` | `getProgress()` | да |
| `PUT /v1/players/me/progress/{code}` | `saveProgress()` | да |
| `GET /health` | `getHealth()` | нет |

### Регистрация — `POST /v1/players/register`

```json
{
  "email": "vasya@example.com",
  "password": "secret-123",
  "nickname": "Вася",
  "progress": [
    { "professionCode": "vet", "level": 2, "percent": 35, "difficulty": "Normal",
      "state": { "day": 2, "scene": "farm-visit-2" } }
  ]
}
```

- `password` — от 8 символов; `nickname` — 2–24 символа: буквы, цифры, пробел, `_`, `-` (не уникален).
- `progress` — необязателен: прогресс гостя из браузера, аккаунт создаётся сразу с ним
  (по одной записи на профессию, `state` — JSON-объект до 32 КБ).
- Ошибки: `InvalidForm`, `EmailTaken`, `UnknownProfession`, `TooManyRequests`.

Ответ (`AuthResult`):

```json
{
  "result": {
    "player": { "id": "01a1…", "nickname": "Вася", "email": "vasya@example.com", "createdAt": "2026-10-24T10:00:00+00:00" },
    "token": "S2x…",
    "expiresAt": "2026-11-23T10:00:00+00:00",
    "importedProfessions": ["vet"],
    "skippedProfessions": []
  },
  "error": null
}
```

### Вход — `POST /v1/players/login`

`{ "email", "password", "progress"? }`. Ответ — тот же `AuthResult`. Если передан `progress` гостя:
профессии, не начатые в аккаунте, получают прогресс из браузера (`importedProfessions`);
где уже есть прогресс аккаунта, он остаётся (`skippedProfessions`) — об этом стоит предупредить игрока.
Ошибки: `WrongEmailOrPassword`, `InvalidForm`, `TooManyRequests`.

### Выход — `POST /v1/players/logout`

Завершает сессию этого устройства (другие устройства не затрагиваются). Ответ `{ "result": true }`.

### Удаление аккаунта — `DELETE /v1/players/me`

Тело `{ "password": "…" }`. Удаляются аккаунт, прогресс и сессии на всех устройствах.
Ошибки: `WrongPassword` (403 — игрок остаётся в аккаунте), `TooManyRequests`.

### Профиль — `GET /v1/players/me`

```json
{
  "result": {
    "player": { "id": "01a1…", "nickname": "Вася", "email": "vasya@example.com", "createdAt": "…" },
    "progress": [
      { "professionCode": "vet", "professionTitle": "Ветеринар", "level": 2, "percent": 35,
        "difficulty": "Normal", "state": { "day": 2 }, "revision": 3, "updatedAt": "2026-10-24T10:30:00+00:00" }
    ]
  },
  "error": null
}
```

`progress` — по одной записи на каждую профессию; не начатая — `revision: 0`, `state: null`, `updatedAt: null`.

### Прогресс — `GET` / `PUT /v1/players/me/progress/{code}`

`GET` возвращает `ProgressModel` (как элемент `progress` выше). `PUT`:

```json
{ "level": 2, "percent": 40, "difficulty": "Normal",
  "state": { "day": 2, "scene": "triage", "counters": { "revenue": 120, "reputation": 15, "pigHealth": 60 } },
  "expectedRevision": 3 }
```

- `level` 0–1000 (удобно — номер игрового дня), `percent` 0–100 (процент главы), `difficulty` — `Easy` / `Normal` / `Hard`.
- `expectedRevision` — `revision` из последнего ответа (0 для первого сохранения). Ответ — `ProgressModel`
  с новой `revision`. Если на сервере уже другая ревизия — `409 ProgressConflict`: данные не затёрты,
  нужно перечитать `GET` и продолжить с серверной версии.

## Сценарии во фронте

```ts
import {
  restoreSession, getGuest, startGuest, saveGuestProgress, getGuestProgress,
  registerFromGuest, loginFromGuest, getProgress, saveProgress,
  logout, deleteAccount, isApiError, errorMessage, ErrorCode, Professions,
} from "../shared/api";

// 1. Открыли сайт: аккаунт → гость → экран входа
const profile = await restoreSession();          // null — токена нет или он истёк
const guest = profile ? null : getGuest();        // гость из localStorage

// 2. «Играть без регистрации»
startGuest("Вася");
saveGuestProgress(Professions.Veterinarian, { level: 1, percent: 5, difficulty: "Normal", state: { day: 1 } });
getGuestProgress(Professions.Veterinarian);       // переживает перезагрузку страницы

// 3. Гость: «Сохранить прогресс» или «Уже есть аккаунт»
try {
  const auth = await registerFromGuest(email, password);   // или loginFromGuest(email, password)
  if (auth.skippedProfessions.length) { /* предупредить: в аккаунте был свой прогресс */ }
} catch (e) {
  showError(errorMessage(e));                     // «Почта … уже зарегистрирована» и т.п.
}

// 4. Аккаунт: загрузка и сохранение в контрольных точках
let progress = await getProgress(Professions.Veterinarian);   // revision 0 — новая игра
try {
  progress = await saveProgress(Professions.Veterinarian, {
    level: 2, percent: 40, difficulty: progress.difficulty,
    state: gameState, expectedRevision: progress.revision,
  });
} catch (e) {
  if (isApiError(e, ErrorCode.ProgressConflict)) {
    progress = await getProgress(Professions.Veterinarian);   // продолжить с серверной версии
  } else throw e;
}

// 5. Выход и удаление
await logout();
await deleteAccount(password);                    // WrongPassword → errorMessage(e)
```

Свой тип состояния игры можно передать параметром: `getProgress<VetState>("vet")`,
`saveProgress<VetState>("vet", form)` — тогда `progress.state` типизирован.

## Администратор

Отдельно от игры: `POST /v1/admin/login` (логин/пароль из `ADMIN_LOGIN` / `ADMIN_PASSWORD`) →
`Authorization: Bearer <jwt>`; `GET /v1/admin/players`, `/v1/admin/players/{id}`, `/v1/admin/stats`.
Используется тестовой страницей `/test/admin.html`; TS-функций для игры не нужно.
