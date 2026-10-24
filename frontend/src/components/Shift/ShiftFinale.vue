<script setup>
import {computed} from 'vue';
import {Layers, Play} from 'lucide-vue-next';
import {COUNTER_LABELS} from '@/core/data/shifts';
import {formatRubles} from '@/core/utils/format';

import UiButton from '@/components/Ui/UiButton.vue';

const props = defineProps({
    /** @type {import('vue').PropType<import('@/core/types/shift').Shift>} */
    shift: {type: Object, required: true},
    /** @type {import('vue').PropType<import('@/core/types/shift').Counters>} */
    counters: {type: Object, required: true},
    /** @type {import('vue').PropType<import('@/core/types/shift').Shift | null>} */
    nextShift: {type: Object, default: null},
    /** @type {import('vue').PropType<import('@/core/types/shift').ChapterEnding | null>} */
    ending: {type: Object, default: null},
});

const emit = defineEmits(['next', 'leave']);

const title = computed(() => props.ending?.title ?? props.shift.finale.title);
const text = computed(() => props.ending?.text ?? props.shift.finale.text);
const results = computed(() => [
    {code: 'revenue', label: COUNTER_LABELS.revenue, value: formatRubles(props.counters.revenue)},
    {code: 'reputation', label: COUNTER_LABELS.reputation, value: `${props.counters.reputation} из 100`},
    {code: 'pigHealth', label: COUNTER_LABELS.pigHealth, value: `${props.counters.pigHealth} из 100`},
]);
</script>

<template>
    <article
        :class="['shift-finale', {'shift-finale--chapter': ending}]"
        aria-labelledby="shift-finale-title"
    >
        <h2
            id="shift-finale-title"
            class="shift-finale__title"
        >
            {{ title }}
        </h2>
        <p class="shift-finale__text">{{ text }}</p>

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

        <p
            v-if="nextShift"
            class="shift-finale__next"
        >
            С этими итогами начнётся смена {{ nextShift.number }}: «{{ nextShift.title }}».
        </p>

        <div class="shift-finale__actions">
            <UiButton
                v-if="nextShift"
                @click="emit('next')"
            >
                <Play
                    :size="20"
                    aria-hidden="true"
                />
                Начать смену {{ nextShift.number }}
            </UiButton>
            <UiButton
                :theme="nextShift ? 'quiet' : 'action'"
                @click="emit('leave')"
            >
                <Layers
                    :size="20"
                    aria-hidden="true"
                />
                Вернуться к колоде
            </UiButton>
        </div>
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

    &--chapter {
        border-color: $color-action;
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

    &__actions {
        display: flex;
        flex-wrap: wrap;
        gap: $indent-step * 3;
    }
}
</style>
