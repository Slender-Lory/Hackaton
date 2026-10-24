<script setup>
import {computed, ref} from 'vue';
import {Check, ClipboardCheck, X} from 'lucide-vue-next';
import {getChecklistBudget, getChecklistCost} from '@/core/utils/shift';
import {formatRubles} from '@/core/utils/format';

import UiButton from '@/components/Ui/UiButton.vue';

const PAYER_LABELS = Object.freeze({owner: 'Готов заплатить владелец', clinic: 'В кассе клиники'});

const props = defineProps({
    /** @type {import('vue').PropType<import('@/core/types/shift').ChecklistStep>} */
    step: {type: Object, required: true},
    /** @type {import('vue').PropType<string[] | null>} */
    answer: {type: Array, default: null},
    revenue: {type: Number, required: true},
});

const emit = defineEmits(['answer']);

/** @type {import('vue').Ref<string[]>} */
const selectedIds = ref([...(props.answer ?? [])]);

const isAnswered = computed(() => props.answer !== null);
const budget = computed(() => getChecklistBudget(props.step, props.revenue));
const spent = computed(() => getChecklistCost(props.step, selectedIds.value));
const options = computed(() =>
    props.step.options.map((option) => {
        const isSelected = selectedIds.value.includes(option.id);

        return {
            ...option,
            isSelected,
            isOverBudget: !isSelected && spent.value + option.cost > budget.value,
            verdict: getVerdict(option, isSelected),
        };
    }),
);

/**
 * @param {import('@/core/types/shift').ChecklistOption} option
 * @param {boolean} isSelected
 * @returns {string}
 */
function getVerdict(option, isSelected) {
    if (!isAnswered.value || option.isNeeded === isSelected) {
        return '';
    }

    return option.isNeeded ? 'Нужно было' : 'Лишнее';
}

/** @param {string} optionId */
function handleToggle(optionId) {
    selectedIds.value = selectedIds.value.includes(optionId)
        ? selectedIds.value.filter((id) => id !== optionId)
        : [...selectedIds.value, optionId];
}

function handleSubmit() {
    emit('answer', [...selectedIds.value]);
}
</script>

<template>
    <div class="shift-checklist">
        <p class="shift-checklist__budget">
            <span>{{ PAYER_LABELS[step.payer] }}: {{ formatRubles(budget) }}</span>
            <span class="shift-checklist__spent">Выбрано на {{ formatRubles(spent) }}</span>
        </p>

        <ul class="shift-checklist__list">
            <li
                v-for="option in options"
                :key="option.id"
            >
                <label
                    :class="[
                        'shift-checklist__option',
                        {
                            'shift-checklist__option--selected': option.isSelected,
                            'shift-checklist__option--disabled': isAnswered || option.isOverBudget,
                            'shift-checklist__option--dimmed':
                                (isAnswered || option.isOverBudget) && !option.isSelected,
                        },
                    ]"
                >
                    <input
                        class="shift-checklist__input"
                        type="checkbox"
                        :checked="option.isSelected"
                        :disabled="isAnswered || option.isOverBudget"
                        @change="handleToggle(option.id)"
                    />
                    <span
                        class="shift-checklist__box"
                        aria-hidden="true"
                    >
                        <Check
                            v-if="option.isSelected"
                            :size="16"
                        />
                    </span>
                    <span class="shift-checklist__label">{{ option.label }}</span>
                    <span
                        v-if="option.verdict"
                        class="shift-checklist__verdict"
                    >
                        <X
                            :size="14"
                            aria-hidden="true"
                        />
                        {{ option.verdict }}
                    </span>
                    <span class="shift-checklist__cost">
                        {{ option.cost ? formatRubles(option.cost) : 'Бесплатно' }}
                    </span>
                </label>
            </li>
        </ul>

        <UiButton
            v-if="!isAnswered"
            :disabled="!selectedIds.length"
            @click="handleSubmit"
        >
            <ClipboardCheck
                :size="20"
                aria-hidden="true"
            />
            Назначить
        </UiButton>
    </div>
</template>

<style lang="scss">
$box-size: 24px;

.shift-checklist {
    $block: &;

    align-items: flex-start;

    @include column($indent-step * 4);

    &__budget {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        width: 100%;
        font-size: $font-size-sm;
        font-weight: $font-weight-semibold;
        gap: $indent-step * 2;
    }

    &__spent {
        color: $color-ink-soft;
        font-variant-numeric: tabular-nums;
    }

    &__list {
        display: grid;
        width: 100%;
        margin: 0;
        padding: 0;
        list-style: none;
        gap: $indent-step * 2;
    }

    &__option {
        position: relative;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        cursor: pointer;
        transition: border-color $duration ease;
        border: 3px solid $color-card-text-box;
        border-radius: $radius-card-inner + 4px;
        background-color: $color-white;
        gap: $indent-step * 3;

        @include padding('y', 3);
        @include padding('x', 4);

        @include hover {
            border-color: $color-accent;
        }

        &:focus-within {
            outline: 2px solid $color-accent;
            outline-offset: 2px;
        }

        &--disabled {
            cursor: default;

            @include hover {
                border-color: $color-card-text-box;
            }
        }

        &--selected {
            border-color: $color-accent;
            background-color: $color-card-text-box;

            @include hover {
                border-color: $color-accent;
            }

            #{$block}__box {
                border-color: $color-accent;
                background-color: $color-accent;
            }
        }

        &--dimmed {
            opacity: 0.55;
        }
    }

    &__input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
    }

    &__box {
        flex-shrink: 0;
        width: $box-size;
        height: $box-size;
        color: $color-white;
        border: 2px solid $color-ink-soft;
        border-radius: $indent-step * 2;

        @include flex-center;
    }

    &__label {
        flex: 1;
        min-width: 120px;
        font-weight: $font-weight-semibold;
    }

    &__verdict {
        @include chip(rgba($color-danger, 18%), $color-danger-text);
    }

    &__cost {
        color: $color-ink-soft;
        font-size: $font-size-sm;
        font-variant-numeric: tabular-nums;
    }
}
</style>
