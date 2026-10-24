<script setup>
import {ref} from 'vue';

const FLINCH_DURATION = 450;

const props = defineProps({
    /** @type {import('vue').PropType<'dog' | 'pig' | 'cat' | 'bird'>} */
    kind: {type: String, required: true},
    isSick: {type: Boolean, default: false},
    /** @type {import('vue').PropType<import('@/core/types/shift').PigCondition | null>} */
    condition: {type: String, default: null},
    alt: {type: String, required: true},
    isInteractive: {type: Boolean, default: true},
});

const isFlinching = ref(false);

function handleFlinch() {
    if (!props.isInteractive || isFlinching.value) {
        return;
    }

    isFlinching.value = true;
    setTimeout(() => {
        isFlinching.value = false;
    }, FLINCH_DURATION);
}
</script>

<template>
    <component
        :is="isInteractive ? 'button' : 'div'"
        :class="[
            'patient-art',
            `patient-art--${kind}`,
            {'patient-art--sick': isSick, 'patient-art--flinch': isFlinching},
        ]"
        :type="isInteractive ? 'button' : null"
        :role="isInteractive ? null : 'img'"
        :aria-label="alt"
        @click="handleFlinch"
    >
        <svg
            v-if="kind === 'dog'"
            class="patient-art__svg"
            viewBox="0 0 260 200"
            aria-hidden="true"
        >
            <ellipse
                class="patient-art__shadow"
                cx="138"
                cy="190"
                rx="96"
                ry="8"
            />
            <g class="patient-art__tail">
                <circle
                    cx="216"
                    cy="84"
                    r="21"
                    fill="#f0d3ae"
                />
                <circle
                    cx="216"
                    cy="84"
                    r="9"
                    fill="#e2bd92"
                />
            </g>
            <rect
                x="172"
                y="128"
                width="28"
                height="54"
                rx="13"
                fill="#e7c49c"
            />
            <ellipse
                cx="186"
                cy="181"
                rx="17"
                ry="9"
                fill="#7a5a4c"
            />
            <g class="patient-art__body">
                <ellipse
                    cx="152"
                    cy="120"
                    rx="72"
                    ry="48"
                    fill="#f0d3ae"
                />
                <ellipse
                    cx="176"
                    cy="104"
                    rx="22"
                    ry="30"
                    fill="#f6e2c6"
                    transform="rotate(-20 176 104)"
                />
            </g>
            <rect
                x="96"
                y="132"
                width="28"
                height="52"
                rx="13"
                fill="#f0d3ae"
            />
            <rect
                x="132"
                y="136"
                width="28"
                height="48"
                rx="13"
                fill="#e7c49c"
            />
            <ellipse
                cx="110"
                cy="184"
                rx="17"
                ry="9"
                fill="#7a5a4c"
            />
            <ellipse
                cx="146"
                cy="184"
                rx="17"
                ry="9"
                fill="#7a5a4c"
            />
            <g class="patient-art__head">
                <path
                    class="patient-art__ear patient-art__ear--back"
                    d="M128 42 C150 26 178 40 172 64 C168 78 150 72 142 62 Z"
                    fill="#7a5a4c"
                />
                <circle
                    cx="96"
                    cy="86"
                    r="56"
                    fill="#f0d3ae"
                />
                <path
                    d="M80 46 q16 -8 32 0 M70 60 q12 -6 22 -2 M106 58 q12 -4 22 2"
                    stroke="#e2bd92"
                    stroke-width="6"
                    stroke-linecap="round"
                    fill="none"
                />
                <path
                    class="patient-art__ear"
                    d="M58 46 C34 40 20 62 30 86 C36 98 50 92 56 78 Z"
                    fill="#7a5a4c"
                />
                <ellipse
                    cx="70"
                    cy="90"
                    rx="15"
                    ry="13"
                    fill="#8a6a5a"
                />
                <ellipse
                    cx="122"
                    cy="80"
                    rx="15"
                    ry="13"
                    fill="#8a6a5a"
                />
                <g class="patient-art__eyes">
                    <circle
                        cx="72"
                        cy="90"
                        r="5"
                        fill="#1f1a18"
                    />
                    <circle
                        cx="120"
                        cy="80"
                        r="5"
                        fill="#1f1a18"
                    />
                </g>
                <ellipse
                    cx="98"
                    cy="112"
                    rx="34"
                    ry="27"
                    fill="#7a5a4c"
                />
                <ellipse
                    cx="96"
                    cy="100"
                    rx="12"
                    ry="8"
                    fill="#4e3a32"
                />
                <path
                    d="M80 116 q16 12 34 0"
                    stroke="#4e3a32"
                    stroke-width="3"
                    stroke-linecap="round"
                    fill="none"
                />
                <ellipse
                    class="patient-art__tongue"
                    cx="98"
                    cy="124"
                    rx="8"
                    ry="10"
                    fill="#f0a3a0"
                />
                <circle
                    cx="56"
                    cy="104"
                    r="7"
                    fill="#f5b8b0"
                />
                <circle
                    cx="134"
                    cy="96"
                    r="7"
                    fill="#f5b8b0"
                />
                <g
                    v-if="isSick"
                    fill="#c9a07a"
                >
                    <circle
                        cx="44"
                        cy="64"
                        r="6"
                    />
                    <circle
                        cx="150"
                        cy="58"
                        r="5"
                    />
                </g>
            </g>
        </svg>

        <svg
            v-else-if="kind === 'pig'"
            class="patient-art__svg"
            viewBox="0 0 260 200"
            aria-hidden="true"
        >
            <ellipse
                class="patient-art__shadow"
                cx="138"
                cy="190"
                rx="98"
                ry="8"
            />
            <path
                class="patient-art__tail"
                d="M222 104 c16 -4 20 -22 8 -26 c-10 -3 -12 12 -2 12 c10 0 14 -10 14 -10"
                stroke="#e89b95"
                stroke-width="6"
                stroke-linecap="round"
                fill="none"
            />
            <rect
                x="176"
                y="130"
                width="28"
                height="52"
                rx="13"
                fill="#eaa69e"
            />
            <path
                d="M176 172 h28 v8 a10 10 0 0 1 -10 10 h-8 a10 10 0 0 1 -10 -10 Z"
                fill="#9a5c5a"
            />
            <g class="patient-art__body">
                <ellipse
                    cx="154"
                    cy="120"
                    rx="76"
                    ry="50"
                    fill="#f2b3ab"
                />
                <ellipse
                    cx="182"
                    cy="102"
                    rx="22"
                    ry="30"
                    fill="#f6c6bf"
                    transform="rotate(-20 182 102)"
                />
                <g
                    v-if="condition === 'erysipelas'"
                    fill="#d9545e"
                    opacity="0.75"
                >
                    <path d="M140 100 l10 -10 l10 10 l-10 10 Z" />
                    <path d="M170 128 l9 -9 l9 9 l-9 9 Z" />
                    <path d="M196 106 l8 -8 l8 8 l-8 8 Z" />
                    <path d="M150 138 l8 -8 l8 8 l-8 8 Z" />
                </g>
                <ellipse
                    v-if="condition === 'diarrhea'"
                    cx="222"
                    cy="134"
                    rx="10"
                    ry="16"
                    fill="#9b7a4e"
                    opacity="0.55"
                />
            </g>
            <g :class="{'patient-art__lame-leg': condition === 'lame'}">
                <rect
                    x="100"
                    y="132"
                    width="28"
                    height="52"
                    rx="13"
                    fill="#f2b3ab"
                />
                <path
                    d="M100 174 h28 v8 a10 10 0 0 1 -10 10 h-8 a10 10 0 0 1 -10 -10 Z"
                    fill="#9a5c5a"
                />
                <g
                    v-if="condition === 'lame'"
                    fill="#ffffff"
                >
                    <rect
                        x="98"
                        y="150"
                        width="32"
                        height="7"
                        rx="3"
                    />
                    <rect
                        x="98"
                        y="160"
                        width="32"
                        height="7"
                        rx="3"
                    />
                </g>
            </g>
            <rect
                x="138"
                y="136"
                width="28"
                height="48"
                rx="13"
                fill="#eaa69e"
            />
            <path
                d="M138 174 h28 v8 a10 10 0 0 1 -10 10 h-8 a10 10 0 0 1 -10 -10 Z"
                fill="#9a5c5a"
            />
            <g
                v-if="condition === 'ulcers'"
                fill="#fff4f2"
                stroke="#d9545e"
                stroke-width="2"
            >
                <circle
                    cx="112"
                    cy="182"
                    r="4"
                />
                <circle
                    cx="152"
                    cy="182"
                    r="4"
                />
            </g>
            <g class="patient-art__head">
                <path
                    class="patient-art__ear patient-art__ear--back"
                    d="M120 50 C142 22 182 30 180 56 C178 72 150 70 136 66 Z"
                    fill="#e89b95"
                />
                <circle
                    cx="96"
                    cy="92"
                    r="54"
                    fill="#f2b3ab"
                />
                <ellipse
                    cx="112"
                    cy="60"
                    rx="18"
                    ry="12"
                    fill="#f6c6bf"
                />
                <path
                    class="patient-art__ear"
                    d="M62 52 C36 30 8 44 14 72 C18 86 40 84 54 74 Z"
                    fill="#e89b95"
                />
                <g class="patient-art__eyes">
                    <circle
                        cx="76"
                        cy="88"
                        r="5"
                        fill="#1f1a18"
                    />
                    <circle
                        cx="118"
                        cy="80"
                        r="5"
                        fill="#1f1a18"
                    />
                </g>
                <ellipse
                    cx="96"
                    cy="110"
                    rx="26"
                    ry="19"
                    fill="#e8958f"
                    transform="rotate(-10 96 110)"
                />
                <ellipse
                    cx="88"
                    cy="112"
                    rx="4"
                    ry="7"
                    fill="#c06f6f"
                />
                <ellipse
                    cx="104"
                    cy="108"
                    rx="4"
                    ry="7"
                    fill="#c06f6f"
                />
                <circle
                    cx="62"
                    cy="104"
                    r="7"
                    fill="#f19c9a"
                />
                <circle
                    cx="132"
                    cy="94"
                    r="7"
                    fill="#f19c9a"
                />
                <g
                    v-if="condition === 'ulcers'"
                    fill="#fff4f2"
                    stroke="#d9545e"
                    stroke-width="2"
                >
                    <circle
                        cx="80"
                        cy="102"
                        r="4"
                    />
                    <circle
                        cx="112"
                        cy="118"
                        r="3.5"
                    />
                    <circle
                        cx="96"
                        cy="126"
                        r="3"
                    />
                </g>
            </g>
            <g
                v-if="condition === 'cough'"
                class="patient-art__puffs"
                fill="#ffffff"
            >
                <circle
                    class="patient-art__puff"
                    cx="46"
                    cy="114"
                    r="8"
                />
                <circle
                    class="patient-art__puff patient-art__puff--late"
                    cx="34"
                    cy="102"
                    r="6"
                />
            </g>
        </svg>

        <svg
            v-else-if="kind === 'cat'"
            class="patient-art__svg"
            viewBox="0 0 260 200"
            aria-hidden="true"
        >
            <ellipse
                class="patient-art__shadow"
                cx="140"
                cy="190"
                rx="84"
                ry="8"
            />
            <path
                class="patient-art__tail"
                d="M196 160 C236 150 236 96 214 76"
                stroke="#f2b77a"
                stroke-width="16"
                stroke-linecap="round"
                fill="none"
            />
            <g class="patient-art__body">
                <ellipse
                    cx="146"
                    cy="136"
                    rx="62"
                    ry="48"
                    fill="#f2b77a"
                />
                <path
                    d="M130 96 q8 14 0 26 M152 94 q8 16 0 30 M174 102 q8 14 0 26"
                    stroke="#d98a45"
                    stroke-width="7"
                    stroke-linecap="round"
                    fill="none"
                />
                <ellipse
                    cx="122"
                    cy="150"
                    rx="26"
                    ry="24"
                    fill="#fbe3c8"
                />
            </g>
            <ellipse
                cx="110"
                cy="182"
                rx="16"
                ry="9"
                fill="#fbe3c8"
            />
            <ellipse
                cx="146"
                cy="184"
                rx="16"
                ry="9"
                fill="#f2b77a"
            />
            <g class="patient-art__head">
                <path
                    class="patient-art__ear"
                    d="M66 60 L70 18 L100 46 Z"
                    fill="#f2b77a"
                />
                <path
                    class="patient-art__ear patient-art__ear--back"
                    d="M120 46 L148 18 L150 62 Z"
                    fill="#f2b77a"
                />
                <path
                    d="M74 52 L76 30 L92 46 Z M128 46 L142 30 L144 56 Z"
                    fill="#f6c2b6"
                />
                <ellipse
                    cx="108"
                    cy="82"
                    rx="50"
                    ry="44"
                    fill="#f2b77a"
                />
                <path
                    d="M98 44 v14 M108 42 v16 M118 44 v14"
                    stroke="#d98a45"
                    stroke-width="5"
                    stroke-linecap="round"
                />
                <g class="patient-art__eyes">
                    <ellipse
                        cx="88"
                        cy="82"
                        rx="7"
                        ry="9"
                        fill="#7dbf6b"
                    />
                    <ellipse
                        cx="128"
                        cy="82"
                        rx="7"
                        ry="9"
                        fill="#7dbf6b"
                    />
                    <ellipse
                        cx="88"
                        cy="82"
                        rx="2.5"
                        ry="7"
                        fill="#1f1a18"
                    />
                    <ellipse
                        cx="128"
                        cy="82"
                        rx="2.5"
                        ry="7"
                        fill="#1f1a18"
                    />
                </g>
                <path
                    d="M103 98 h10 l-5 6 Z"
                    fill="#e88a8a"
                />
                <path
                    d="M108 104 q-6 8 -12 4 M108 104 q6 8 12 4"
                    stroke="#8a5a3a"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    fill="none"
                />
                <path
                    d="M80 100 h-24 M80 106 l-22 6 M136 100 h24 M136 106 l22 6"
                    stroke="#8a5a3a"
                    stroke-width="2"
                    stroke-linecap="round"
                />
            </g>
        </svg>

        <svg
            v-else
            class="patient-art__svg"
            viewBox="0 0 260 200"
            aria-hidden="true"
        >
            <rect
                x="40"
                y="168"
                width="180"
                height="10"
                rx="5"
                fill="#b88a5a"
            />
            <path
                class="patient-art__tail"
                d="M146 150 L176 196 L160 196 L138 156 Z"
                fill="#5aa9d6"
            />
            <g class="patient-art__body">
                <ellipse
                    cx="132"
                    cy="120"
                    rx="40"
                    ry="50"
                    fill="#8fd36b"
                />
                <path
                    d="M136 92 q24 10 30 48 q-22 -6 -34 -30 Z"
                    fill="#6fb84e"
                />
                <path
                    d="M142 104 q10 2 14 10 M144 118 q10 2 14 10"
                    stroke="#2f5a26"
                    stroke-width="3"
                    stroke-linecap="round"
                    fill="none"
                />
            </g>
            <g class="patient-art__head">
                <circle
                    cx="122"
                    cy="68"
                    r="32"
                    fill="#f5e27a"
                />
                <path
                    d="M104 52 q8 -4 16 0 M110 42 q8 -4 16 0"
                    stroke="#2f2a1a"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    fill="none"
                />
                <g class="patient-art__eyes">
                    <circle
                        cx="110"
                        cy="66"
                        r="5"
                        fill="#1f1a18"
                    />
                </g>
                <path
                    d="M94 72 q-10 4 -4 16 q6 -2 10 -8 Z"
                    fill="#e8a24a"
                />
                <circle
                    cx="100"
                    cy="90"
                    r="4"
                    fill="#5aa9d6"
                />
            </g>
            <path
                d="M120 170 v-8 M140 170 v-8"
                stroke="#9a7a6a"
                stroke-width="4"
                stroke-linecap="round"
            />
        </svg>
    </component>
</template>

<style lang="scss">
$breath-duration: 3.2s;
$breath-duration-sick: 5s;
$wag-duration: 0.7s;
$wag-duration-sick: 2.4s;
$blink-duration: 4.6s;
$ear-duration: 6s;
$puff-duration: 2.2s;

.patient-art {
    $block: &;

    display: block;
    width: 100%;
    cursor: pointer;

    @include button-reset;

    &:focus-visible {
        outline: 2px solid $color-accent;
        outline-offset: 2px;
    }

    &__svg {
        display: block;
        width: 100%;
        height: auto;
        overflow: visible;
    }

    &__shadow {
        fill: rgba($color-ink, 12%);
    }

    &__body,
    &__head,
    &__tail,
    &__ear,
    &__eyes,
    &__puff,
    &__lame-leg {
        transform-box: fill-box;
    }

    &__body {
        transform-origin: center bottom;
        animation: patient-breathe $breath-duration ease-in-out infinite;
    }

    &__head {
        transform-origin: 70% 90%;
        animation: patient-nod $breath-duration ease-in-out infinite;
    }

    &__tail {
        transform-origin: left bottom;
        animation: patient-wag $wag-duration ease-in-out infinite alternate;
    }

    &__ear {
        transform-origin: right top;
        animation: patient-ear $ear-duration ease-in-out infinite;

        &--back {
            transform-origin: left top;
            animation-delay: 1.4s;
        }
    }

    &__eyes {
        transform-origin: center;
        animation: patient-blink $blink-duration ease-in-out infinite;
    }

    &__lame-leg {
        transform-origin: center top;
        animation: patient-limp $breath-duration ease-in-out infinite;
    }

    &__puff {
        animation: patient-puff $puff-duration ease-out infinite;

        &--late {
            animation-delay: 0.5s;
        }
    }

    &--bird &__tail,
    &--pig &__tail {
        transform-origin: left center;
    }

    &--sick {
        #{$block}__body {
            animation-duration: $breath-duration-sick;
        }

        #{$block}__tail {
            animation-duration: $wag-duration-sick;
        }

        #{$block}__eyes {
            transform: scaleY(0.55);
            animation: none;
        }

        #{$block}__head {
            animation-name: patient-droop;
            animation-duration: $breath-duration-sick;
        }
    }

    &--flinch &__svg {
        animation: patient-flinch $duration * 1.5 ease-in-out;
    }

    @media (prefers-reduced-motion: reduce) {
        &__body,
        &__head,
        &__tail,
        &__ear,
        &__eyes,
        &__lame-leg,
        &__puff,
        &--flinch &__svg {
            animation: none;
        }
    }
}

@keyframes patient-breathe {
    50% {
        transform: scale(1.02, 1.04);
    }
}

@keyframes patient-nod {
    50% {
        transform: rotate(-2deg);
    }
}

@keyframes patient-droop {
    50% {
        transform: rotate(4deg) translateY(3px);
    }
}

@keyframes patient-wag {
    from {
        transform: rotate(-10deg);
    }

    to {
        transform: rotate(10deg);
    }
}

@keyframes patient-ear {
    0%,
    88%,
    100% {
        transform: rotate(0);
    }

    92% {
        transform: rotate(-12deg);
    }

    96% {
        transform: rotate(6deg);
    }
}

@keyframes patient-blink {
    0%,
    94%,
    100% {
        transform: scaleY(1);
    }

    97% {
        transform: scaleY(0.1);
    }
}

@keyframes patient-limp {
    50% {
        transform: translateY(-6px) rotate(-6deg);
    }
}

@keyframes patient-puff {
    from {
        transform: translate(0, 0) scale(0.6);
        opacity: 0.9;
    }

    to {
        transform: translate(-18px, -16px) scale(1.3);
        opacity: 0;
    }
}

@keyframes patient-flinch {
    25% {
        transform: translateX(-4px) rotate(-2deg);
    }

    75% {
        transform: translateX(4px) rotate(2deg);
    }
}
</style>
