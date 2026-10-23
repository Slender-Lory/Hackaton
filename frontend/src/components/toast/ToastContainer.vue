<script setup>
import {useToastStore} from '@/core/stores/toast';

import ToastElement from '@/components/toast/ToastElement.vue';

const toastStore = useToastStore();
</script>

<template>
    <TransitionGroup
        tag="div"
        name="toast"
        class="toast-container"
    >
        <ToastElement
            v-for="toast in toastStore.toasts"
            :key="toast.id"
            v-bind="toast"
            @close="toastStore.removeToast"
        />
    </TransitionGroup>
</template>

<style lang="scss">
.toast-container {
    position: fixed;
    z-index: $ui-index-6;
    bottom: $indent-step * 6;
    left: 50%;
    display: flex;
    align-items: center;
    flex-direction: column;
    max-width: calc(100% - #{$page-gutter * 2});
    transform: translateX(-50%);
    pointer-events: none;
    gap: $indent-step * 2;

    .toast {
        color: $color-white;
        border-radius: $radius-pill;
        background: $color-text-primary;
        box-shadow: $shadow-toast;
        font-weight: $font-weight-extra-bold;

        @include padding('y', 3);
        @include padding('x', 6);

        // Классы <TransitionGroup name="toast"> — имена задаёт Vue
        &-enter-active,
        &-leave-active {
            transition:
                opacity $duration ease,
                transform $duration $ease-back-out;
        }

        &-enter-from,
        &-leave-to {
            transform: translateY($indent-step * 4);
            opacity: 0;
        }
    }
}
</style>
