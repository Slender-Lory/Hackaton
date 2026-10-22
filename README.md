# Тестовое приложение (шаблон)

Веб-приложение: **.NET 10 API + React (Vite) + PostgreSQL**, всё в Docker, с CI и скриптами деплоя.

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
# Backend (порт 8080, Swagger на /swagger)
cd backend && dotnet run --project Api

# Frontend (порт 5173) — запросы /api автоматически уходят на localhost:8080
cd frontend && npm install && npm run dev
```

## Архитектура

```
Browser (React/Vite) → nginx (5173) → .NET API (8080) → PostgreSQL (5432)
```

- **Frontend** собирается Vite, отдаётся nginx'ом (SPA fallback → `index.html`, кэш ассетов).
- **Прокси `/api`**: dev — Vite (`vite.config.ts`), prod — nginx (`infra/nginx/nginx.conf`); префикс `/api` снимается, backend получает запросы как `/health`, `/api/v1/...`.
- **Backend** — minimal API .NET 10: `/health` (liveness), `/ready` (readiness), `/api/v1/info`, Swagger в dev.
- **CORS** — из `CORS_ORIGIN` (список через запятую), в docker — http://localhost:5173.
- **БД** — PostgreSQL, инициализация SQL'ем из `infra/db/init/` при создании volume.

Порты на хосте задаются через `.env` (`APP_PORT`, `FRONTEND_PORT`, `POSTGRES_PORT`).

## API

Backend (minimal API .NET 10). В dev Swagger UI: http://localhost:8080/swagger

| Метод | Путь | Назначение | Ответ |
|---|---|---|---|
| GET | `/health` | liveness (healthcheck'и compose) | `{ status: "ok", service }` |
| GET | `/ready` | readiness; при `REQUIRE_DATABASE_URL=1` проверяет наличие `DATABASE_URL` | `{ status: "ready" }` или 503 |
| GET | `/api/v1/info` | имя, версия, окружение | `{ name, version, environment, date }` |

Соглашения:

- JSON: camelCase, регистронезависимый парсинг.
- Ошибки API — HTTP-статусы; фронт получает их как `ApiError` (`client.ts`) с полями `status`, `url`, `body`.
- CORS: заголовок задаётся переменной `CORS_ORIGIN` (несколько источников через запятую).

## Troubleshooting

- **frontend не видит API** → проверьте, что backend отвечает: `/health`; посмотрите логи: `make logs` (или `SERVICE=backend make logs`).
- **БД не инициализируется** → SQL выполняется только при ПЕРВОМ старте volume `pgdata`; чтобы пересоздать: `docker compose down -v && docker compose up -d` (данные будут потеряны).
- **Порт занят** → переопределите в `.env`: `APP_PORT`, `FRONTEND_PORT`, `POSTGRES_PORT`.
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
├── frontend/           # React 18 + TypeScript + Vite 5 (ESLint, Vitest)
├── infra/
│   ├── db/init/        # SQL, выполняется при первом старте БД
│   ├── docker/         # Dockerfile backend/frontend
│   ├── nginx/          # nginx: SPA fallback + прокси /api → backend
│   └── deploy/         # deploy.sh + docker-compose.demo.yml
├── scripts/            # dev.sh, smoke.sh
├── scaffold.sh         # генератор проекта из шаблона
└── Makefile            # единые команды (make dev/test/lint/...)
