<script setup>
import {computed} from 'vue';
import {CalendarDays, Clock, PawPrint} from 'lucide-vue-next';

import GlareCard from '@/components/Ui/Inspira/GlareCard.vue';
import PatientModel from '@/components/Patients/PatientModel.vue';
import UiProgress from '@/components/Ui/UiProgress.vue';

const STAT_ICONS = Object.freeze({calendar: CalendarDays, clock: Clock, paw: PawPrint});

const props = defineProps({
    /** @type {import('vue').PropType<import('@/core/types/profession').Profession>} */
    profession: {type: Object, required: true},
    percent: {type: Number, default: null},
    isPatientSick: {type: Boolean, default: false},
});

const cardStyle = computed(() => ({'--accent': `var(--profession-${props.profession.code})`}));
</script>

<template>
    <GlareCard class="profession-card-holder">
        <article
            class="profession-card"
            :style="cardStyle"
        >
            <header class="profession-card__head">
                <h2 class="profession-card__title">{{ profession.title }}</h2>
                <PawPrint
                    class="profession-card__emblem"
                    :size="22"
                    aria-hidden="true"
                />
            </header>

            <div
                v-if="profession.patient"
                class="profession-card__art"
            >
                <PatientModel
                    :src="profession.patient.model"
                    :alt="`Пациент ${profession.patient.name}`"
                    :is-sick="isPatientSick"
                />
                <span class="profession-card__patient">{{ profession.patient.name }}</span>
            </div>

            <p class="profession-card__kind">{{ profession.kind }}</p>

            <ul class="profession-card__stats">
                <li
                    v-for="stat in profession.stats"
                    :key="stat.label"
                    class="profession-card__stat"
                >
                    <component
                        :is="STAT_ICONS[stat.icon]"
                        class="profession-card__stat-icon"
                        :size="16"
                        aria-hidden="true"
                    />
                    <span class="profession-card__stat-label">{{ stat.label }}</span>
                    <span class="profession-card__stat-value">{{ stat.value }}</span>
                </li>
            </ul>

            <p class="profession-card__tagline">{{ profession.tagline }}</p>

            <UiProgress
                v-if="percent !== null"
                :value="percent"
            />
        </article>
    </GlareCard>
</template>

<style lang="scss">
.profession-card-holder {
    border-radius: $radius-card;
}

.profession-card {
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

    &__title {
        @include display(clamp(24px, 2.6vw, 32px));
    }

    &__emblem {
        flex-shrink: 0;
        color: $color-accent;
    }

    &__art {
        position: relative;
        overflow: hidden;
        border: 3px solid $color-accent;
        border-radius: $radius-card-inner;
        background-color: $color-card-text-box;
    }

    &__patient {
        position: absolute;
        bottom: $indent-step * 2;
        left: $indent-step * 2;
        pointer-events: none;

        @include chip($color-white, $color-ink);
    }

    &__kind {
        color: $color-ink-soft;
        font-size: $font-size-xs;
        font-weight: $font-weight-semibold;
    }

    &__stats {
        display: grid;
        margin: 0;
        padding: 0;
        list-style: none;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: $indent-step * 2;
    }

    &__stat {
        display: flex;
        flex-direction: column;
        min-width: 0;
        border-radius: $radius-card-inner;
        background-color: $color-card-text-box;
        gap: 2px;

        @include padding('y', 2);
        @include padding('x', 2);
    }

    &__stat-icon {
        color: $color-accent;
    }

    &__stat-label {
        color: $color-ink-soft;
        font-size: 11px;
        line-height: 1.2;
    }

    &__stat-value {
        font-size: $font-size-xs;
        font-weight: $font-weight-bold;
        line-height: 1.3;
    }

    &__tagline {
        margin-top: auto;
        color: $color-ink-soft;
        font-size: $font-size-sm;
        line-height: 1.4;
    }
}
</style>
