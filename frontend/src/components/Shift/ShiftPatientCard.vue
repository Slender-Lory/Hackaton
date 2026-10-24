<script setup>
import {Bird, Cat, Dog, IdCard, PawPrint, PiggyBank} from 'lucide-vue-next';

import PatientModel from '@/components/Patients/PatientModel.vue';

const KIND_ICONS = Object.freeze({dog: Dog, cat: Cat, bird: Bird, pig: PiggyBank});

defineProps({
    /** @type {import('vue').PropType<import('@/core/types/shift').ShiftActivity>} */
    activity: {type: Object, required: true},
});

const emit = defineEmits(['passport']);
</script>

<template>
    <article class="shift-patient-card">
        <header class="shift-patient-card__head">
            <h2 class="shift-patient-card__name">{{ activity.patient.name }}</h2>
            <PawPrint
                class="shift-patient-card__emblem"
                :size="22"
                aria-hidden="true"
            />
        </header>
        <div class="shift-patient-card__art">
            <PatientModel
                v-if="activity.patient.model"
                :key="activity.patient.model"
                :src="activity.patient.model"
                :alt="`Пациент ${activity.patient.name}`"
                :is-sick="activity.patient.isSick"
            />
            <div
                v-else
                class="shift-patient-card__figure"
            >
                <component
                    :is="KIND_ICONS[activity.patient.kind]"
                    :size="96"
                    :stroke-width="1.25"
                    aria-hidden="true"
                />
            </div>
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
    }

    &__figure {
        aspect-ratio: 4 / 3;
        color: $color-accent;

        @include flex-center;
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
</style>
