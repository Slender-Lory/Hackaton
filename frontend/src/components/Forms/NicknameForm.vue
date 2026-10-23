<script setup>
import {onMounted, ref} from 'vue';
import {NICKNAME_MAX_LENGTH} from '@/core/constants';
import {useNicknameForm} from '@/composables/useNicknameForm';

import UiButton from '@/components/Ui/UiButton.vue';
import UiModal from '@/components/Ui/UiModal.vue';

const emit = defineEmits(['close', 'entered']);

const {nickname, errorMessage, isSubmitting, submit, resetError} = useNicknameForm(handleEntered);

/** @type {import('vue').Ref<HTMLInputElement | null>} */
const input = ref(null);

onMounted(() => input.value?.focus());

/** @param {import('@/core/types/player').Player} player */
function handleEntered(player) {
    emit('entered', player);
}
</script>

<template>
    <UiModal
        labelledby="nickname-form-title"
        @close="emit('close')"
    >
        <form
            class="nickname-form"
            @submit.prevent="submit"
        >
            <div
                class="nickname-form__mascot"
                aria-hidden="true"
            >
                🐈
            </div>
            <h2
                id="nickname-form-title"
                class="nickname-form__title"
            >
                Как тебя зовут, доктор?
            </h2>

            <label
                class="nickname-form__label"
                for="nickname-form-field"
            >
                Имя
            </label>
            <input
                id="nickname-form-field"
                ref="input"
                v-model="nickname"
                :class="['nickname-form__field', {'nickname-form__field--error': errorMessage}]"
                type="text"
                autocomplete="nickname"
                :maxlength="NICKNAME_MAX_LENGTH"
                placeholder="Твоё имя"
                :aria-invalid="Boolean(errorMessage)"
                aria-describedby="nickname-form-error"
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
                {{ isSubmitting ? 'Секунду…' : 'Поехали!' }}
            </UiButton>
        </form>
    </UiModal>
</template>

<style lang="scss">
$mascot-size: 64px;

.nickname-form {
    @include column;

    &__mascot {
        margin-top: -$mascot-size;
        animation: bob 2.6s ease-in-out infinite;
        font-size: $mascot-size;
    }

    &__title {
        text-align: center;
        font-size: $font-size-xxl;
        font-weight: $font-weight-extra-bold;
    }

    // Подпись нужна скринридерам; визуально её заменяет заголовок
    &__label {
        position: absolute;
        overflow: hidden;
        width: 1px;
        height: 1px;
        clip-path: inset(50%);
        white-space: nowrap;
    }

    &__field {
        width: 100%;
        transition: border-color $duration ease;
        text-align: center;
        border: 3px solid $color-border;
        border-radius: $radius-md;
        background: $color-white;
        font: inherit;
        font-size: $font-size-lg;

        @include padding('y', 3);
        @include padding('x', 4);

        &:focus {
            border-color: $color-vet;
            outline: none;
        }

        &--error {
            border-color: $color-error;
        }
    }

    &__error {
        min-height: 1.3em;
        margin-top: -$indent-step;
        color: $color-error;
        font-size: $font-size-sm;
        font-weight: $font-weight-bold;
    }
}
</style>
