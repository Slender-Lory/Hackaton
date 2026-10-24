# Архитектура фронтенда

## Стек

| Что            | Чем                                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Фреймворк      | Vue 3, только Composition API и `<script setup>`                                                                             |
| Язык           | JavaScript (ES2022). TypeScript **не используется**; модели описываются JSDoc                                                |
| Сборка         | Vite 5, алиас `@/` → `frontend/src/`                                                                                         |
| Состояние      | Pinia, setup-сторы                                                                                                           |
| Маршруты       | vue-router 4, history mode                                                                                                   |
| Стили          | SCSS по БЭМ; Tailwind v4 только внутри компонентов из открытых китов                                                         |
| UI-киты        | Reka UI (примитивы, на них построен shadcn-vue), порты из Inspira UI, иконки Lucide                                          |
| 3D             | `@google/model-viewer`, модели `.glb` в `public/models`                                                                      |
| Тесты          | Vitest                                                                                                                       |
| Форматирование | Prettier ([`.prettierrc.js`](../../frontend/.prettierrc.js)), ESLint ([`eslint.config.js`](../../frontend/eslint.config.js)) |

Структура и стиль кода повторяют банковский проект `cinet-nuxt` (Nuxt 3), адаптированные под Vite и JavaScript.

## Структура

```
frontend/
├── index.html            # шрифты, <title>, точка монтирования #root
├── public/models/        # 3D-модели .glb (источники и лицензии — CREDITS.md)
├── CREDITS.md            # все сторонние материалы и их лицензии
└── src/
    ├── main.js           # createApp + Pinia + router + глобальные стили
    ├── App.vue           # DefaultLayout + RouterView + ToastContainer
    ├── router/           # маршруты; имена — только из ROUTE_NAMES
    ├── layouts/          # каркас страницы: фон, шапка, <main>
    ├── pages/            # страница = маршрут; только собирает компоненты
    ├── components/       # UI, разложенный по доменам
    │   ├── Ui/           #   общие кирпичики: UiButton, UiField, UiModal, UiProgress
    │   │   └── Inspira/  #   порты из Inspira UI (Tailwind внутри)
    │   ├── Header/       #   TheHeader, HeaderPlayer
    │   ├── Professions/  #   колода: ProfessionsPicker, ProfessionCard, ProfessionCardBack
    │   ├── Patients/     #   3D-пациенты: PatientModel
    │   ├── Clinic/       #   план клиники
    │   ├── Shift/        #   смена: счётчики, шаги дела (сцена, выбор, обследование), финал
    │   ├── Forms/        #   формы входа
    │   └── toast/        #   всплывающие уведомления
    ├── composables/      # логика компонентов: useStartGame, useNicknameForm, useAuthForm, useStoryScenes, useShift
    ├── core/             # всё без разметки
    │   ├── api/          #   http-клиент и запросы к backend'у — единственное место с сетью
    │   ├── constants/    #   значения, нужные в ≥2 местах: ROUTE_NAMES, лимиты, коды ошибок
    │   ├── data/         #   статический контент: профессии, пролог, план клиники, смены, репутация
    │   ├── helpers/      #   функции с побочными эффектами: хранилища, разбор ошибок
    │   ├── utils/        #   чистые функции: валидация, расчёт счётчиков смены, форматирование
    │   ├── stores/       #   Pinia: player, authDialog, toast
    │   └── types/        #   модели в JSDoc — зеркало контрактов backend'а
    └── assets/styles/    # vars, mixins, shared-resources, animations, global, tailwind
```

Новый домен — новая папка в `components/` (`components/Farm/`, `components/Triage/`), а не плоская свалка в корне `components/`.

## Кто кого импортирует

```
pages → layouts, components, composables, core
components → components/Ui, composables, core
composables → core
core/stores → core/api, core/helpers, core/utils, core/constants
core/api → core/api/client, core/helpers
core/utils, core/constants, core/data, core/types → ничего из приложения
```

- `core/` никогда не импортирует `.vue`-файлы.
- Компоненты не ходят в сеть: только через store или composable, те — через `core/api`.
- Импорты — через `@/`, относительные пути только внутри одной папки.

## Поток данных

```
Страница → компонент → composable / store → core/api → backend /api/v1/...
                ↑                ↓
             props/emit     core/data (статический контент)
```

- **Статический контент** (профессии, тексты пролога, комнаты клиники) — в `core/data/` как замороженные массивы. Новая профессия или сцена = новая запись в данных, без правки компонентов.
- **Сеть** — `core/api/client.js` (`api`, `http`, `ApiError`) и доменные модули (`core/api/players.js`). Ответы backend'а приходят как `{result, error}`; наружу отдаём `result`.
- **Ошибки для игрока** — `core/helpers/getErrorMessage.js` превращает `ApiError` в понятный текст. Сырые ошибки сервера в шаблон не выводим.

## Состояние (Pinia)

| Store        | Что хранит                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `player`     | аккаунт или гость, прогресс по профессиям, вход/регистрация/выход, `getPercent(code)`, `getProgressState`/`saveProgress` |
| `authDialog` | открыто ли окно входа и в каком режиме (`AUTH_MODES`)                                                                    |
| `toast`      | очередь всплывающих уведомлений (`show`, `removeToast`)                                                                  |

Состояние формы живёт в composable (`useNicknameForm`, `useAuthForm`), не в Pinia.

## Аккаунт и гость

- **Гость** — никнейм и прогресс в `localStorage` (`core/helpers/guestStorage.js`, ключ `hackat.guest`).
- **Аккаунт** — токен в `localStorage` (`core/helpers/tokenStorage.js`, ключ `hackat.token`), заголовок `Authorization: Player <token>`.
- `localStorage` читаем только через `safeStorage` — он не падает в приватном режиме.
- Полная схема путей игрока — [app-flow.md](../app-flow.md), эндпоинты — [api.md](../api.md).

## Маршруты

| Путь                         | Имя (`ROUTE_NAMES`) | Страница                     |
| ---------------------------- | ------------------- | ---------------------------- |
| `/`                          | → `professions`     | редирект                     |
| `/professions`               | `professions`       | выбор профессии, колода карт |
| `/game/:profession/prologue` | `prologue`          | пролог перед первой сменой   |
| `/game/:profession`          | `game`              | экран смены                  |
| `/profile`                   | `profile`           | профиль игрока               |

- Переходы только по имени: `router.push({name: ROUTE_NAMES.game, params: {profession}})`.
- Страницы, кроме первой, грузятся лениво: `component: () => import('@/pages/…')`.

## 3D-пациенты

- Модели — CC0 от Quaternius в `public/models/*.glb`; каждая записана в [`CREDITS.md`](../../frontend/CREDITS.md).
- Показ — `components/Patients/PatientModel.vue` на `<model-viewer>`; модуль подгружается лениво (`await import('@google/model-viewer')`), отдельным чанком.
- Анимации берутся по имени из файла модели (`Idle`, `Idle_2_HeadLow`, `Idle_HitReact_*`). Посмотреть список: `document.querySelector('model-viewer').availableAnimations`.
- `<model-viewer>` объявлен веб-компонентом в `vite.config.js` (`isCustomElement`).

## Смена

- Контент смены — `core/data/shifts.js`: дела (`activities`) привязаны к комнатам плана (`roomCode`), внутри — шаги `story` / `choice` / `checklist`. Новое дело или смена — запись в данных.
- Расчёт последствий — чистые функции `core/utils/shift.js` (`getStepResult`, `applyEffects`, `getChapterPercent`).
- `useShift` держит `ShiftState` (`core/types/shift.js`) и после каждого ответа сохраняет его через `playerStore.saveProgress`: гость — в `localStorage`, аккаунт — `PUT /players/me/progress/vet`. Сохранения идут по очереди; на `409 ProgressConflict` состояние перечитывается с сервера.
- Ответ на шаг пишется сразу, поэтому перезагрузка не даёт переиграть выбор, а дело продолжается с первого шага без ответа.

## Tailwind

Подключён только для компонентов из открытых китов (сейчас `components/Ui/Inspira/`). Preflight выключен: сброс и базовые стили — в `global.scss`. Свои компоненты на Tailwind **не пишем** — только SCSS по БЭМ.
