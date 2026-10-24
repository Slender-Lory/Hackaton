<script setup>
import {computed} from 'vue';
import {HeartPulse, Star, Wallet} from 'lucide-vue-next';
import {COUNTER_LABELS} from '@/core/data/shifts';
import {formatRubles} from '@/core/utils/format';

const LOW_LEVEL = 35;

const props = defineProps({
    /** @type {import('vue').PropType<import('@/core/types/shift').Counters>} */
    counters: {type: Object, required: true},
});

const scales = computed(() => [
    {code: 'reputation', icon: Star, label: COUNTER_LABELS.reputation, value: props.counters.reputation},
    {code: 'pigHealth', icon: HeartPulse, label: COUNTER_LABELS.pigHealth, value: props.counters.pigHealth},
]);
</script>

<template>
    <ul
        class="shift-counters"
        aria-label="Счётчики смены"
    >
        <li class="shift-counters__item">
            <Wallet
                class="shift-counters__icon"
                :size="20"
                aria-hidden="true"
            />
            <span class="shift-counters__label">{{ COUNTER_LABELS.revenue }}</span>
            <span class="shift-counters__value">{{ formatRubles(counters.revenue) }}</span>
        </li>
        <li
            v-for="scale in scales"
            :key="scale.code"
            :class="['shift-counters__item', {'shift-counters__item--low': scale.value < LOW_LEVEL}]"
        >
            <component
                :is="scale.icon"
                class="shift-counters__icon"
                :size="20"
                aria-hidden="true"
            />
            <span class="shift-counters__label">{{ scale.label }}</span>
            <span class="shift-counters__value">
                {{ scale.value }}
                <span class="shift-counters__max">/100</span>
            </span>
            <span
                class="shift-counters__track"
                role="meter"
                :aria-label="scale.label"
                :aria-valuenow="scale.value"
                aria-valuemin="0"
                aria-valuemax="100"
            >
                <span
                    class="shift-counters__fill"
                    :style="{width: `${scale.value}%`}"
                />
            </span>
        </li>
    </ul>
</template>

<style lang="scss">
.shift-counters {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: $indent-step * 3;

    &__item {
        $item: &;

        display: grid;
        align-content: start;
        border: 2px solid rgba($color-white, 22%);
        border-radius: $radius-card-inner + 4px;
        background-color: rgba($color-white, 8%);
        grid-template-columns: auto 1fr;
        gap: $indent-step $indent-step * 2;

        @include padding('y', 3);
        @include padding('x', 4);

        &--low {
            border-color: $color-danger;

            #{$item}__icon {
                color: $color-danger;
            }

            #{$item}__fill {
                background-color: $color-danger;
            }
        }
    }

    &__icon {
        color: $color-action;
        grid-row: span 2;
    }

    &__label {
        color: $color-on-playmat-soft;
        font-size: $font-size-xs;
        font-weight: $font-weight-semibold;
    }

    &__value {
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
        font-variant-numeric: tabular-nums;
        line-height: 1.2;
    }

    &__max {
        color: $color-on-playmat-soft;
        font-size: $font-size-xs;
        font-weight: $font-weight-semibold;
    }

    &__track {
        overflow: hidden;
        height: 6px;
        border-radius: $radius-chip;
        background-color: rgba($color-white, 18%);
        grid-column: 1 / -1;
    }

    &__fill {
        display: block;
        height: 100%;
        transition: width $duration-slow $ease-out;
        border-radius: inherit;
        background-color: $color-profession-vet;
    }

    @include mobile {
        gap: $indent-step * 2;

        &__item {
            grid-template-columns: 1fr;

            @include padding('x', 3);
        }

        &__icon {
            grid-row: auto;
        }

        &__value {
            font-size: $font-size-md;
        }
    }
}
</style>
