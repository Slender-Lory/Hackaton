# Vue 3

Основа — `vue3-standards.md` из `cinet-nuxt`, переложенный на JavaScript.

## SFC

Порядок блоков строгий:

```vue
<script setup></script>

<template></template>

<style lang="scss"></style>
```

- Только `<script setup>`, без Options API и `defineComponent`.
- Без `lang="ts"` — проект на JavaScript.
- Один компонент — один файл, имя файла = имя компонента (`ProfessionCard.vue`).

## Порядок внутри `<script setup>`

1. `import` — сначала библиотеки и `@/core`, затем пустая строка и компоненты.
2. Макросы: `defineProps`, `defineEmits`, `defineModel`, `defineExpose`.
3. Composables и stores (`storeToRefs` для состояния).
4. **Все** `ref` / `reactive` / `shallowRef` — одним блоком.
5. **Все** `computed` — одним блоком после состояния; не чередовать с `ref`.
6. `watch` / `watchEffect`.
7. Хуки жизненного цикла (`onMounted`, `onBeforeUnmount`).
8. Функции: обработчики `handle…`, помощники.

```vue
<script setup>
import { computed, ref } from "vue";
import { usePlayerStore } from "@/core/stores/player";

import UiButton from "@/components/Ui/UiButton.vue";

const props = defineProps({
  profession: { type: Object, required: true },
});

const emit = defineEmits(["play"]);

const playerStore = usePlayerStore();

const isShaking = ref(false);

const percent = computed(() => playerStore.getPercent(props.profession.code));

function handlePlay() {
  emit("play", props.profession);
}
</script>
```

## Props и emits (JavaScript)

```js
const props = defineProps({
  /** @type {import('vue').PropType<import('@/core/types/profession').Profession>} */
  profession: { type: Object, required: true },
  theme: {
    type: String,
    default: "action",
    validator: (value) => ["action", "ghost"].includes(value),
  },
  isPatientSick: { type: Boolean, default: false },
});

const emit = defineEmits(["play", "locked"]);
```

- У каждого prop — `type`; у необязательных — `default`; у перечислений — `validator`.
- Props только читаем. Двусторонняя связь — `defineModel()`.
- Булевы props — `is…`/`has…`; в шаблоне — `is-patient-sick` (kebab-case).

## Шаблон

- `:key` в `v-for` — стабильный id из данных, не индекс (индекс — только для статичного списка, который не меняется).
- `v-if` и `v-for` на одном элементе не ставим — фильтруем в `computed` или оборачиваем в `<template>`.
- Объекты и массивы в биндингах внутри `v-for` не создаём на лету — выносим в константу или `computed`.
- `v-html` не используем.
- Иконки — компоненты Lucide (`<Lock :size="16" aria-hidden="true" />`), не эмодзи и не символы.
- Инлайновый `:style` — только для действительно динамических значений (CSS-переменные `--accent`, `--tilt`, ширина прогресса).

## Composables

- Файл `useThing.js` в `composables/`, функция `export function useThing()`.
- Возвращает объект из `ref`/`computed`/функций: `{pendingProfession, startGame, cancelStart}`.
- Побочные эффекты (слушатели, таймеры) регистрирует в `onMounted` и снимает в `onBeforeUnmount`/`onScopeDispose`.
- Чистые функции без Vue — не composable, а `core/utils`.
- Composable не вызываем по условию — только на верхнем уровне `setup`.

## Pinia

- Сторы — в `core/stores/`, setup-синтаксис, один стор — один домен.
- Возвращаем **всё** состояние, геттеры и действия.
- В компоненте: состояние — через `storeToRefs`, действия — напрямую.

```js
const playerStore = usePlayerStore();
const { player, isSignedIn } = storeToRefs(playerStore);
const { startAsGuest } = playerStore;
```

- Никогда `const {player} = usePlayerStore()` — теряется реактивность.
- Состояние форм — в composable, не в Pinia.

## Роутер

- Только именованные маршруты из `ROUTE_NAMES`; строковые пути в `router.push` не пишем.
- Страницы — ленивые импорты (кроме стартовой).
- `useRoute()` / `useRouter()` внутри `<script setup>` или composable.

## Сеть

- В компонентах нет `fetch` и `api()`: компонент → composable/store → `core/api`.
- Ошибку сервера показываем через `getErrorMessage(error)`; проверка кода — `isApiError(error, ERROR_CODES.…)`.

## Окна, формы, доступность

- Модальные окна — только через `UiModal` (Reka UI Dialog): ловушка фокуса, Escape, возврат фокуса и aria уже внутри.
- У поля формы — связанный `<label for>`; ошибка — `role="alert"` и `aria-describedby`.
- У кнопки без текста — `aria-label`; декоративные иконки и фоны — `aria-hidden="true"`.
- Всё интерактивное — `<button>` или `<a>`/`RouterLink`, доступно с клавиатуры, видимый фокус не убираем.
- Анимации уважают `prefers-reduced-motion` (глобально в `global.scss`).

## Производительность

- Тяжёлые модули (3D, графики) — динамический `import()` в момент использования.
- Большие статичные данные — `Object.freeze`.
- Обработчики `scroll`/`resize`/`input` — с троттлингом/дебаунсом.
