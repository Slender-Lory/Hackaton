import {defineStore} from 'pinia';
import {ref} from 'vue';

/** @typedef {import('@/core/types/toasts').Toast} Toast */

const MAX_TOAST_COUNT = 3;

export const useToastStore = defineStore('toast', () => {
    /** @type {import('vue').Ref<Toast[]>} */
    const toasts = ref([]);

    /** @param {string} message */
    function show(message) {
        const isToastExist = toasts.value.some((toast) => toast.message === message);

        if (isToastExist || toasts.value.length >= MAX_TOAST_COUNT) {
            return;
        }

        toasts.value = [...toasts.value, {id: Date.now(), message}];
    }

    /** @param {number} id */
    function removeToast(id) {
        toasts.value = toasts.value.filter((toast) => toast.id !== id);
    }

    return {toasts, show, removeToast};
});
