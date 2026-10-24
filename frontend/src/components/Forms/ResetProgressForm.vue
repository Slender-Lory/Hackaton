<script setup>
import {computed} from 'vue';
import {RotateCcw} from 'lucide-vue-next';
import {useResetProgressForm} from '@/composables/useResetProgressForm';

import UiButton from '@/components/Ui/UiButton.vue';
import UiModal from '@/components/Ui/UiModal.vue';

const props = defineProps({
    /** @type {import('vue').PropType<import('@/core/types/profession').Profession>} */
    profession: {type: Object, required: true},
});

const emit = defineEmits(['close', 'reset']);

const professionCode = computed(() => props.profession.code);

const {errorMessage, isSubmitting, submit} = useResetProgressForm(professionCode, handleReset);

function handleReset() {
    emit('reset');
}
</script>

<template>
    <UiModal
        title="Начать заново?"
        :description="`Прогресс профессии «${profession.title}» удалится: смены, счётчики и все решения. Вернуть его не получится.`"
        @close="emit('close')"
    >
        <div class="reset-progress-form">
            <p
                v-if="errorMessage"
                class="reset-progress-form__error"
                role="alert"
            >
                {{ errorMessage }}
            </p>
            <div class="reset-progress-form__actions">
                <UiButton
                    theme="quiet"
                    @click="emit('close')"
                >
                    Отмена
                </UiButton>
                <UiButton
                    theme="danger"
                    :disabled="isSubmitting"
                    @click="submit"
                >
                    <RotateCcw
                        :size="18"
                        aria-hidden="true"
                    />
                    {{ isSubmitting ? 'Сбрасываем…' : 'Начать заново' }}
                </UiButton>
            </div>
        </div>
    </UiModal>
</template>

<style lang="scss">
.reset-progress-form {
    @include column($indent-step * 4);

    &__error {
        color: $color-danger-text;
        font-size: $font-size-sm;
    }

    &__actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: $indent-step * 3;
    }
}
</style>
