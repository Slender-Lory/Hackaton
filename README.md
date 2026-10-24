# Тестовое приложение (шаблон)

Веб-приложение: **.NET 10 API + Vue (Vite) + PostgreSQL**, всё в Docker, с CI и скриптами деплоя.

## Как запустить — по шагам

### Шаг 1. Скопируйте настройки

```bash
cp .env.example .env
```

**Зачем:** в файле `.env` лежат все настройки приложения (порты, пароль БД, секреты). Он создаётся из примера и в git не коммитится.

**Можно пропустить:** если ничего не менять, приложение всё равно запустится — у каждой настройки есть рабочее значение по умолчанию.

### Шаг 2. При желании поменяйте настройки в `.env`

Откройте `.env` и поменяйте только то, что нужно именно вам:

| Переменная | Зачем она нужна | Значение по умолчанию |
|---|---|---|
| `POSTGRES_PASSWORD` | пароль базы данных. Поменяйте, если не хотите дефолтный `password` | `password` |
| `JWT_SECRET` | секрет для подписи токенов. Поменяйте на свой (длинный), если приложение будет не только для локальной разработки | `change_me_at_least_32_chars` |
| `CORS_ORIGIN` | с каких адресов разрешено обращаться к API. Меняйте, если фронтенд будет открываться с другого адреса | `http://localhost:5173` |
| `APP_PORT` / `FRONTEND_PORT` / `POSTGRES_PORT` | порты на хосте. Меняйте, если порт уже занят другой программой | `8080` / `5173` / `5432` |
| `DATABASE_URL` | строка подключения к БД. Меняйте, только если используете внешнюю БД | собирается из `POSTGRES_*` автоматически |
| `VITE_API_URL` | адрес API для браузера. Обычно менять не нужно | `/api` |

Полный список переменных — в `.env.example` с комментариями.

### Шаг 3. Запустите стек

```bash
make dev
```

Эта команда соберёт и запустит все три сервиса (PostgreSQL, backend, frontend) в Docker.

### Шаг 4. Проверьте, что всё работает

- **Frontend:** откройте http://localhost:5173
- **Swagger (API):** http://localhost:8080/swagger
- **Health:** http://localhost:8080/health — должно вернуть `{"status":"ok",...}`

### Шаг 5. Остановите стек

```bash
make down
```

## Деплой

Когда приложение готово, разверните его так:

```bash
./infra/deploy/deploy.sh up        # собрать, поднять, дождаться /health
./infra/deploy/deploy.sh logs      # логи (LOG_TAIL=200)
./infra/deploy/deploy.sh ps        # статус сервисов
./infra/deploy/deploy.sh down      # остановить
./infra/deploy/deploy.sh config    # показать итоговую конфигурацию (dry-run)
```

## Все команды

| Команда | Что делает |
|---|---|
| `make dev` | поднять весь стек в Docker (сборка + запуск) |
| `make up` / `make down` | запустить / остановить стек |
| `make logs` | логи сервисов (`SERVICE=backend`, `LOG_TAIL=200`) |
| `make test` | тесты: `dotnet test` + Vitest |
| `make lint` | ESLint для frontend |
| `make build` | `dotnet build` + `npm run build` (typecheck + сборка) |
| `make smoke` | проверить `/health` (`URL=http://localhost:8080`) |
| `make clean` | удалить артефакты сборок |

## Разработка без Docker

```bash
# БД — в Docker
docker compose up -d db

# Backend (порт 8080, Swagger на /swagger, тестовое меню на /test/)
cd backend && dotnet run --project Api

# Frontend (порт 5173) — запросы /api автоматически уходят на localhost:8080
cd frontend && npm install && npm run dev
```

Миграции БД применяются автоматически при старте backend (`Database__MigrateOnStartup=false` — отключить).

## Тестовое меню

В Development backend отдаёт две страницы для проверки API без фронтенда:

- http://localhost:8080/test/ — **игрок**: игра без регистрации (гость в `localStorage`, можно задать тестовый
  прогресс), регистрация и вход по почте с переносом прогресса гостя, профиль аккаунта, выход, удаление аккаунта;
- http://localhost:8080/test/admin.html — **администратор**: сводка, список аккаунтов с поиском,
  карточка игрока с прогрессом и State. Логин/пароль — `ADMIN_LOGIN` / `ADMIN_PASSWORD`
  (в Development по умолчанию `admin` / `admin12345`).

Сохранять прогресс игрока можно через Swagger (`PUT /api/v1/players/me/progress/vet`).

## Архитектура

```
Browser (Vue/Vite) → nginx (5173) → .NET API (8080) → PostgreSQL (5432)
```

- **Frontend** собирается Vite, отдаётся nginx'ом (SPA fallback → `index.html`, кэш ассетов).
- **Прокси `/api`**: dev — Vite (`vite.config.ts`), prod — nginx (`infra/nginx/nginx.conf`); путь передаётся как есть:
  браузер `/api/v1/players/login` → backend `/api/v1/players/login`. На фронте `api("/v1/players/login")`
  с базой `VITE_API_URL=/api`. Health для фронта — `/api/health`, для healthcheck'ов compose — `/health`.
- **Backend** — minimal API .NET 10: `/health` (liveness), `/ready` (readiness), `/api/v1/info`, Swagger в dev.
- **CORS** — из `CORS_ORIGIN` (список через запятую), в docker — http://localhost:5173.
- **БД** — PostgreSQL, инициализация SQL'ем из `infra/db/init/` при создании volume.

Порты на хосте задаются через `.env` (`APP_PORT`, `FRONTEND_PORT`, `POSTGRES_PORT`).

## API

Backend (minimal API .NET 10). В dev Swagger UI: http://localhost:8080/swagger

| Метод | Путь | Назначение | Ответ |
|---|---|---|---|
| GET | `/health` | liveness (healthcheck'и compose) | `{ status: "ok", service }` |
| GET | `/api/health` | то же для фронта (через прокси `/api`) | `{ status: "ok", service }` |
| GET | `/ready` | readiness: доступность БД; при `REQUIRE_DATABASE_URL=1` — ещё и наличие `DATABASE_URL` | `{ status: "ready" }` или 503 |
| GET | `/api/v1/info` | имя, версия, окружение | `{ name, version, environment, date }` |
| POST | `/api/v1/players/register` | регистрация `{ email, password, nickname, progress? }`; `progress` — прогресс гостя из `localStorage` | `{ player, token, expiresAt, importedProfessions, skippedProfessions }` |
| POST | `/api/v1/players/login` | вход `{ email, password, progress? }`; прогресс гостя — в не начатые профессии | `{ player, token, expiresAt, importedProfessions, skippedProfessions }` |
| POST | `/api/v1/players/logout` 🔒 | выход с этого устройства (токен перестаёт работать) | `true` |
| DELETE | `/api/v1/players/me` 🔒 | удаление аккаунта `{ password }` — аккаунт, прогресс, все сессии | `true` |
| GET | `/api/v1/players/me` 🔒 | профиль + прогресс по всем профессиям | `{ player, progress[] }` |
| GET | `/api/v1/players/me/progress/{professionCode}` 🔒 | прогресс по профессии (`revision: 0` — не начата) | `ProgressModel` |
| PUT | `/api/v1/players/me/progress/{professionCode}` 🔒 | сохранить `{ level, percent, difficulty, state, expectedRevision }` | `ProgressModel` |
| POST | `/api/v1/admin/login` | вход администратора `{ login, password }` (10 попыток в минуту) | `{ token, expiresAt, login }` |
| GET | `/api/v1/admin/players?search=&offset=&count=` 👑 | все аккаунты с кратким прогрессом, поиск по нику или почте | `{ items, total, offset, count }` |
| GET | `/api/v1/admin/players/{id}` 👑 | карточка игрока: прогресс со State | `AdminPlayerDetailsModel` |
| GET | `/api/v1/admin/stats` 👑 | всего игроков, новых/активных за сутки, прогресс по профессиям | `AdminStatsModel` |

🔒 — нужен заголовок `Authorization: Player <token>` (токен из register / login).
👑 — нужен заголовок `Authorization: Bearer <token администратора>` (JWT с ролью `admin`, живёт 12 часов).
Токены не взаимозаменяемы: токен игрока не открывает админку, админский — эндпоинты игрока.

Соглашения:

- JSON: camelCase, регистронезависимый парсинг.
- Ответы контроллеров — `{ result, error }`. Ошибка: `error: { code, message }`, где `code` — 8-значный код из
  `AppErrorCodes` (первые 2 цифры — группа), `message` — текст для игрока; HTTP-статус соответствует коду
  (400 форма, 401 нет входа / неверная почта или пароль, 403 неверный пароль при удалении аккаунта,
  409 почта занята / конфликт прогресса, 429 слишком много попыток). На фронте это `ApiError` (`client.ts`).
- CORS: заголовок задаётся переменной `CORS_ORIGIN` (несколько источников через запятую).

### Игроки и прогресс

По ТЗ v2.0 (`docs/app-flow.md` — схема пути игрока):

- **Гость** — только фронт: никнейм (не уникален) и прогресс лежат в `localStorage`, сервер о госте не знает.
  Перезагрузка страницы прогресс не сбрасывает. С другого устройства гость начинает заново.
- **Аккаунт** — почта (уникальна без учёта регистра, используется только для входа) и пароль от 8 символов,
  без подтверждения почты и без восстановления пароля. Прогресс хранится на сервере и возвращается при входе
  с любого устройства. Сессия — 30 дней с последнего использования, у каждого устройства своя.
- **Перенос прогресса гостя.** «Сохранить прогресс» = `register` с полем `progress` (прогресс из `localStorage`):
  аккаунт создаётся сразу с ним. `login` с `progress` переносит его в профессии, не начатые в аккаунте
  (`importedProfessions`); где начаты — остаётся прогресс аккаунта (`skippedProfessions`).
- **Удаление аккаунта** — `DELETE /players/me` с паролем: удаляются аккаунт, прогресс и сессии на всех устройствах.
- **Безопасность.** Сервер хранит только SHA-256 токенов сессий и PBKDF2-хеш пароля (ASP.NET Core Identity).
  Ошибка входа одна на «нет такой почты» и «неверный пароль». Регистрация, вход и удаление — не больше 10 попыток
  в минуту с IP (`AUTH_RATE_LIMIT_PER_MINUTE`).
- **Хранение** — схема `players`: `Players` (никнейм, почта, хеш пароля), `PlayerSessions` (хеш токена, срок жизни)
  и `PlayerProgress` (одна строка на игрока и профессию: `Level`, `Percent`, `Difficulty`, `State` jsonb, `Revision`).
  Удобно: `Level` — номер игрового дня, `Percent` — процент прохождения главы.
- **`State`** — произвольный JSON-объект игры (день, сцена, счётчики выручки/репутации/здоровья поросят,
  решения по пациентам), до 32 КБ. Формат определяет фронт, новые дни и пациенты не требуют миграций.
- **Конфликты.** Каждое сохранение увеличивает `revision`; в `expectedRevision` передаётся последняя известная.
  Сохранение из устаревшей вкладки получит 409 `ProgressConflict` и не затрёт новые данные.
- **Профессии** — `ProfessionCatalog` (сейчас `vet`).

### Структура backend

```
backend/
├── Api/                          # хост: контроллеры, аутентификация Guest и AdminJwt, wwwroot/test
├── Common/Hackat.Common.Result/  # AppResult<T> + AppErrorCodes (сервисы возвращают коды, а не бросают исключения)
├── Modules/Players/
│   ├── Hackat.Players.Contracts/ # формы (вход) и модели (выход) API
│   ├── Hackat.Players.Database/  # DbContext (схема players), сущности, миграции
│   └── Hackat.Players.Services/  # Service + DatabaseQueries на каждую фичу, AddPlayersServices()
└── Tests/Hackat.Players.Tests/   # интеграционные тесты: API + PostgreSQL в Testcontainers (нужен Docker)
```

Новая миграция (из `backend/`, нужен запущенный Postgres из docker-compose):

```bash
dotnet tool restore
dotnet ef migrations add <Name> -p Modules/Players/Hackat.Players.Database -s Api -o Migrations
```

## Troubleshooting

- **frontend не видит API** → проверьте, что backend отвечает: `/health`; посмотрите логи: `make logs` (или `SERVICE=backend make logs`).
- **БД не инициализируется** → SQL выполняется только при ПЕРВОМ старте volume `pgdata`; чтобы пересоздать: `docker compose down -v && docker compose up -d` (данные будут потеряны).
- **Порт занят** → переопределите в `.env`: `APP_PORT`, `FRONTEND_PORT`, `POSTGRES_PORT`.
- **`password authentication failed for user "user"` при `dotnet run`** → на 5432 отвечает другой PostgreSQL
  (например, установленный в Windows как служба), а не контейнер. Поставьте `POSTGRES_PORT=5433` в `.env`,
  перезапустите `db` и укажите порт в `ConnectionStrings__Default` (или остановите локальную службу).
- **Нет Swagger / тестового меню в Docker** → в `.env` должно быть `APP_ENV=Development`.
- **`npm ci` падает** → `frontend/package-lock.json` устарел: `cd frontend && npm install` и закоммитьте.

## Генерация нового проекта из шаблона

```bash
./scaffold.sh --name myapp                       # всё по умолчанию
./scaffold.sh --name myapp --app-port 9090 --frontend-port 3000
./scaffold.sh --name myapp --no-dotnet           # без dotnet-проектов
OUT=../projects ./scaffold.sh --name myapp       # сгенерировать в другой каталог
```

Скрипт соберёт дерево проекта, подставит имя и порты во все конфиги и создаст `frontend/package-lock.json` (требуется для `npm ci`).

## Структура

```
├── backend/            # .NET: Api (webapi) + опционально Application/Domain/Infrastructure/Contracts/tests
├── frontend/           # Vue 3 + TypeScript + Vite 5 (ESLint, Vitest)
├── infra/
│   ├── db/init/        # SQL, выполняется при первом старте БД
│   ├── docker/         # Dockerfile backend/frontend
│   ├── nginx/          # nginx: SPA fallback + прокси /api → backend
│   └── deploy/         # deploy.sh + docker-compose.demo.yml
├── scripts/            # dev.sh, smoke.sh
├── scaffold.sh         # генератор проекта из шаблона
└── Makefile            # единые команды (make dev/test/lint/...)
