<script setup>
import {Play} from 'lucide-vue-next';
import {NICKNAME_MAX_LENGTH} from '@/core/constants';
import {useNicknameForm} from '@/composables/useNicknameForm';

import UiButton from '@/components/Ui/UiButton.vue';
import UiField from '@/components/Ui/UiField.vue';
import UiModal from '@/components/Ui/UiModal.vue';

const emit = defineEmits(['close', 'entered', 'login']);

const {nickname, errorMessage, submit, resetError} = useNicknameForm(handleEntered);

function handleEntered() {
    emit('entered');
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
            <UiField
                v-model="nickname"
                label="Имя"
                autocomplete="nickname"
                placeholder="Например, Аня"
                :maxlength="NICKNAME_MAX_LENGTH"
                :error="errorMessage"
                autofocus
                @input="resetError"
            />

            <UiButton
                type="submit"
                large
                fluid
            >
                <Play
                    :size="20"
                    aria-hidden="true"
                />
                Начать смену
            </UiButton>

            <p class="nickname-form__account">
                Уже есть аккаунт?
                <button
                    class="nickname-form__link"
                    type="button"
                    @click="emit('login')"
                >
                    Войти по почте
                </button>
            </p>
        </form>
    </UiModal>
</template>

<style lang="scss">
.nickname-form {
    @include column($indent-step * 4);

    &__account {
        text-align: center;
        color: $color-ink-soft;
        font-size: $font-size-sm;
    }

    &__link {
        text-decoration: underline;
        text-underline-offset: 3px;
        color: $color-ink;
        font-weight: $font-weight-semibold;

        @include button-reset;
    }
}
</style>
