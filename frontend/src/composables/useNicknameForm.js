import {ref} from 'vue';
import {getErrorMessage} from '@/core/helpers/getErrorMessage';
import {usePlayerStore} from '@/core/stores/player';
import {validateNickname} from '@/core/utils/nicknameValidation';

/** @param {(player: import('@/core/types/player').Player) => void} onEntered */
export function useNicknameForm(onEntered) {
    const playerStore = usePlayerStore();

    const nickname = ref('');
    /** @type {import('vue').Ref<string | null>} */
    const errorMessage = ref(null);
    const isSubmitting = ref(false);

    function resetError() {
        errorMessage.value = null;
    }

    async function submit() {
        errorMessage.value = validateNickname(nickname.value);

        if (errorMessage.value) {
            return;
        }

        isSubmitting.value = true;

        try {
            onEntered(await playerStore.enter(nickname.value));
        } catch (error) {
            errorMessage.value = getErrorMessage(error);
        } finally {
            isSubmitting.value = false;
        }
    }

    return {nickname, errorMessage, isSubmitting, submit, resetError};
}
