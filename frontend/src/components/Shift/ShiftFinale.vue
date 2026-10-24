<script setup>
import {computed} from 'vue';
import {Check, Layers, Play, RotateCcw, Sprout} from 'lucide-vue-next';
import {ROUTE_NAMES} from '@/core/constants';
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
    /** @type {import('vue').PropType<import('@/core/utils/review').ChapterReview | null>} */
    review: {type: Object, default: null},
});

const emit = defineEmits(['next', 'restart', 'leave']);

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

        <section
            v-if="review"
            class="shift-finale__review"
            aria-label="Итог главы"
        >
            <p class="shift-finale__praise">{{ review.praise }}</p>
            <div
                v-if="review.strengths.length"
                class="shift-finale__group"
            >
                <h3 class="shift-finale__group-title">Что получилось</h3>
                <ul class="shift-finale__list">
                    <li
                        v-for="item in review.strengths"
                        :key="item"
                        class="shift-finale__item"
                    >
                        <Check
                            class="shift-finale__item-icon"
                            :size="18"
                            aria-hidden="true"
                        />
                        {{ item }}
                    </li>
                </ul>
            </div>
            <div
                v-if="review.growth.length"
                class="shift-finale__group"
            >
                <h3 class="shift-finale__group-title">Что можно сделать иначе</h3>
                <ul class="shift-finale__list">
                    <li
                        v-for="item in review.growth"
                        :key="item"
                        class="shift-finale__item"
                    >
                        <Sprout
                            class="shift-finale__item-icon shift-finale__item-icon--growth"
                            :size="18"
                            aria-hidden="true"
                        />
                        {{ item }}
                    </li>
                </ul>
            </div>
            <p class="shift-finale__profession">
                Обещания нужно сдерживать, а приоритеты — расставлять честно, помня и о пациентах, и о клинике. И всё же
                иногда детское желание спасти каждого оказывается самым верным. Такова профессия ветеринара: даже когда
                делаешь всё правильно, спасти удаётся не всех, и к этому нужно быть готовым. Ветеринар помогает тем, кто
                не может сказать, где болит, и часто работает не ради денег, а потому что любит своё дело и не может
                пройти мимо. Эта профессия меняет судьбы — и животных, и людей.
            </p>
            <RouterLink
                class="shift-finale__about"
                :to="{name: ROUTE_NAMES.professionAbout, params: {profession: 'vet'}}"
            >
                Как стать ветеринаром
            </RouterLink>
        </section>

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
                v-else
                @click="emit('restart')"
            >
                <RotateCcw
                    :size="20"
                    aria-hidden="true"
                />
                Пройти главу заново
            </UiButton>
            <UiButton
                theme="quiet"
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
    &__review {
        border-radius: $radius-card-inner;
        background-color: $color-card-text-box;

        @include column($indent-step * 4);
        @include padding('y', 4);
        @include padding('x', 4);
    }

    &__praise {
        font-size: $font-size-md;
        font-weight: $font-weight-semibold;
        line-height: 1.5;
    }

    &__group {
        @include column($indent-step * 2);
    }

    &__group-title {
        font-size: $font-size-sm;
        font-weight: $font-weight-bold;
    }

    &__list {
        margin: 0;
        padding: 0;
        list-style: none;

        @include column($indent-step * 2);
    }

    &__item {
        display: flex;
        align-items: flex-start;
        font-size: $font-size-sm;
        line-height: 1.4;
        gap: $indent-step * 2;
    }

    &__profession {
        color: $color-ink-soft;
        font-size: $font-size-sm;
        line-height: 1.5;
        border-top: 1px solid rgba($color-ink, 12%);

        @include padding('top', 3);
    }

    &__about {
        align-self: flex-start;
        color: $color-ink;
        font-weight: $font-weight-semibold;
        text-underline-offset: 3px;

        @include hover {
            color: $color-accent;
        }
    }

    &__item-icon {
        flex-shrink: 0;
        color: $color-accent;

        &--growth {
            color: $color-action-deep;
        }
    }

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
