# Frontend — Vue 3 + JavaScript + Vite + Pinia + SCSS

Структура и стиль кода — как в `cinet-nuxt` (банковский стандарт Vue 3).

```
src/
├── main.js              # createApp + Pinia + router + global.scss
├── App.vue              # DefaultLayout + RouterView + ToastContainer
├── router/              # маршруты (имена — ROUTE_NAMES из core/constants)
├── layouts/             # DefaultLayout: фон-степь, шапка, <main>
├── pages/               # страницы = маршруты; только собирают компоненты
│   ├── ProfessionsPage.vue
│   └── GamePage.vue
├── components/          # UI по доменам
│   ├── Ui/              #   UiButton, UiModal, UiProgress — общие кирпичики
│   ├── Header/          #   TheHeader, HeaderPlayer
│   ├── Professions/     #   ProfessionsPicker, ProfessionCard
│   ├── Forms/           #   NicknameForm
│   ├── toast/           #   ToastContainer, ToastElement
│   └── SteppeBackdrop.vue
├── composables/         # логика компонентов: useStartGame, useNicknameForm
├── core/                # всё без разметки
│   ├── api/             #   http-клиент и запросы к backend'у (players.js)
│   ├── constants/       #   значения, нужные в ≥2 местах (ROUTE_NAMES, лимиты ника)
│   ├── data/            #   статический контент (каталог профессий)
│   ├── helpers/         #   getErrorMessage, safeStorage
│   ├── utils/           #   чистые функции (валидация ника)
│   ├── stores/          #   Pinia: player, toast
│   └── types/           #   модели в JSDoc — зеркало контрактов backend'а
└── assets/styles/
    ├── vars.scss            # цвета, отступы, шрифты, радиусы, тени, z-index, брейкпоинты
    ├── mixins/              # breakpoints, hover, ui-space, layout, accent
    ├── shared-resources.scss# vars + mixins — подключается в каждый <style lang="scss"> автоматически
    ├── animations.scss      # общие @keyframes
    └── global.scss          # reset, CSS-переменные профессий, базовые стили
```

## Правила

- **SFC:** `<script setup>` → `<template>` → `<style lang="scss">`. В `<script setup>` порядок: импорты → `defineProps`/`defineEmits` → composables/stores → `ref` → `computed` → `watch` → lifecycle → функции.
- **Функции** — `function name() {}`, стрелки только для inline-колбэков. Обработчики — `handle…`. Без сокращений (`index`, не `i`).
- **Сеть** — только в `core/api`; компоненты зовут store или composable.
- **Стили — SCSS по БЭМ** (`block__element--modifier`), связанные классы через `&`, модификатор влияет на элементы через `#{$block}__element`. Никаких «магических» значений: цвета, отступы (`$indent-step` и миксины `padding`/`margin`), шрифты, тени — из `vars.scss`. Повторяющееся ≥3 раз — миксин в `mixins/`.
- **Цвет профессии** — CSS-переменная `--profession-<code>` (из карты `$professions`); компонент получает её как `--accent` и красит себя через `$color-accent` и `accent-tint()/accent-fade()/accent-shade()`.
- **Форматирование** — Prettier (`.prettierrc.js`: 4 пробела, одинарные кавычки, 120 символов).

## Как добавить

- **Профессию** — запись в `core/data/professions.js` и цвет в `$professions` (`vars.scss`). `isAvailable: true` — играбельна.
- **Страницу** — `pages/<Имя>Page.vue`, имя в `ROUTE_NAMES`, маршрут в `router/index.js`.

## Команды

```bash
npm run dev      # http://localhost:5173, /api проксируется на http://localhost:8080
npm run format   # Prettier
npm run lint
npm test
npm run build
```
