<script setup>
import {TabsList, TabsRoot, TabsTrigger} from 'reka-ui';
import {NICKNAME_MAX_LENGTH} from '@/core/constants';
import {AUTH_MODES, useAuthDialogStore} from '@/core/stores/authDialog';
import {useAuthForm} from '@/composables/useAuthForm';

import UiButton from '@/components/Ui/UiButton.vue';
import UiField from '@/components/Ui/UiField.vue';
import UiModal from '@/components/Ui/UiModal.vue';

const authDialogStore = useAuthDialogStore();

const {mode, fields, errors, isSubmitting, isRegister, needsNickname, isGuest, resetError, submit} = useAuthForm();
</script>

<template>
    <UiModal
        :title="isRegister ? (isGuest ? 'Сохранить прогресс' : 'Регистрация') : 'Вход'"
        :description="
            isRegister && isGuest
                ? 'Создай аккаунт — прогресс из этого браузера перенесётся в него, и можно будет играть с любого устройства.'
                : 'Аккаунт хранит прогресс на сервере. Нужны только почта и пароль.'
        "
        @close="authDialogStore.close()"
    >
        <TabsRoot
            v-model="mode"
            class="auth-form__tabs"
            activation-mode="manual"
        >
            <TabsList
                class="auth-form__tab-list"
                aria-label="Вход или регистрация"
            >
                <TabsTrigger
                    class="auth-form__tab"
                    :value="AUTH_MODES.login"
                >
                    Вход
                </TabsTrigger>
                <TabsTrigger
                    class="auth-form__tab"
                    :value="AUTH_MODES.register"
                >
                    Регистрация
                </TabsTrigger>
            </TabsList>
        </TabsRoot>

        <form
            class="auth-form"
            novalidate
            @submit.prevent="submit"
        >
            <UiField
                v-model="fields.email"
                label="Почта"
                type="email"
                autocomplete="email"
                placeholder="anya@mail.ru"
                :error="errors.email"
                autofocus
                @input="resetError('email')"
            />
            <UiField
                v-model="fields.password"
                label="Пароль"
                type="password"
                :autocomplete="isRegister ? 'new-password' : 'current-password'"
                :hint="isRegister ? 'Не короче 8 символов' : ''"
                :error="errors.password"
                @input="resetError('password')"
            />
            <UiField
                v-if="needsNickname"
                v-model="fields.nickname"
                label="Имя в игре"
                autocomplete="nickname"
                :maxlength="NICKNAME_MAX_LENGTH"
                :error="errors.nickname"
                @input="resetError('nickname')"
            />

            <p
                v-if="errors.form"
                class="auth-form__error"
                role="alert"
            >
                {{ errors.form }}
            </p>

            <UiButton
                type="submit"
                large
                fluid
                :disabled="isSubmitting"
            >
                <template v-if="isSubmitting">Секунду…</template>
                <template v-else>{{ isRegister ? 'Создать аккаунт' : 'Войти' }}</template>
            </UiButton>
        </form>
    </UiModal>
</template>

<style lang="scss">
.auth-form {
    @include column($indent-step * 4);

    &__tab-list {
        display: grid;
        border-radius: $radius-button;
        background-color: $color-card-text-box;
        grid-template-columns: 1fr 1fr;
        gap: $indent-step;

        @include padding('y', 1);
        @include padding('x', 1);
    }

    &__tab {
        transition:
            background-color $duration ease,
            color $duration ease;
        color: $color-ink-soft;
        border-radius: $radius-button - 4px;
        font-weight: $font-weight-semibold;

        @include button-reset;
        @include padding('y', 2);

        &[data-state='active'] {
            color: $color-ink;
            background-color: $color-white;
            box-shadow: $shadow-button;
        }
    }

    &__error {
        color: $color-danger-text;
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
    }
}
</style>
