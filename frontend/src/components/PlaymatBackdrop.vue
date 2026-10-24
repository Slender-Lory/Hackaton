<script setup></script>

<template>
    <div
        class="playmat"
        aria-hidden="true"
    >
        <svg class="playmat__felt">
            <filter id="playmat-felt">
                <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.75"
                    numOctaves="3"
                    stitchTiles="stitch"
                />
                <feColorMatrix
                    type="saturate"
                    values="0"
                />
            </filter>
            <rect
                width="100%"
                height="100%"
                filter="url(#playmat-felt)"
            />
        </svg>
        <div class="playmat__zone playmat__zone--deck" />
    </div>
</template>

<style lang="scss">
.playmat {
    position: fixed;
    z-index: $ui-index-backdrop;
    inset: 0;
    overflow: hidden;
    background:
        radial-gradient(ellipse 70% 60% at 70% 35%, $color-playmat-light, transparent 70%),
        radial-gradient(ellipse 90% 70% at 0% 100%, $color-playmat-deep, transparent 70%), $color-playmat;

    &__felt {
        position: absolute;
        width: 100%;
        height: 100%;
        mix-blend-mode: soft-light;
        opacity: 0.35;
    }

    &__zone {
        position: absolute;
        border: 2px dashed $color-playmat-line;
        border-radius: $radius-card + 6px;

        &--deck {
            bottom: -14vh;
            left: 4vw;
            width: min(260px, 30vw);
            transform: rotate(-8deg);
            aspect-ratio: 5 / 7;
        }

        @include tablet {
            display: none;
        }
    }
}
</style>
