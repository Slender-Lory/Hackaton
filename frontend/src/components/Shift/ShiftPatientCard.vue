<script setup>
import {PawPrint} from 'lucide-vue-next';

import PatientModel from '@/components/Patients/PatientModel.vue';

defineProps({
    /** @type {import('vue').PropType<import('@/core/types/shift').ShiftActivity>} */
    activity: {type: Object, required: true},
});
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
                :key="activity.patient.model"
                :src="activity.patient.model"
                :alt="`Пациент ${activity.patient.name}`"
                :is-sick="activity.patient.isSick"
            />
        </div>
        <p class="shift-patient-card__place">{{ activity.place }}</p>
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

    &__place {
        color: $color-ink-soft;
        font-size: $font-size-sm;
        font-weight: $font-weight-semibold;
    }
}
</style>
