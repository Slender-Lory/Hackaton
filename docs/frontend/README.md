# Frontend: документация

Vue 3 + JavaScript + Vite + Pinia + SCSS (БЭМ). Код — в [`frontend/`](../../frontend/).

Перед правкой кода прочитай документ по своей области. Правила обязательны для всех, кто пишет фронтенд: и для людей, и для автоматических помощников.

| Документ                                           | Что внутри                                                                                         |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [architecture.md](architecture.md)                 | Структура папок, слои, кто кого импортирует, поток данных, маршруты, состояние                     |
| [standards/code-style.md](standards/code-style.md) | Общие правила JS: функции, имена, константы, JSDoc-модели, ошибки, комментарии, Prettier           |
| [standards/vue.md](standards/vue.md)               | SFC, порядок в `<script setup>`, props/emits, composables, Pinia, роутер, API, доступность         |
| [standards/styles.md](standards/styles.md)         | SCSS по БЭМ, переменные и миксины, адаптив, Tailwind только для китов                              |
| [standards/testing.md](standards/testing.md)       | Vitest: что и как тестировать                                                                      |
| [design-system.md](design-system.md)               | Визуальный мир «коллекционные карты», токены, компоненты `Ui*`, тексты, анимации, сторонние ассеты |

Связанные документы: [схема приложения](../app-flow.md), [API backend'а](../api.md), [инструкция для Claude Code](../CLAUDE.md) (временная).

## Быстрый старт

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173, /api проксируется на http://localhost:8080
```

Backend и база — в корневом [README](../../README.md).

## Перед коммитом

```bash
npm run format   # Prettier
npm run lint     # ESLint, 0 ошибок
npm test         # Vitest, всё зелёное
npm run build    # сборка без ошибок и предупреждений Sass
```

Изменение видно глазами — проверь в браузере на ширине 1440 и 375.

## Git

- Новая задача — новая ветка от свежей `develop`; в `develop` — через пулл-реквест.
- Сообщения коммитов — conventional commits: `feat(frontend): …`, `fix(frontend): …`, `refactor(frontend): …`, `docs: …`.
- В репозитории не должно быть следов ИИ-ассистентов: ни папок `.claude/`, `.agents/`, `.impeccable/`, ни строк `Co-Authored-By` с ассистентом в коммитах.

## Когда обновлять документацию

- Поменялась структура, слой или поток данных → [architecture.md](architecture.md).
- Появилось новое правило или договорённость → соответствующий файл в [standards/](standards/).
- Новый токен, компонент `Ui*` или сторонний ассет → [design-system.md](design-system.md) и [`frontend/CREDITS.md`](../../frontend/CREDITS.md).
