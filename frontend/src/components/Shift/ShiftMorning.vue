<script setup>
import {Sunrise} from 'lucide-vue-next';

import ShiftEffects from '@/components/Shift/ShiftEffects.vue';

defineProps({
    /** @type {import('vue').PropType<import('@/core/types/shift').MorningEvent[]>} */
    events: {type: Array, required: true},
});
</script>

<template>
    <section
        class="shift-morning"
        aria-labelledby="shift-morning-title"
    >
        <h2
            id="shift-morning-title"
            class="shift-morning__title"
        >
            <Sunrise
                :size="20"
                aria-hidden="true"
            />
            Что случилось за ночь
        </h2>
        <ul class="shift-morning__list">
            <li
                v-for="event in events"
                :key="event.id"
                class="shift-morning__event"
            >
                <p>{{ event.text }}</p>
                <ShiftEffects
                    v-if="event.effects"
                    :effects="event.effects"
                />
            </li>
        </ul>
    </section>
</template>

<style lang="scss">
.shift-morning {
    color: $color-ink;
    border-radius: $radius-card;
    background-color: $color-card-face;
    box-shadow: $shadow-button;

    @include column($indent-step * 3);
    @include padding('y', 4);
    @include padding('x', 5);

    &__title {
        display: flex;
        align-items: center;
        font-size: $font-size-md;
        font-weight: $font-weight-bold;
        gap: $indent-step * 2;
    }

    &__list {
        display: grid;
        margin: 0;
        padding: 0;
        list-style: none;
        gap: $indent-step * 3;
    }

    &__event {
        line-height: 1.4;

        @include column($indent-step * 2);
    }
}
</style>
