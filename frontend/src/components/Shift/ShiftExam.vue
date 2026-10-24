<script setup>
import {computed, ref} from 'vue';
import {
    Bone,
    ClipboardCheck,
    Ear,
    Eye,
    Feather,
    Footprints,
    Grab,
    Hand,
    Scale,
    Search,
    Shield,
    Shirt,
    Stethoscope,
    Thermometer,
} from 'lucide-vue-next';
import {getAvailableExamOptions} from '@/core/utils/shift';

import UiButton from '@/components/Ui/UiButton.vue';

const ACTION_ICONS = Object.freeze({
    bone: Bone,
    hand: Hand,
    grab: Grab,
    shield: Shield,
    towel: Shirt,
    eye: Eye,
    ear: Ear,
    paw: Footprints,
    thermometer: Thermometer,
    stethoscope: Stethoscope,
    scale: Scale,
    feather: Feather,
    search: Search,
});

const props = defineProps({
    /** @type {import('vue').PropType<import('@/core/types/shift').ExamStep>} */
    step: {type: Object, required: true},
    /** @type {import('vue').PropType<string[] | null>} */
    answer: {type: Array, default: null},
});

const emit = defineEmits(['answer']);

/** @type {import('vue').Ref<string[]>} */
const pickedIds = ref([...(props.answer ?? [])]);

const isAnswered = computed(() => props.answer !== null);
const actions = computed(() =>
    getAvailableExamOptions(props.step, pickedIds.value).map((option) => ({
        ...option,
        iconComponent: ACTION_ICONS[option.icon] ?? Search,
        isPicked: pickedIds.value.includes(option.id),
    })),
);
const findings = computed(() =>
    pickedIds.value.map((id) => props.step.options.find((option) => option.id === id)).filter(Boolean),
);

/** @param {string} optionId */
function handlePick(optionId) {
    if (!pickedIds.value.includes(optionId)) {
        pickedIds.value = [...pickedIds.value, optionId];

        return;
    }

    let ids = pickedIds.value.filter((id) => id !== optionId);
    let availableIds = getAvailableExamOptions(props.step, ids).map((option) => option.id);

    while (ids.some((id) => !availableIds.includes(id))) {
        ids = ids.filter((id) => availableIds.includes(id));
        availableIds = getAvailableExamOptions(props.step, ids).map((option) => option.id);
    }

    pickedIds.value = ids;
}

function handleFinish() {
    emit('answer', [...pickedIds.value]);
}
</script>

<template>
    <div class="shift-exam">
        <div class="shift-exam__actions">
            <button
                v-for="action in actions"
                :key="action.id"
                type="button"
                :class="['shift-exam__action', {'shift-exam__action--picked': action.isPicked}]"
                :disabled="isAnswered"
                :aria-pressed="action.isPicked"
                @click="handlePick(action.id)"
            >
                <component
                    :is="action.iconComponent"
                    class="shift-exam__icon"
                    :size="24"
                    aria-hidden="true"
                />
                {{ action.label }}
            </button>
        </div>

        <ol
            v-if="findings.length"
            class="shift-exam__findings"
            aria-live="polite"
        >
            <li
                v-for="finding in findings"
                :key="finding.id"
                class="shift-exam__finding"
            >
                <span class="shift-exam__finding-label">{{ finding.label }}</span>
                <span>{{ finding.finding }}</span>
                <span
                    v-for="reading in finding.reveals ?? []"
                    :key="reading.vital"
                    :class="['shift-exam__reading', {'shift-exam__reading--abnormal': reading.isAbnormal}]"
                >
                    {{ reading.value }}
                </span>
            </li>
        </ol>
        <p
            v-else
            class="shift-exam__empty"
        >
            Пока ничего не проверено.
        </p>

        <UiButton
            v-if="!isAnswered"
            :disabled="!pickedIds.length"
            @click="handleFinish"
        >
            <ClipboardCheck
                :size="20"
                aria-hidden="true"
            />
            Закончить осмотр
        </UiButton>
    </div>
</template>

<style lang="scss">
.shift-exam {
    align-items: flex-start;

    @include column($indent-step * 4);

    &__actions {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: $indent-step * 2;
    }

    &__action {
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
        min-height: 88px;
        cursor: pointer;
        transition:
            transform $duration-fast $ease-out,
            border-color $duration ease;
        text-align: center;
        color: $color-ink;
        border: 3px solid $color-card-text-box;
        border-radius: $radius-card-inner + 4px;
        background-color: $color-white;
        font-size: $font-size-sm;
        font-weight: $font-weight-semibold;
        line-height: 1.25;
        gap: $indent-step * 2;

        @include padding('y', 3);
        @include padding('x', 3);

        &:not(:disabled) {
            @include hover {
                transform: translateY(-2px);
                border-color: $color-accent;
            }
        }

        &:disabled {
            cursor: default;
        }

        &--picked {
            border-color: $color-accent;
            background-color: $color-card-text-box;
        }
    }

    &__icon {
        color: $color-accent;
    }

    &__findings {
        display: grid;
        width: 100%;
        margin: 0;
        padding: 0;
        list-style: none;
        gap: $indent-step * 2;
    }

    &__finding {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        border-left: 3px solid $color-accent;
        line-height: 1.45;
        gap: $indent-step $indent-step * 2;

        @include padding('left', 3);
    }

    &__finding-label {
        color: $color-ink-soft;
        font-size: $font-size-xs;
        font-weight: $font-weight-bold;
    }

    &__reading {
        @include chip(rgba($color-profession-vet, 18%));

        &--abnormal {
            @include chip(rgba($color-danger, 18%), $color-danger-text);
        }
    }

    &__empty {
        color: $color-ink-soft;
        font-size: $font-size-sm;
    }
}
</style>
