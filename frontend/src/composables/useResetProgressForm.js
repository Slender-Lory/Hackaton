import {ref} from 'vue';
import {getErrorMessage} from '@/core/helpers/getErrorMessage';
import {usePlayerStore} from '@/core/stores/player';

/**
 * @param {import('vue').Ref<string>} professionCode
 * @param {() => void} onReset
 */
export function useResetProgressForm(professionCode, onReset) {
    const playerStore = usePlayerStore();

    /** @type {import('vue').Ref<string | null>} */
    const errorMessage = ref(null);
    const isSubmitting = ref(false);

    async function submit() {
        errorMessage.value = null;
        isSubmitting.value = true;

        try {
            await playerStore.resetProgress(professionCode.value);
            onReset();
        } catch (error) {
            errorMessage.value = getErrorMessage(error);
        } finally {
            isSubmitting.value = false;
        }
    }

    return {errorMessage, isSubmitting, submit};
}
