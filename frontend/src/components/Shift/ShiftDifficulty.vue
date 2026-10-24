<script setup>
import {Lightbulb, LightbulbOff, Sparkles} from 'lucide-vue-next';
import {DIFFICULTIES} from '@/core/constants';

const LEVELS = Object.freeze([
    {
        value: DIFFICULTIES.easy,
        title: 'Лёгкий',
        text: 'Подробные подсказки на каждом шаге: что проверить и почему.',
        icon: Sparkles,
    },
    {
        value: DIFFICULTIES.normal,
        title: 'Обычный',
        text: 'Подсказки-намёки: куда смотреть, но без готового ответа.',
        icon: Lightbulb,
    },
    {
        value: DIFFICULTIES.hard,
        title: 'Сложный',
        text: 'Без подсказок. Только осмотр, паспорт пациента и твоё решение.',
        icon: LightbulbOff,
    },
]);

const emit = defineEmits(['choose']);
</script>

<template>
    <section
        class="shift-difficulty"
        aria-labelledby="shift-difficulty-title"
    >
        <h2
            id="shift-difficulty-title"
            class="shift-difficulty__title"
        >
            Выбери сложность
        </h2>
        <p class="shift-difficulty__lead">
            От неё зависят подсказки. Поменять сложность можно, только начав главу заново.
        </p>
        <div class="shift-difficulty__levels">
            <button
                v-for="level in LEVELS"
                :key="level.value"
                class="shift-difficulty__level"
                type="button"
                @click="emit('choose', level.value)"
            >
                <component
                    :is="level.icon"
                    class="shift-difficulty__icon"
                    :size="28"
                    aria-hidden="true"
                />
                <span class="shift-difficulty__name">{{ level.title }}</span>
                <span class="shift-difficulty__text">{{ level.text }}</span>
            </button>
        </div>
    </section>
</template>

<style lang="scss">
.shift-difficulty {
    color: $color-ink;

    @include card-face;
    @include column($indent-step * 4);
    @include padding('y', 6);
    @include padding('x', 6);

    @include mobile {
        @include padding('y', 5);
        @include padding('x', 4);
    }

    &__title {
        @include display($font-size-xl);
    }

    &__lead {
        color: $color-ink-soft;
    }

    &__levels {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: $indent-step * 3;

        @include tablet {
            grid-template-columns: 1fr;
        }
    }

    &__level {
        display: flex;
        align-items: flex-start;
        flex-direction: column;
        cursor: pointer;
        transition:
            transform $duration-fast $ease-out,
            border-color $duration ease;
        text-align: left;
        color: $color-ink;
        border: 3px solid $color-card-text-box;
        border-radius: $radius-card-inner + 4px;
        background-color: $color-white;
        gap: $indent-step * 2;

        @include padding('y', 4);
        @include padding('x', 4);

        @include hover {
            transform: translateY(-2px);
            border-color: $color-accent;
        }
    }

    &__icon {
        color: $color-accent;
    }

    &__name {
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
    }

    &__text {
        color: $color-ink-soft;
        font-size: $font-size-sm;
        line-height: 1.4;
    }
}
</style>
