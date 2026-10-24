<script setup>
import {computed} from 'vue';
import {formatAge, formatDate} from '@/core/utils/format';

import UiModal from '@/components/Ui/UiModal.vue';

const NOT_MEASURED = 'не измерено';

const props = defineProps({
    /** @type {import('vue').PropType<import('@/core/types/shift').ActivityPatient>} */
    patient: {type: Object, required: true},
    /** @type {import('vue').PropType<import('@/core/types/shift').PatientChart>} */
    chart: {type: Object, required: true},
});

const emit = defineEmits(['close']);

const passport = computed(() => props.patient.passport);
const age = computed(() => formatAge(passport.value.birthDate, new Date()));
const facts = computed(() =>
    [
        {label: 'Вид', value: passport.value.species},
        {label: 'Порода', value: passport.value.breed},
        {label: 'Пол', value: passport.value.sex},
        {
            label: 'Дата рождения',
            value: [formatDate(passport.value.birthDate), age.value && `(${age.value})`].filter(Boolean).join(' '),
        },
        {label: 'Владелец', value: passport.value.owner},
    ].filter((fact) => fact.value),
);
const vitals = computed(() =>
    props.patient.vitals.map((vital) => {
        const reading = props.chart.readings[vital.id];

        return {
            ...vital,
            shown: reading?.value ?? vital.value ?? NOT_MEASURED,
            isMeasured: Boolean(reading ?? vital.value),
            isAbnormal: Boolean(reading?.isAbnormal),
        };
    }),
);
</script>

<template>
    <UiModal
        :title="`Паспорт: ${patient.name}`"
        :description="passport.complaint"
        wide
        @close="emit('close')"
    >
        <div class="patient-passport">
            <dl class="patient-passport__facts">
                <div
                    v-for="fact in facts"
                    :key="fact.label"
                    class="patient-passport__fact"
                >
                    <dt class="patient-passport__label">{{ fact.label }}</dt>
                    <dd class="patient-passport__value">{{ fact.value }}</dd>
                </div>
            </dl>

            <section class="patient-passport__section">
                <h3 class="patient-passport__heading">Показатели</h3>
                <table class="patient-passport__vitals">
                    <thead>
                        <tr>
                            <th
                                class="patient-passport__cell patient-passport__cell--head"
                                scope="col"
                            >
                                Показатель
                            </th>
                            <th
                                class="patient-passport__cell patient-passport__cell--head"
                                scope="col"
                            >
                                Сейчас
                            </th>
                            <th
                                class="patient-passport__cell patient-passport__cell--head"
                                scope="col"
                            >
                                Норма
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="vital in vitals"
                            :key="vital.id"
                        >
                            <th
                                class="patient-passport__cell"
                                scope="row"
                            >
                                {{ vital.label }}
                            </th>
                            <td
                                :class="[
                                    'patient-passport__cell',
                                    {
                                        'patient-passport__cell--abnormal': vital.isAbnormal,
                                        'patient-passport__cell--empty': !vital.isMeasured,
                                    },
                                ]"
                            >
                                {{ vital.shown }}
                            </td>
                            <td class="patient-passport__cell">{{ vital.norm }}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section class="patient-passport__section">
                <h3 class="patient-passport__heading">Находки и анализы</h3>
                <ul
                    v-if="chart.findings.length"
                    class="patient-passport__list"
                >
                    <li
                        v-for="finding in chart.findings"
                        :key="finding.id"
                        class="patient-passport__finding"
                    >
                        <span class="patient-passport__label">{{ finding.source }} · {{ finding.label }}</span>
                        {{ finding.text }}
                    </li>
                </ul>
                <p
                    v-else
                    class="patient-passport__empty"
                >
                    Осмотра ещё не было.
                </p>
            </section>

            <section class="patient-passport__section">
                <h3 class="patient-passport__heading">Чем болел раньше</h3>
                <ul class="patient-passport__list">
                    <li
                        v-for="record in passport.history"
                        :key="record"
                    >
                        {{ record }}
                    </li>
                </ul>
            </section>

            <section class="patient-passport__section">
                <h3 class="patient-passport__heading">Прививки и обработки</h3>
                <ul
                    v-if="passport.vaccinations.length"
                    class="patient-passport__list"
                >
                    <li
                        v-for="vaccination in passport.vaccinations"
                        :key="vaccination.name"
                    >
                        {{ vaccination.name }} — {{ formatDate(vaccination.date) }}
                    </li>
                </ul>
                <p
                    v-else
                    class="patient-passport__empty"
                >
                    Прививок в паспорте нет.
                </p>
            </section>
        </div>
    </UiModal>
</template>

<style lang="scss">
.patient-passport {
    @include column($indent-step * 5);

    &__facts {
        display: grid;
        margin: 0;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: $indent-step * 2;
    }

    &__fact {
        border-radius: $radius-card-inner;
        background-color: $color-card-text-box;

        @include padding('y', 2);
        @include padding('x', 3);
    }

    &__label {
        display: block;
        color: $color-ink-soft;
        font-size: $font-size-xs;
        font-weight: $font-weight-semibold;
    }

    &__value {
        margin: 0;
        font-weight: $font-weight-bold;
    }

    &__section {
        @include column($indent-step * 2);
    }

    &__heading {
        font-size: $font-size-md;
        font-weight: $font-weight-bold;
    }

    &__vitals {
        width: 100%;
        border-collapse: collapse;
        font-size: $font-size-sm;
    }

    &__cell {
        text-align: left;
        border-bottom: 1px solid $color-card-text-box;

        @include padding('y', 2);
        @include padding('right', 2);

        &--head {
            color: $color-ink-soft;
            font-size: $font-size-xs;
            font-weight: $font-weight-semibold;
        }

        &--abnormal {
            color: $color-danger-text;
            font-weight: $font-weight-bold;
        }

        &--empty {
            color: $color-ink-soft;
        }
    }

    &__list {
        margin: 0;
        line-height: 1.45;

        @include column($indent-step * 2);
        @include padding('left', 5);
    }

    &__finding {
        list-style: none;
        margin-left: -$indent-step * 5;
        border-left: 3px solid $color-accent;

        @include padding('left', 3);
    }

    &__empty {
        color: $color-ink-soft;
        font-size: $font-size-sm;
    }
}
</style>
