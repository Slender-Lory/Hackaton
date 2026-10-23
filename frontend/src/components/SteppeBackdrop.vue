<script setup>
// Живой фон: небо, солнце, холмы у Дона и летящий пух одуванчиков.
const FLUFF_COUNT = 14;

const fluffStyles = Array.from({length: FLUFF_COUNT}, (_, index) => {
    const size = `${6 + (index % 3) * 3}px`;

    return {
        left: `${(index * 37) % 100}%`,
        width: size,
        height: size,
        animationDelay: `${-(index * 1.7) % 14}s`,
        animationDuration: `${12 + (index % 5) * 2}s`,
    };
});
</script>

<template>
    <div
        class="steppe"
        aria-hidden="true"
    >
        <div class="steppe__sun" />
        <div class="steppe__cloud steppe__cloud--big" />
        <div class="steppe__cloud steppe__cloud--small" />
        <svg
            class="steppe__hills"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
        >
            <path
                class="steppe__hill steppe__hill--far"
                d="M0 200 C 240 120 420 170 640 150 C 880 128 1080 90 1440 160 L1440 320 L0 320 Z"
            />
            <path
                class="steppe__river"
                d="M0 250 C 360 228 720 270 1080 240 C 1260 226 1360 236 1440 232 L1440 252 C 1300 258 1200 250 1080 262 C 720 292 360 250 0 272 Z"
            />
            <path
                class="steppe__hill steppe__hill--near"
                d="M0 270 C 300 230 520 290 780 268 C 1040 246 1220 280 1440 258 L1440 320 L0 320 Z"
            />
        </svg>
        <span
            v-for="(style, index) in fluffStyles"
            :key="index"
            class="steppe__fluff"
            :style="style"
        />
    </div>
</template>

<style lang="scss">
$cloud-height: 38px;
$fluff-color: rgba($color-white, 90%);

.steppe {
    position: fixed;
    z-index: $ui-index-backdrop;
    inset: 0;
    overflow: hidden;
    background: linear-gradient(180deg, $color-sky-top 0%, $color-sky-bottom 62%);

    &__sun {
        position: absolute;
        top: 7%;
        right: 12%;
        width: clamp(90px, 14vw, 170px);
        animation: steppe-glow 6s ease-in-out infinite;
        border-radius: 50%;
        background: radial-gradient(circle, $color-sun-core 0%, $color-sun 60%, rgba($color-sun, 0%) 72%);
        aspect-ratio: 1;
    }

    &__cloud {
        position: absolute;
        height: $cloud-height;
        animation: steppe-drift linear infinite;
        border-radius: $cloud-height;
        background: rgba($color-white, 75%);
        filter: blur(1px);

        &::before {
            position: absolute;
            top: -22px;
            left: 22%;
            width: 50%;
            height: 46px;
            content: '';
            border-radius: 50%;
            background: inherit;
        }

        &--big {
            top: 14%;
            width: 160px;
            animation-duration: 70s;
        }

        &--small {
            top: 26%;
            width: 110px;
            animation-duration: 95s;
            animation-delay: -40s;
            opacity: 0.8;
        }
    }

    &__hills {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 42vh;
    }

    &__hill {
        &--far {
            fill: $color-hill-far;
        }

        &--near {
            fill: $color-hill-near;
        }
    }

    &__river {
        opacity: 0.85;
        fill: $color-river;
    }

    &__fluff {
        position: absolute;
        bottom: -$indent-step * 5;
        animation: steppe-float linear infinite;
        border-radius: 50%;
        background: $fluff-color;
        box-shadow: 0 0 6px $fluff-color;
    }
}

@keyframes steppe-glow {
    50% {
        transform: scale(1.06);
    }
}

@keyframes steppe-drift {
    from {
        transform: translateX(-200px);
    }

    to {
        transform: translateX(110vw);
    }
}

@keyframes steppe-float {
    0% {
        transform: translate(0, 0);
        opacity: 0;
    }

    10% {
        opacity: 1;
    }

    50% {
        transform: translate(40px, -50vh);
    }

    100% {
        transform: translate(-20px, -105vh);
        opacity: 0;
    }
}
</style>
