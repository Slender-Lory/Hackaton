import {ref} from 'vue';
import {usePlayerStore} from '@/core/stores/player';
import {validateNickname} from '@/core/utils/nicknameValidation';

/** @param {() => void} onEntered */
export function useNicknameForm(onEntered) {
    const playerStore = usePlayerStore();

    const nickname = ref('');
    /** @type {import('vue').Ref<string | null>} */
    const errorMessage = ref(null);

    function resetError() {
        errorMessage.value = null;
    }

    function submit() {
        errorMessage.value = validateNickname(nickname.value);

        if (errorMessage.value) {
            return;
        }

        playerStore.startAsGuest(nickname.value);
        onEntered();
    }

    return {nickname, errorMessage, submit, resetError};
}
