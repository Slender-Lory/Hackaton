import {ref} from 'vue';
import {getErrorMessage} from '@/core/helpers/getErrorMessage';
import {usePlayerStore} from '@/core/stores/player';
import {validatePassword} from '@/core/utils/authValidation';

/** @param {() => void} onDeleted */
export function useDeleteAccountForm(onDeleted) {
    const playerStore = usePlayerStore();

    const password = ref('');
    /** @type {import('vue').Ref<string | null>} */
    const errorMessage = ref(null);
    const isSubmitting = ref(false);

    function resetError() {
        errorMessage.value = null;
    }

    async function submit() {
        errorMessage.value = validatePassword(password.value, {isNew: false});

        if (errorMessage.value) {
            return;
        }

        isSubmitting.value = true;

        try {
            await playerStore.deleteAccount(password.value);
            onDeleted();
        } catch (error) {
            errorMessage.value = getErrorMessage(error);
        } finally {
            isSubmitting.value = false;
        }
    }

    return {password, errorMessage, isSubmitting, resetError, submit};
}
