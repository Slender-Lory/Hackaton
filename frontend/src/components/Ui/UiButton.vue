<script setup>
import {computed} from 'vue';

const props = defineProps({
    theme: {
        type: String,
        default: 'action',
        validator: (value) => ['action', 'ghost'].includes(value),
    },
    type: {
        type: String,
        default: 'button',
        validator: (value) => ['button', 'submit'].includes(value),
    },
    large: {type: Boolean, default: false},
    fluid: {type: Boolean, default: false},
    disabled: {type: Boolean, default: false},
});

const emit = defineEmits(['click']);

const rootClass = computed(() => [
    'ui-button',
    `ui-button--${props.theme}`,
    {
        'ui-button--large': props.large,
        'ui-button--fluid': props.fluid,
    },
]);
</script>

<template>
    <button
        :type="type"
        :class="rootClass"
        :disabled="disabled"
        @click="emit('click', $event)"
    >
        <slot />
    </button>
</template>

<style lang="scss">
.ui-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
        transform $duration-fast $ease-out,
        background-color $duration ease,
        box-shadow $duration ease;
    border: none;
    border-radius: $radius-button;
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    gap: $indent-step * 2;

    @include padding('y', 3);
    @include padding('x', 6);

    &--action {
        color: $color-ink;
        background-color: $color-action;
        box-shadow:
            inset 0 -4px 0 $color-action-deep,
            $shadow-button;

        &:not(:disabled) {
            @include hover {
                transform: translateY(-2px);
                background-color: $color-action-light;
            }

            &:active {
                transform: translateY(2px);
                box-shadow:
                    inset 0 -1px 0 $color-action-deep,
                    $shadow-button;
            }
        }
    }

    &--ghost {
        color: $color-on-playmat;
        border: 2px solid rgba($color-white, 45%);
        background-color: rgba($color-white, 8%);

        &:not(:disabled) {
            @include hover {
                border-color: $color-white;
                background-color: rgba($color-white, 16%);
            }
        }
    }

    &--large {
        font-size: $font-size-lg;

        @include padding('y', 4);
        @include padding('x', 8);
    }

    &--fluid {
        width: 100%;
    }

    &:disabled {
        cursor: progress;
        opacity: 0.65;
    }
}
</style>
