<script setup>
import {computed, useId} from 'vue';

const props = defineProps({
    label: {type: String, required: true},
    type: {type: String, default: 'text'},
    autocomplete: {type: String, default: 'off'},
    placeholder: {type: String, default: ''},
    maxlength: {type: Number, default: undefined},
    error: {type: String, default: null},
    hint: {type: String, default: ''},
    autofocus: {type: Boolean, default: false},
});

const emit = defineEmits(['input']);

const model = defineModel({type: String, default: ''});

const fieldId = useId();

const describedBy = computed(() => (props.error || props.hint ? `${fieldId}-note` : undefined));
</script>

<template>
    <div class="ui-field">
        <label
            class="ui-field__label"
            :for="fieldId"
        >
            {{ label }}
        </label>
        <input
            :id="fieldId"
            v-model="model"
            :class="['ui-field__input', {'ui-field__input--error': error}]"
            :type="type"
            :autocomplete="autocomplete"
            :placeholder="placeholder"
            :maxlength="maxlength"
            :aria-invalid="Boolean(error)"
            :aria-describedby="describedBy"
            :autofocus="autofocus"
            @input="emit('input')"
        />
        <p
            v-if="error || hint"
            :id="`${fieldId}-note`"
            :class="['ui-field__note', {'ui-field__note--error': error}]"
            :role="error ? 'alert' : undefined"
        >
            {{ error ?? hint }}
        </p>
    </div>
</template>

<style lang="scss">
.ui-field {
    @include column($indent-step * 2);

    &__label {
        color: $color-ink;
        font-size: $font-size-sm;
        font-weight: $font-weight-semibold;
    }

    &__input {
        width: 100%;
        transition:
            border-color $duration ease,
            box-shadow $duration ease;
        color: $color-ink;
        border: 2px solid $color-card-text-box;
        border-radius: $radius-button;
        background-color: $color-card-text-box;
        font: inherit;
        font-size: $font-size-lg;

        @include padding('y', 3);
        @include padding('x', 4);

        &::placeholder {
            color: $color-ink-soft;
        }

        &:focus {
            border-color: $color-accent;
            outline: none;
            box-shadow: 0 0 0 4px rgba($color-action, 45%);
        }

        &--error {
            border-color: $color-danger;
        }
    }

    &__note {
        color: $color-ink-soft;
        font-size: $font-size-sm;

        &--error {
            color: $color-danger-text;
            font-weight: $font-weight-medium;
        }
    }
}
</style>
