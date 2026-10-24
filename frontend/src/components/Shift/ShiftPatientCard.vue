<script setup>
import {computed, ref} from 'vue';
import {ChevronLeft, ChevronRight, IdCard, PawPrint} from 'lucide-vue-next';

import PatientArt from '@/components/Patients/PatientArt.vue';

const SWIPE_DISTANCE = 40;

const props = defineProps({
    /** @type {import('vue').PropType<import('@/core/types/shift').ShiftActivity>} */
    activity: {type: Object, required: true},
});

const emit = defineEmits(['passport']);

const pigIndex = ref(0);
const swipeStartX = ref(null);

const herd = computed(() => props.activity.patient.herd ?? []);
const pig = computed(() => herd.value[pigIndex.value] ?? null);

/** @param {number} step */
function handleShift(step) {
    pigIndex.value = (pigIndex.value + step + herd.value.length) % herd.value.length;
}

/** @param {PointerEvent} event */
function handleSwipeStart(event) {
    swipeStartX.value = event.clientX;
}

/** @param {PointerEvent} event */
function handleSwipeEnd(event) {
    if (swipeStartX.value === null) {
        return;
    }

    const distance = event.clientX - swipeStartX.value;
    swipeStartX.value = null;

    if (Math.abs(distance) >= SWIPE_DISTANCE) {
        handleShift(distance < 0 ? 1 : -1);
    }
}
</script>

<template>
    <article class="shift-patient-card">
        <header class="shift-patient-card__head">
            <h2 class="shift-patient-card__name">{{ pig?.name ?? activity.patient.name }}</h2>
            <PawPrint
                class="shift-patient-card__emblem"
                :size="22"
                aria-hidden="true"
            />
        </header>

        <div
            class="shift-patient-card__art"
            @pointerdown="handleSwipeStart"
            @pointerup="handleSwipeEnd"
            @pointercancel="swipeStartX = null"
        >
            <Transition
                name="shift-patient-card-swap"
                mode="out-in"
            >
                <PatientArt
                    :key="pig?.id ?? activity.patient.id"
                    :kind="activity.patient.kind"
                    :is-sick="pig ? pig.condition !== 'carrier' : activity.patient.isSick"
                    :condition="pig?.condition ?? null"
                    :alt="`Пациент ${pig?.name ?? activity.patient.name}`"
                />
            </Transition>
        </div>

        <div
            v-if="pig"
            class="shift-patient-card__herd"
        >
            <div class="shift-patient-card__herd-nav">
                <button
                    class="shift-patient-card__arrow"
                    type="button"
                    aria-label="Предыдущий поросёнок"
                    @click="handleShift(-1)"
                >
                    <ChevronLeft
                        :size="20"
                        aria-hidden="true"
                    />
                </button>
                <ol
                    class="shift-patient-card__dots"
                    :aria-label="`Поросёнок ${pigIndex + 1} из ${herd.length}`"
                >
                    <li
                        v-for="(item, index) in herd"
                        :key="item.id"
                        :class="['shift-patient-card__dot', {'shift-patient-card__dot--active': index === pigIndex}]"
                    />
                </ol>
                <button
                    class="shift-patient-card__arrow"
                    type="button"
                    aria-label="Следующий поросёнок"
                    @click="handleShift(1)"
                >
                    <ChevronRight
                        :size="20"
                        aria-hidden="true"
                    />
                </button>
            </div>
            <p
                class="shift-patient-card__condition"
                aria-live="polite"
            >
                {{ pig.label }}
            </p>
            <p class="shift-patient-card__note">{{ pig.note }}</p>
        </div>

        <p class="shift-patient-card__place">{{ activity.patient.passport.species }} · {{ activity.place }}</p>
        <button
            class="shift-patient-card__passport"
            type="button"
            @click="emit('passport')"
        >
            <IdCard
                :size="18"
                aria-hidden="true"
            />
            Открыть паспорт
        </button>
    </article>
</template>

<style lang="scss">
$arrow-size: 36px;
$dot-size: 8px;

.shift-patient-card {
    color: $color-ink;

    @include card-face;
    @include column($indent-step * 3);
    @include padding('y', 4);
    @include padding('x', 4);

    &__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: $indent-step * 2;
    }

    &__name {
        @include display(clamp(24px, 2.6vw, 32px));
    }

    &__emblem {
        flex-shrink: 0;
        color: $color-accent;
    }

    &__art {
        overflow: hidden;
        border: 3px solid $color-accent;
        border-radius: $radius-card-inner;
        background-color: $color-card-text-box;
        touch-action: pan-y;

        @include padding('y', 3);
        @include padding('x', 3);
    }

    &__herd {
        @include column($indent-step * 2);
    }

    &__herd-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: $indent-step * 2;
    }

    &__arrow {
        width: $arrow-size;
        height: $arrow-size;
        cursor: pointer;
        color: $color-ink;
        border-radius: $radius-chip;
        background-color: $color-card-text-box;

        @include button-reset;
        @include flex-center;

        @include hover {
            background-color: $color-accent;
            color: $color-white;
        }

        &:focus-visible {
            outline: 2px solid $color-accent;
            outline-offset: 2px;
        }
    }

    &__dots {
        display: flex;
        margin: 0;
        padding: 0;
        list-style: none;
        gap: $indent-step * 1.5;
    }

    &__dot {
        width: $dot-size;
        height: $dot-size;
        transition: background-color $duration ease;
        border-radius: $radius-chip;
        background-color: $color-card-text-box;

        &--active {
            background-color: $color-accent;
        }
    }

    &__condition {
        font-weight: $font-weight-semibold;
    }

    &__note {
        color: $color-ink-soft;
        font-size: $font-size-sm;
    }

    &__passport {
        justify-content: center;
        cursor: pointer;

        @include button-reset;
        @include chip;

        font-size: $font-size-sm;

        @include padding('y', 2);

        @include hover {
            background-color: $color-white;
        }
    }

    &__place {
        color: $color-ink-soft;
        font-size: $font-size-sm;
        font-weight: $font-weight-semibold;
    }
}

.shift-patient-card-swap-enter-active,
.shift-patient-card-swap-leave-active {
    transition:
        opacity $duration $ease-out,
        transform $duration $ease-out;
}

.shift-patient-card-swap-enter-from {
    transform: translateX($indent-step * 6);
    opacity: 0;
}

.shift-patient-card-swap-leave-to {
    transform: translateX(-$indent-step * 6);
    opacity: 0;
}
</style>
