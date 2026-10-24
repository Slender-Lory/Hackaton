<script setup>
import {computed, ref} from 'vue';
import {Bone, Check, Grab, Hand, Shield, Shirt} from 'lucide-vue-next';
import {getUnaffordableOptionIds} from '@/core/utils/shift';
import {formatRubles} from '@/core/utils/format';

import UiButton from '@/components/Ui/UiButton.vue';

const SHORT_OF_MONEY = 'Не хватает денег';
const ACTION_ICONS = Object.freeze({bone: Bone, hand: Hand, grab: Grab, shield: Shield, towel: Shirt});

const props = defineProps({
    /** @type {import('vue').PropType<import('@/core/types/shift').ChoiceStep>} */
    step: {type: Object, required: true},
    answer: {type: String, default: null},
    revenue: {type: Number, required: true},
    /** @type {import('vue').PropType<Record<string, string>>} */
    lockedOptions: {type: Object, default: () => ({})},
});

const emit = defineEmits(['answer']);

/** @type {import('vue').Ref<string | null>} */
const selectedId = ref(null);

const isAnswered = computed(() => props.answer !== null);
const isNonVerbal = computed(() => props.step.options.every((option) => option.icon));
const unaffordableIds = computed(() => getUnaffordableOptionIds(props.step.options, props.revenue));
const options = computed(() =>
    props.step.options.map((option) => {
        const lockedText =
            props.lockedOptions[option.id] ?? (unaffordableIds.value.includes(option.id) ? SHORT_OF_MONEY : '');

        return {
            ...option,
            iconComponent: ACTION_ICONS[option.icon],
            cost: Math.max(0, -(option.effects.revenue ?? 0)),
            isChosen: option.id === (isAnswered.value ? props.answer : selectedId.value),
            lockedText,
            isLocked: Boolean(lockedText),
        };
    }),
);

/** @param {string} optionId */
function handlePick(optionId) {
    selectedId.value = selectedId.value === optionId ? null : optionId;
}

function handleApply() {
    if (selectedId.value) {
        emit('answer', selectedId.value);
    }
}
</script>

<template>
    <div class="shift-choice">
        <div :class="['shift-choice__options', {'shift-choice__options--icons': isNonVerbal}]">
            <button
                v-for="option in options"
                :key="option.id"
                type="button"
                :class="[
                    'shift-choice__option',
                    {
                        'shift-choice__option--chosen': option.isChosen,
                        'shift-choice__option--faded': isAnswered && !option.isChosen,
                        'shift-choice__option--locked': !isAnswered && option.isLocked,
                    },
                ]"
                :disabled="isAnswered || option.isLocked"
                :aria-pressed="option.isChosen"
                @click="handlePick(option.id)"
            >
                <component
                    :is="option.iconComponent"
                    v-if="option.iconComponent"
                    class="shift-choice__icon"
                    :size="32"
                    aria-hidden="true"
                />
                <span class="shift-choice__label">{{ option.label }}</span>
                <span
                    v-if="!isAnswered && option.isLocked"
                    class="shift-choice__cost shift-choice__cost--short"
                >
                    {{ option.lockedText }}
                </span>
                <span
                    v-else-if="option.cost"
                    class="shift-choice__cost"
                >
                    {{ formatRubles(option.cost) }}
                </span>
            </button>
        </div>
        <UiButton
            v-if="!isAnswered"
            :disabled="!selectedId"
            @click="handleApply"
        >
            <Check
                :size="20"
                aria-hidden="true"
            />
            Применить
        </UiButton>
    </div>
</template>

<style lang="scss">
.shift-choice {
    $block: &;

    align-items: flex-start;

    @include column($indent-step * 4);

    &__options {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: $indent-step * 3;

        &--icons {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        }
    }

    &__option {
        display: flex;
        align-items: flex-start;
        flex-direction: column;
        justify-content: space-between;
        min-height: 72px;
        transition:
            transform $duration-fast $ease-out,
            border-color $duration ease,
            opacity $duration ease;
        text-align: left;
        color: $color-ink;
        border: 3px solid $color-card-text-box;
        border-radius: $radius-card-inner + 4px;
        background-color: $color-white;
        font-weight: $font-weight-semibold;
        gap: $indent-step * 2;

        @include padding('y', 3);
        @include padding('x', 4);

        &:not(:disabled) {
            cursor: pointer;

            @include hover {
                transform: translateY(-2px);
                border-color: $color-accent;
            }
        }

        #{$block}__options--icons & {
            align-items: center;
            justify-content: center;
            text-align: center;
        }

        &--chosen {
            border-color: $color-accent;
            background-color: $color-card-text-box;
        }

        &--faded {
            opacity: 0.45;
        }

        &--locked {
            cursor: not-allowed;
            opacity: 0.6;
        }
    }

    &__icon {
        color: $color-accent;
    }

    &__label {
        line-height: 1.3;
    }

    &__cost {
        @include chip;

        &--short {
            @include chip(rgba($color-danger, 18%), $color-danger-text);
        }
    }
}
</style>
