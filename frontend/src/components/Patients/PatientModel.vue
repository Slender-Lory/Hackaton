<script setup>
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';

const HEALTHY_ANIMATION = 'Idle';
const SICK_ANIMATION = 'Idle_2_HeadLow';
const REACT_ANIMATIONS = Object.freeze(['Idle_HitReact_Left', 'Idle_HitReact_Right']);
const REACT_DURATION_MS = 1100;

const props = defineProps({
    src: {type: String, required: true},
    alt: {type: String, required: true},
    isSick: {type: Boolean, default: false},
});

const isReady = ref(false);
const reactAnimation = ref(null);
const reactIndex = ref(0);

const animationName = computed(() => reactAnimation.value ?? (props.isSick ? SICK_ANIMATION : HEALTHY_ANIMATION));

let reactTimer;

onMounted(async () => {
    try {
        await import('@google/model-viewer');
        isReady.value = true;
    } catch (error) {
        console.error(error);
    }
});

onBeforeUnmount(() => clearTimeout(reactTimer));

function handlePet() {
    reactAnimation.value = REACT_ANIMATIONS[reactIndex.value % REACT_ANIMATIONS.length];
    reactIndex.value += 1;
    clearTimeout(reactTimer);
    reactTimer = setTimeout(() => {
        reactAnimation.value = null;
    }, REACT_DURATION_MS);
}
</script>

<template>
    <div class="patient-model">
        <model-viewer
            v-if="isReady"
            class="patient-model__viewer"
            :src="src"
            :alt="alt"
            :animation-name="animationName"
            animation-crossfade-duration="250"
            autoplay
            camera-controls
            disable-zoom
            disable-pan
            interaction-prompt="none"
            camera-orbit="25deg 80deg 80%"
            min-camera-orbit="auto 60deg auto"
            max-camera-orbit="auto 90deg auto"
            field-of-view="24deg"
            shadow-intensity="1"
            shadow-softness="0.8"
            exposure="1.05"
            environment-image="neutral"
            @click="handlePet"
        />
        <div
            v-else
            class="patient-model__placeholder"
            aria-hidden="true"
        />
    </div>
</template>

<style lang="scss">
.patient-model {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    background:
        radial-gradient(ellipse 70% 55% at 50% 85%, rgba($color-white, 90%), transparent 70%),
        linear-gradient(180deg, $color-card-text-box 0%, $color-card-face 100%);

    &__viewer {
        width: 100%;
        height: 100%;
        cursor: grab;
        --poster-color: transparent;
        --progress-bar-color: #{$color-accent};

        &:active {
            cursor: grabbing;
        }
    }

    &__placeholder {
        position: absolute;
        inset: 20% 30%;
        animation: patient-model-pulse 1.2s ease-in-out infinite alternate;
        border-radius: 50%;
        background-color: $color-card-text-box;
    }
}

@keyframes patient-model-pulse {
    to {
        opacity: 0.4;
    }
}
</style>
