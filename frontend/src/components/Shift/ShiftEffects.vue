<script setup>
import {computed} from 'vue';
import {HeartPulse, Star, Wallet} from 'lucide-vue-next';
import {COUNTER_LABELS} from '@/core/data/shifts';
import {formatRubles, formatSigned} from '@/core/utils/format';

const COUNTER_ICONS = Object.freeze({revenue: Wallet, reputation: Star, pigHealth: HeartPulse});

const props = defineProps({
    /** @type {import('vue').PropType<import('@/core/types/shift').Effects>} */
    effects: {type: Object, required: true},
});

const items = computed(() =>
    Object.entries(props.effects)
        .filter(([, value]) => value !== 0)
        .map(([counter, value]) => ({
            counter,
            icon: COUNTER_ICONS[counter],
            isGood: value > 0,
            text:
                counter === 'revenue'
                    ? formatSigned(value, formatRubles)
                    : `${COUNTER_LABELS[counter]} ${formatSigned(value)}`,
        })),
);
</script>

<template>
    <ul
        v-if="items.length"
        class="shift-effects"
        aria-label="Последствия"
    >
        <li
            v-for="item in items"
            :key="item.counter"
            :class="['shift-effects__item', item.isGood ? 'shift-effects__item--good' : 'shift-effects__item--bad']"
        >
            <component
                :is="item.icon"
                :size="14"
                aria-hidden="true"
            />
            {{ item.text }}
        </li>
    </ul>
</template>

<style lang="scss">
.shift-effects {
    display: flex;
    flex-wrap: wrap;
    margin: 0;
    padding: 0;
    list-style: none;
    gap: $indent-step * 2;

    &__item {
        &--good {
            @include chip(rgba($color-profession-vet, 18%));
        }

        &--bad {
            @include chip(rgba($color-danger, 18%), $color-danger-text);
        }
    }
}
</style>
