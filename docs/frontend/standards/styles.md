# Стили: SCSS по БЭМ

Основа — правила стилей `cinet-nuxt`. Язык стилей один — SCSS. Tailwind — только внутри компонентов из китов (см. ниже).

## Где лежат стили

| Файл                                                                                 | Что                                                                                                                                                                            |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`vars.scss`](../../../frontend/src/assets/styles/vars.scss)                         | все токены: цвета, отступы, шрифты, радиусы, тени, z-index, длительности, брейкпоинты                                                                                          |
| [`mixins/`](../../../frontend/src/assets/styles/mixins/)                             | `breakpoints` (`tablet`, `mobile`), `hover`, `ui-space` (`padding`, `margin`), `layout` (`flex-center`, `column`, `button-reset`, `display`, `chip`, `card-face`, `card-back`) |
| [`shared-resources.scss`](../../../frontend/src/assets/styles/shared-resources.scss) | `vars` + все миксины; автоматически подключается в каждый `<style lang="scss">` через `vite.config.js`                                                                         |
| [`animations.scss`](../../../frontend/src/assets/styles/animations.scss)             | общие `@keyframes`: `fade-in`, `card-deal`, `card-hop`                                                                                                                         |
| [`global.scss`](../../../frontend/src/assets/styles/global.scss)                     | сброс, базовые стили `body`, CSS-переменные `--profession-*`, `prefers-reduced-motion`                                                                                         |

- Стили блока, который нужен одному компоненту и короче ~200 строк, пишем в `<style lang="scss">` этого SFC.
- Длиннее или нужен нескольким компонентам — отдельный файл в `assets/styles/` и `@import` внутри `<style>` (не `import` в `<script>`).
- `<style>` без `scoped`: изоляцию даёт уникальный БЭМ-блок.

## БЭМ

Имя блока = имя компонента в kebab-case: `ProfessionCard` → `.profession-card`, `UiButton` → `.ui-button`.

```scss
.profession-card {
  $block: &;

  @include card-face;

  &__title {
    @include display($font-size-lg);
  }

  &__stat-label {
    color: $color-ink-soft;
  }

  &--locked {
    background-color: $color-card-back;

    #{$block}__title {
      color: $color-white;
    }
  }
}
```

- Элементы и модификаторы — **только через `&`**, вложенно. Не пишем `.profession-card__title` отдельным правилом верхнего уровня.
- Модификатор меняет элементы через `$block: &` и `#{$block}__element`.
- Подблок компонента-детали — через `&-`: в `TheHeader.vue` стили `HeaderPlayer` живут как `.header { &-player { … } }`.
- Без общих имён `.container`, `.wrapper`, `.title`.
- Без селекторов по тегам и id для оформления; глобально только сброс в `global.scss`.
- Классы `<Transition name="x">` (`x-enter-from` и т.д.) задаёт Vue — их пишем как есть.

## Токены вместо магических чисел

- **Цвет** — только переменная из `vars.scss` (`$color-ink`, `$color-action`), прозрачность — `rgba($color-white, 12%)`. Хардкод `#…` в компонентах запрещён.
- **Отступы** — шаг `$indent-step` (4px): `gap: $indent-step * 3`, `@include padding('y', 4)`, `@include margin('top', 6)`.
- **Шрифты, радиусы, тени, z-index, длительности, кривые** — только переменные.
- **Повторилось три раза и больше** — новый миксин в `mixins/` или переменная в `vars.scss`.
- Локальная константа одного блока — переменная в начале его `<style>`: `$card-width: 320px;`.
- Устаревшие глобальные функции Sass (`map-get`, `lighten`, `/` для деления) не используем — сборка должна идти без предупреждений.

## Цвет профессии

- Карта палитр — `$professions` в `vars.scss`; глобально превращается в `--profession-vet`, `--profession-agro`, ….
- Компонент получает цвет через CSS-переменную `--accent` (`:style="{'--accent': 'var(--profession-vet)'}"`) и красит себя через `$color-accent`.

## Адаптив

- **Desktop-first:** базовые стили — десктоп, сужение — `@include tablet { … }` (≤860px) и `@include mobile { … }` (≤540px).
- Новые min-width-брейкпоинты не добавляем.
- Ховеры — через `@include hover { … }`: срабатывают только на устройствах с мышью.
- Проверяем на 1440 и 375: без горизонтальной прокрутки, главное действие в первом экране.

## Анимации

- Длительности и кривые — `$duration*`, `$ease-out`, `$ease-back-out`.
- Одна авторская анимация на экран (раздача карт, смена сцены пролога), остальное — отклик на действие пользователя.
- `prefers-reduced-motion` гасит анимации глобально; `!important` допустим только там.

## Tailwind

- Только в `components/Ui/Inspira/` и других портах из открытых китов — чтобы переносить их код без переписывания.
- Свои компоненты на утилитах Tailwind **не пишем**.
- Preflight выключен ([`tailwind.css`](../../../frontend/src/assets/styles/tailwind.css)).
