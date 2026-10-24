<script setup>
import {computed} from 'vue';

const props = defineProps({
    roomCode: {type: String, required: true},
});

const isFarm = computed(() => props.roomCode === 'garage');
</script>

<template>
    <div
        :class="['shift-scene', isFarm ? 'shift-scene--farm' : 'shift-scene--clinic']"
        aria-hidden="true"
    >
        <svg
            v-if="isFarm"
            class="shift-scene__art"
            viewBox="0 0 600 120"
            preserveAspectRatio="xMidYMid slice"
        >
            <rect
                width="600"
                height="120"
                fill="#cdeef0"
            />
            <circle
                cx="520"
                cy="30"
                r="18"
                fill="#ffe08a"
            />
            <path
                d="M0 80 C120 55 240 70 360 62 C460 56 540 70 600 64 V120 H0Z"
                fill="#a9dcb0"
            />
            <path
                d="M0 96 C150 84 300 98 450 88 C520 84 570 90 600 88 V120 H0Z"
                fill="#86c792"
            />
            <rect
                x="60"
                y="46"
                width="96"
                height="48"
                fill="#e98a7a"
            />
            <path
                d="M52 50 L108 22 L164 50Z"
                fill="#c9665a"
            />
            <rect
                x="94"
                y="64"
                width="28"
                height="30"
                fill="#fbefe4"
            />
            <path
                d="M94 64 L122 94 M122 64 L94 94"
                stroke="#c9665a"
                stroke-width="3"
            />
            <rect
                x="170"
                y="58"
                width="70"
                height="36"
                fill="#f3e3cf"
            />
            <path
                d="M164 60 L205 42 L246 60Z"
                fill="#b9a58c"
            />
            <path
                d="M260 92 H600 M260 82 H600"
                stroke="#d9b98c"
                stroke-width="3"
            />
            <path
                d="M280 76 V96 M330 76 V96 M380 76 V96 M430 76 V96 M480 76 V96 M530 76 V96 M580 76 V96"
                stroke="#c9a676"
                stroke-width="4"
            />
            <ellipse
                cx="350"
                cy="104"
                rx="16"
                ry="10"
                fill="#f2b3ab"
            />
            <circle
                cx="336"
                cy="100"
                r="8"
                fill="#f2b3ab"
            />
            <ellipse
                cx="420"
                cy="106"
                rx="14"
                ry="9"
                fill="#f2b3ab"
            />
            <circle
                cx="408"
                cy="102"
                r="7"
                fill="#f2b3ab"
            />
        </svg>
        <svg
            v-else
            class="shift-scene__art"
            viewBox="0 0 600 120"
            preserveAspectRatio="xMidYMid slice"
        >
            <rect
                width="600"
                height="120"
                fill="#e6f4f1"
            />
            <rect
                y="92"
                width="600"
                height="28"
                fill="#cfe7e1"
            />
            <rect
                x="40"
                y="18"
                width="110"
                height="62"
                rx="6"
                fill="#bfe6f0"
                stroke="#ffffff"
                stroke-width="6"
            />
            <path
                d="M95 18 V80 M40 49 H150"
                stroke="#ffffff"
                stroke-width="5"
            />
            <rect
                x="200"
                y="30"
                width="80"
                height="62"
                rx="6"
                fill="#ffffff"
            />
            <path
                d="M200 52 H280 M200 72 H280"
                stroke="#cfe7e1"
                stroke-width="3"
            />
            <rect
                x="214"
                y="36"
                width="14"
                height="12"
                rx="2"
                fill="#ffd36b"
            />
            <rect
                x="236"
                y="38"
                width="10"
                height="10"
                rx="2"
                fill="#3fb3a1"
            />
            <rect
                x="226"
                y="58"
                width="18"
                height="10"
                rx="2"
                fill="#f08a7a"
            />
            <rect
                x="330"
                y="70"
                width="170"
                height="12"
                rx="6"
                fill="#9fd3c8"
            />
            <path
                d="M350 82 V104 M480 82 V104"
                stroke="#9fd3c8"
                stroke-width="6"
                stroke-linecap="round"
            />
            <path
                d="M415 40 a14 14 0 0 1 28 0 v18"
                stroke="#3fb3a1"
                stroke-width="4"
                fill="none"
                stroke-linecap="round"
            />
            <circle
                cx="443"
                cy="62"
                r="5"
                fill="#3fb3a1"
            />
            <rect
                x="540"
                y="66"
                width="26"
                height="26"
                rx="4"
                fill="#e98a7a"
            />
            <path
                d="M553 66 C540 50 546 38 553 30 C560 38 566 50 553 66Z"
                fill="#86c792"
            />
        </svg>
    </div>
</template>

<style lang="scss">
$scene-height: 96px;

.shift-scene {
    overflow: hidden;
    height: $scene-height;
    border-radius: $radius-card-inner;

    @include margin('bottom', 1);

    &__art {
        display: block;
        width: 100%;
        height: 100%;
    }
}
</style>
