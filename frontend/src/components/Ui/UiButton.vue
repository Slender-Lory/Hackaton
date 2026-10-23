<script setup>
import {computed} from 'vue';

const props = defineProps({
    theme: {
        type: String,
        default: 'primary',
        validator: (value) => ['primary', 'ghost'].includes(value),
    },
    type: {
        type: String,
        default: 'button',
        validator: (value) => ['button', 'submit'].includes(value),
    },
    large: {type: Boolean, default: false},
    fluid: {type: Boolean, default: false},
    // Мягкая пульсация — привлечь внимание к главному действию
    pulse: {type: Boolean, default: false},
    disabled: {type: Boolean, default: false},
});

const emit = defineEmits(['click']);

const rootClass = computed(() => [
    'ui-button',
    `ui-button--${props.theme}`,
    {
        'ui-button--large': props.large,
        'ui-button--fluid': props.fluid,
        'ui-button--pulse': props.pulse,
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
$button-depth: 5px;

.ui-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
        transform $duration-fast ease,
        background $duration ease,
        box-shadow $duration-fast ease;
    border-radius: $radius-pill;
    font-size: $font-size-md;
    font-weight: $font-weight-extra-bold;
    gap: $indent-step * 2;

    @include padding('y', 3);
    @include padding('x', 6);

    &--primary {
        color: $color-white;
        border: none;
        background: $color-accent;
        box-shadow:
            0 $button-depth 0 accent-shade(),
            0 10px 22px accent-fade(40%);

        &:not(:disabled) {
            @include hover {
                transform: translateY(-2px) scale(1.03);
            }

            &:active {
                transform: translateY($button-depth - 1px);
                box-shadow: 0 1px 0 accent-shade();
            }
        }
    }

    &--ghost {
        color: $color-text-secondary;
        border: 2px dashed color-mix(in srgb, #{$color-accent} 60%, #{$color-text-secondary});
        background: transparent;
        font-size: $font-size-sm;
        font-weight: $font-weight-bold;

        &:not(:disabled) {
            @include hover {
                background: $color-mist;
            }
        }
    }

    &--large {
        min-width: 220px;
        letter-spacing: 0.02em;
        font-size: $font-size-xl;

        @include padding('y', 4);
        @include padding('x', 8);
    }

    &--fluid {
        width: 100%;
    }

    &--pulse {
        animation: ui-button-pulse 2.2s ease-in-out infinite;
    }

    &:disabled {
        cursor: progress;
        opacity: 0.7;
    }
}

@keyframes ui-button-pulse {
    50% {
        box-shadow:
            0 $button-depth 0 accent-shade(),
            0 10px 22px accent-fade(40%),
            0 0 0 ($indent-step * 3) accent-fade(18%);
    }
}
</style>
