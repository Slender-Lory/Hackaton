<script setup>
import {Lock, RotateCcw} from 'lucide-vue-next';
import {professions} from '@/core/data/professions';
import {usePlayerStore} from '@/core/stores/player';

import UiProgress from '@/components/Ui/UiProgress.vue';

const emit = defineEmits(['reset']);

const playerStore = usePlayerStore();
</script>

<template>
    <ul class="profession-progress">
        <li
            v-for="profession in professions"
            :key="profession.code"
            :class="['profession-progress__item', {'profession-progress__item--locked': !profession.isAvailable}]"
            :style="{'--accent': `var(--profession-${profession.code})`}"
        >
            <div class="profession-progress__head">
                <h3 class="profession-progress__title">{{ profession.title }}</h3>
                <span
                    v-if="!profession.isAvailable"
                    class="profession-progress__badge"
                >
                    <Lock
                        :size="14"
                        aria-hidden="true"
                    />
                    Скоро
                </span>
                <span
                    v-else-if="playerStore.getProgressSummary(profession.code)"
                    class="profession-progress__badge"
                >
                    Уровень {{ playerStore.getProgressSummary(profession.code).level }}
                </span>
                <span
                    v-else
                    class="profession-progress__badge"
                >
                    Не начата
                </span>
            </div>
            <UiProgress
                v-if="profession.isAvailable"
                :value="playerStore.getPercent(profession.code) ?? 0"
            />
            <button
                v-if="profession.isAvailable && playerStore.getProgressSummary(profession.code)"
                class="profession-progress__reset"
                type="button"
                @click="emit('reset', profession)"
            >
                <RotateCcw
                    :size="14"
                    aria-hidden="true"
                />
                Начать заново
            </button>
        </li>
    </ul>
</template>

<style lang="scss">
.profession-progress {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
    gap: $indent-step * 3;

    &__item {
        color: $color-ink;
        border: 3px solid $color-accent;
        border-radius: $radius-card-inner + 4px;
        background-color: $color-card-face;
        box-shadow: $shadow-button;

        @include column($indent-step * 3);
        @include padding('y', 4);
        @include padding('x', 5);

        &--locked {
            color: $color-on-playmat-soft;
            border-color: rgba($color-white, 20%);
            background-color: rgba($color-white, 8%);
            box-shadow: none;
        }
    }

    &__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: $indent-step * 3;
    }

    &__title {
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
    }

    &__badge {
        @include chip;
    }

    &__reset {
        display: inline-flex;
        align-items: center;
        align-self: flex-start;
        cursor: pointer;
        color: $color-ink-soft;
        font-size: $font-size-xs;
        font-weight: $font-weight-semibold;
        gap: $indent-step;

        @include button-reset;

        @include hover {
            color: $color-danger-text;
        }
    }
}
</style>
