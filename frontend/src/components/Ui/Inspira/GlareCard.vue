<script setup>
// Порт GlareCard из Inspira UI (https://inspira-ui.com), лицензия MIT.
import {computed, ref} from 'vue';

const MAX_TILT_DEGREES = 12;

const props = defineProps({
    disabled: {type: Boolean, default: false},
});

const pointer = ref({x: 50, y: 50});
const isActive = ref(false);

const cardStyle = computed(() => {
    const {x, y} = pointer.value;
    const rotateX = isActive.value ? ((y - 50) / 50) * -MAX_TILT_DEGREES : 0;
    const rotateY = isActive.value ? ((x - 50) / 50) * MAX_TILT_DEGREES : 0;

    return {
        '--glare-x': `${x}%`,
        '--glare-y': `${y}%`,
        '--glare-opacity': isActive.value ? 1 : 0,
        transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    };
});

/** @param {PointerEvent} event */
function handlePointerMove(event) {
    if (props.disabled || event.pointerType === 'touch') {
        return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    pointer.value = {
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
    };
    isActive.value = true;
}

function handlePointerLeave() {
    isActive.value = false;
    pointer.value = {x: 50, y: 50};
}
</script>

<template>
    <div
        class="relative isolate transition-transform duration-300 ease-out will-change-transform [transform-style:preserve-3d]"
        :style="cardStyle"
        @pointermove="handlePointerMove"
        @pointerleave="handlePointerLeave"
    >
        <slot />
        <div
            v-if="!disabled"
            class="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] transition-opacity duration-300"
            :style="{opacity: 'var(--glare-opacity)'}"
            aria-hidden="true"
        >
            <div
                class="absolute inset-0 mix-blend-color-dodge opacity-60"
                style="
                    background: linear-gradient(
                        115deg,
                        transparent 20%,
                        rgba(255, 119, 198, 0.55) 36%,
                        rgba(126, 232, 250, 0.55) 46%,
                        rgba(255, 235, 132, 0.55) 56%,
                        transparent 72%
                    );
                    background-size: 250% 250%;
                    background-position: var(--glare-x) var(--glare-y);
                "
            />
            <div
                class="absolute inset-0 mix-blend-soft-light"
                style="
                    background: radial-gradient(
                        circle at var(--glare-x) var(--glare-y),
                        rgba(255, 255, 255, 0.85) 0%,
                        rgba(255, 255, 255, 0.25) 25%,
                        transparent 55%
                    );
                "
            />
        </div>
    </div>
</template>
