<script setup>
import {onBeforeUnmount, onMounted} from 'vue';

defineProps({
    // id заголовка внутри модалки — для aria-labelledby
    labelledby: {type: String, required: true},
});

const emit = defineEmits(['close']);

onMounted(() => document.addEventListener('keydown', handleKeydown));
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown));

/** @param {KeyboardEvent} event */
function handleKeydown(event) {
    if (event.key === 'Escape') {
        emit('close');
    }
}
</script>

<template>
    <Teleport to="body">
        <div
            class="ui-modal"
            @click.self="emit('close')"
        >
            <div
                class="ui-modal__window"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="labelledby"
            >
                <slot />
                <button
                    class="ui-modal__close"
                    type="button"
                    aria-label="Закрыть"
                    @click="emit('close')"
                >
                    ✕
                </button>
            </div>
        </div>
    </Teleport>
</template>

<style lang="scss">
$close-size: 40px;

.ui-modal {
    position: fixed;
    z-index: $ui-index-4;
    inset: 0;
    padding: $page-gutter;
    animation: fade-in 0.2s ease both;
    background: $color-overlay;
    backdrop-filter: blur(3px);

    @include flex-center;

    &__window {
        position: relative;
        width: min(400px, 100%);
        padding: ($indent-step * 7) ($indent-step * 6) ($indent-step * 6);

        @include surface($shadow-overlay);
        @include appear(rise-in, 0.4s);
    }

    &__close {
        position: absolute;
        top: $indent-step * 3;
        right: $indent-step * 3;
        width: $close-size;
        height: $close-size;
        color: $color-text-secondary;
        border-radius: 50%;
        font-size: $font-size-lg;

        @include button-reset;
        @include flex-center;

        @include hover {
            background: $color-surface-muted;
        }
    }
}
</style>
