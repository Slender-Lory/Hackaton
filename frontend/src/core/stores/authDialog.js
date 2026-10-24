import {defineStore} from 'pinia';
import {ref} from 'vue';

export const AUTH_MODES = Object.freeze({
    login: 'login',
    register: 'register',
});

export const useAuthDialogStore = defineStore('authDialog', () => {
    const isOpen = ref(false);
    const mode = ref(AUTH_MODES.login);

    /** @param {string} [nextMode] */
    function open(nextMode = AUTH_MODES.login) {
        mode.value = nextMode;
        isOpen.value = true;
    }

    function close() {
        isOpen.value = false;
    }

    return {isOpen, mode, open, close};
});
