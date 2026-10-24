<script setup>
import {Play} from 'lucide-vue-next';
import {NICKNAME_MAX_LENGTH} from '@/core/constants';
import {useNicknameForm} from '@/composables/useNicknameForm';

import UiButton from '@/components/Ui/UiButton.vue';
import UiModal from '@/components/Ui/UiModal.vue';

const emit = defineEmits(['close', 'entered']);

const {nickname, errorMessage, isSubmitting, submit, resetError} = useNicknameForm(handleEntered);

/** @param {import('@/core/types/player').Player} player */
function handleEntered(player) {
    emit('entered', player);
}
</script>

<template>
    <UiModal
        title="Как тебя зовут?"
        description="Так к тебе будут обращаться в клинике. Регистрация не нужна: прогресс сохранится в этом браузере."
        @close="emit('close')"
    >
        <form
            class="nickname-form"
            @submit.prevent="submit"
        >
            <label
                class="nickname-form__label"
                for="nickname-form-field"
            >
                Имя
            </label>
            <input
                id="nickname-form-field"
                v-model="nickname"
                :class="['nickname-form__field', {'nickname-form__field--error': errorMessage}]"
                type="text"
                autocomplete="nickname"
                :maxlength="NICKNAME_MAX_LENGTH"
                placeholder="Например, Аня"
                :aria-invalid="Boolean(errorMessage)"
                aria-describedby="nickname-form-error"
                autofocus
                @input="resetError"
            />
            <p
                id="nickname-form-error"
                class="nickname-form__error"
                role="alert"
            >
                {{ errorMessage ?? '' }}
            </p>

            <UiButton
                type="submit"
                large
                fluid
                :disabled="isSubmitting"
            >
                <Play
                    :size="20"
                    aria-hidden="true"
                />
                {{ isSubmitting ? 'Открываем смену…' : 'Начать смену' }}
            </UiButton>
        </form>
    </UiModal>
</template>

<style lang="scss">
.nickname-form {
    @include column($indent-step * 2);

    &__label {
        color: $color-ink;
        font-size: $font-size-sm;
        font-weight: $font-weight-semibold;
    }

    &__field {
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

    &__error {
        min-height: 1.5em;
        color: $color-danger-text;
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
    }
}
</style>
