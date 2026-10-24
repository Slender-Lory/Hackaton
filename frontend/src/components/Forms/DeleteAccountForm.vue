<script setup>
import {useDeleteAccountForm} from '@/composables/useDeleteAccountForm';

import UiButton from '@/components/Ui/UiButton.vue';
import UiField from '@/components/Ui/UiField.vue';
import UiModal from '@/components/Ui/UiModal.vue';

const emit = defineEmits(['close', 'deleted']);

const {password, errorMessage, isSubmitting, resetError, submit} = useDeleteAccountForm(handleDeleted);

function handleDeleted() {
    emit('deleted');
}
</script>

<template>
    <UiModal
        title="Удалить аккаунт?"
        description="Удалятся аккаунт, прогресс по всем профессиям и входы на всех устройствах. Вернуть их не получится."
        @close="emit('close')"
    >
        <form
            class="delete-account-form"
            @submit.prevent="submit"
        >
            <UiField
                v-model="password"
                label="Пароль для подтверждения"
                type="password"
                autocomplete="current-password"
                :error="errorMessage"
                autofocus
                @input="resetError"
            />
            <div class="delete-account-form__actions">
                <UiButton
                    theme="quiet"
                    @click="emit('close')"
                >
                    Отмена
                </UiButton>
                <UiButton
                    type="submit"
                    theme="danger"
                    :disabled="isSubmitting"
                >
                    {{ isSubmitting ? 'Удаляем…' : 'Удалить навсегда' }}
                </UiButton>
            </div>
        </form>
    </UiModal>
</template>

<style lang="scss">
.delete-account-form {
    @include column($indent-step * 5);

    &__actions {
        display: flex;
        justify-content: flex-end;
        gap: $indent-step * 3;
    }
}
</style>
