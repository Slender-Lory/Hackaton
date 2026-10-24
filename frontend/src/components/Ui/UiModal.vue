<script setup>
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
} from 'reka-ui';
import {X} from 'lucide-vue-next';

defineProps({
    title: {type: String, required: true},
    description: {type: String, default: ''},
});

const emit = defineEmits(['close']);

/** @param {boolean} isOpen */
function handleOpenChange(isOpen) {
    if (!isOpen) {
        emit('close');
    }
}
</script>

<template>
    <DialogRoot
        :open="true"
        @update:open="handleOpenChange"
    >
        <DialogPortal>
            <DialogOverlay class="ui-modal" />
            <DialogContent class="ui-modal__window">
                <DialogTitle class="ui-modal__title">{{ title }}</DialogTitle>
                <DialogDescription
                    v-if="description"
                    class="ui-modal__description"
                >
                    {{ description }}
                </DialogDescription>
                <slot />
                <DialogClose
                    class="ui-modal__close"
                    aria-label="Закрыть"
                >
                    <X :size="20" />
                </DialogClose>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>

<style lang="scss">
$close-size: 40px;

.ui-modal {
    position: fixed;
    z-index: $ui-index-4;
    inset: 0;
    animation: fade-in $duration ease both;
    background-color: $color-overlay;
    backdrop-filter: blur(6px);

    &__window {
        position: fixed;
        z-index: $ui-index-4;
        top: 50%;
        left: 50%;
        width: min(420px, calc(100% - #{$page-gutter * 2}));
        transform: translate(-50%, -50%);
        animation: ui-modal-deal $duration-slow $ease-out both;
        color: $color-ink;

        @include card-face;
        @include column($indent-step * 4);
        @include padding('y', 7);
        @include padding('x', 6);
    }

    &__title {
        padding-right: $close-size;

        @include display($font-size-xl);
    }

    &__description {
        color: $color-ink-soft;
        font-size: $font-size-sm;
    }

    &__close {
        position: absolute;
        top: $indent-step * 4;
        right: $indent-step * 4;
        width: $close-size;
        height: $close-size;
        color: $color-ink-soft;
        border-radius: 50%;

        @include button-reset;
        @include flex-center;

        @include hover {
            color: $color-ink;
            background-color: $color-card-text-box;
        }
    }
}

@keyframes ui-modal-deal {
    from {
        transform: translate(-50%, calc(-50% + 30px)) rotate(-4deg) scale(0.94);
        opacity: 0;
    }
}
</style>
