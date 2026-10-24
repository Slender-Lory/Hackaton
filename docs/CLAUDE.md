# CLAUDE.md

Инструкция для Claude Code по этому репозиторию. **Временный файл:** удалить перед сдачей проекта. Подключается через локальный `CLAUDE.md` в корне (он не в git) строкой `@docs/CLAUDE.md`.

## Проект

Хакатон «Центр-инвест»: браузерная игра «Ветеринар» для подростков 14–16 лет — профориентация через смену в ветклинике.

- `frontend/` — Vue 3 + JavaScript + Vite + Pinia + SCSS (БЭМ). Структура и стиль — как в банковском `cinet-nuxt`.
- `backend/` — .NET 10 API, PostgreSQL. Эндпоинты — [api.md](api.md), путь игрока — [app-flow.md](app-flow.md).

## Перед любой правкой фронтенда

Прочитай [frontend/README.md](frontend/README.md) и стандарт своей области из [frontend/standards/](frontend/standards/). Источник истины — `docs/`; не пересказывай правила из памяти, открывай файлы.

| Задача                                                        | Читать                                                               |
| ------------------------------------------------------------- | -------------------------------------------------------------------- |
| Где что лежит, кто кого импортирует, сторы, маршруты          | [frontend/architecture.md](frontend/architecture.md)                 |
| JS: функции, имена, константы, JSDoc, ошибки, комментарии     | [frontend/standards/code-style.md](frontend/standards/code-style.md) |
| Vue: SFC, порядок `<script setup>`, props, composables, Pinia | [frontend/standards/vue.md](frontend/standards/vue.md)               |
| SCSS, БЭМ, токены, адаптив, Tailwind                          | [frontend/standards/styles.md](frontend/standards/styles.md)         |
| Тесты                                                         | [frontend/standards/testing.md](frontend/standards/testing.md)       |
| Цвета, шрифты, компоненты `Ui*`, тексты, ассеты               | [frontend/design-system.md](frontend/design-system.md)               |

## Самое важное (кратко)

- **JavaScript, не TypeScript.** Без `lang="ts"`; модели — JSDoc в `core/types/`.
- **Функции — `function name()`**, стрелки только inline; обработчики `handle…`; без сокращений (`index`, `event`, `error`).
- **Сеть — только `core/api/`**; компонент → composable/store → api. Состояние форм — в composable, не в Pinia.
- **Стили — SCSS по БЭМ** через `&`, без `scoped`, без хардкода цветов и чисел: только токены из `vars.scss` и миксины. Повтор ≥3 раз → миксин/переменная.
- **Tailwind — только в портах китов** (`components/Ui/Inspira/`).
- **Без поясняющих комментариев.** Можно: JSDoc-типы и строка авторства для портированного кода по лицензии.
- **Иконки — Lucide**, не эмодзи. Окна — `UiModal` (Reka UI), поля — `UiField`.
- **Сторонние ассеты** — только CC0/MIT/ISC/Apache/OFL и строка в `frontend/CREDITS.md`.

## Как работать

1. Минимальный diff: не трогай то, что не относится к задаче. В проекте параллельно работают другие — не переписывай чужие файлы без нужды.
2. После правок, из `frontend/`: `npm run format`, `npm run lint`, `npm test`, `npm run build` — всё зелёное, без предупреждений Sass.
3. Видимое изменение — проверь в браузере на ширине 1440 и 375: backend на 8080, frontend на 5173.
4. Дизайн-задачи — через скиллы `frontend-design` / `impeccable`; их рабочие файлы (`.impeccable/`, `PRODUCT.md`) не коммитить без согласия.

## Git

- Ветка под задачу — от свежей `develop`, слияние — пулл-реквестом. Удалённый репозиторий: `origin` → Slender-Lory/Hackaton.
- Коммит и push — только когда об этом попросили.
- **Никаких** `Co-Authored-By: Claude`, «Generated with Claude Code» и папок `.claude/`, `.agents/`, `.impeccable/` в коммитах.
