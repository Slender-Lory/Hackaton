<script setup>
import {computed} from 'vue';
import {Layers} from 'lucide-vue-next';
import {COUNTER_LABELS} from '@/core/data/shifts';
import {formatRubles} from '@/core/utils/format';

import UiButton from '@/components/Ui/UiButton.vue';

const props = defineProps({
    /** @type {import('vue').PropType<import('@/core/types/shift').Shift>} */
    shift: {type: Object, required: true},
    /** @type {import('vue').PropType<import('@/core/types/shift').Counters>} */
    counters: {type: Object, required: true},
});

const emit = defineEmits(['leave']);

const results = computed(() => [
    {code: 'revenue', label: COUNTER_LABELS.revenue, value: formatRubles(props.counters.revenue)},
    {code: 'reputation', label: COUNTER_LABELS.reputation, value: `${props.counters.reputation} из 100`},
    {code: 'pigHealth', label: COUNTER_LABELS.pigHealth, value: `${props.counters.pigHealth} из 100`},
]);
</script>

<template>
    <article
        class="shift-finale"
        aria-labelledby="shift-finale-title"
    >
        <h2
            id="shift-finale-title"
            class="shift-finale__title"
        >
            {{ shift.finale.title }}
        </h2>
        <p class="shift-finale__text">{{ shift.finale.text }}</p>

        <dl class="shift-finale__results">
            <div
                v-for="result in results"
                :key="result.code"
                class="shift-finale__result"
            >
                <dt class="shift-finale__label">{{ result.label }}</dt>
                <dd class="shift-finale__value">{{ result.value }}</dd>
            </div>
        </dl>

        <p class="shift-finale__next">Смена {{ shift.number + 1 }} пока в разработке: с этими итогами ты её начнёшь.</p>

        <UiButton @click="emit('leave')">
            <Layers
                :size="20"
                aria-hidden="true"
            />
            Вернуться к колоде
        </UiButton>
    </article>
</template>

<style lang="scss">
.shift-finale {
    align-items: flex-start;
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

    &__text {
        max-width: 60ch;
        line-height: 1.5;
    }

    &__results {
        display: grid;
        width: 100%;
        margin: 0;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: $indent-step * 2;

        @include mobile {
            grid-template-columns: 1fr;
        }
    }

    &__result {
        border-radius: $radius-card-inner;
        background-color: $color-card-text-box;

        @include padding('y', 3);
        @include padding('x', 3);
    }

    &__label {
        color: $color-ink-soft;
        font-size: $font-size-xs;
        font-weight: $font-weight-semibold;
    }

    &__value {
        margin: 0;
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
    }

    &__next {
        color: $color-ink-soft;
        font-size: $font-size-sm;
    }
}
</style>
