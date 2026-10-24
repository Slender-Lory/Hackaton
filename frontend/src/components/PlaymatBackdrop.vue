<script setup>
import {Heart, Leaf, PawPrint, Plus, Stethoscope} from 'lucide-vue-next';

const decorations = [
    {icon: PawPrint, side: 'left', top: '18%', tilt: '-20deg', size: '58px'},
    {icon: Leaf, side: 'left-inner', top: '32%', tilt: '25deg', size: '44px'},
    {icon: Stethoscope, side: 'left', top: '53%', tilt: '-12deg', size: '64px'},
    {icon: Plus, side: 'left-inner', top: '59%', tilt: '12deg', size: '30px'},
    {icon: Heart, side: 'left-inner', top: '79%', tilt: '-18deg', size: '38px'},
    {icon: Leaf, side: 'right-inner', top: '20%', tilt: '-30deg', size: '58px'},
    {icon: PawPrint, side: 'right', top: '38%', tilt: '18deg', size: '52px'},
    {icon: Plus, side: 'right-inner', top: '62%', tilt: '-12deg', size: '34px'},
    {icon: Stethoscope, side: 'right', top: '81%', tilt: '22deg', size: '62px'},
];
</script>

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
        <component
            :is="decoration.icon"
            v-for="(decoration, index) in decorations"
            :key="index"
            :class="['playmat__drawing', `playmat__drawing--${decoration.side}`]"
            :style="{
                top: decoration.top,
                '--drawing-tilt': decoration.tilt,
                '--drawing-size': decoration.size,
            }"
            :stroke-width="1"
            aria-hidden="true"
        />
    </div>
</template>

<style lang="scss">
.playmat {
    position: fixed;
    z-index: $ui-index-backdrop;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
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

    &__drawing {
        position: absolute;
        width: var(--drawing-size);
        height: var(--drawing-size);
        color: $color-playmat-decoration;
        opacity: 0.24;
        transform: rotate(var(--drawing-tilt));

        &--left {
            left: clamp(12px, 4vw, 90px);
        }

        &--right {
            right: clamp(12px, 4vw, 90px);
        }

        &--left-inner {
            left: 16%;
        }

        &--right-inner {
            right: 16%;
        }

        @media (max-width: 1500px) {
            &--left-inner,
            &--right-inner {
                display: none;
            }
        }

        @include tablet {
            width: calc(var(--drawing-size) * 0.7);
            height: calc(var(--drawing-size) * 0.7);
            opacity: 0.12;
        }
    }
}
</style>
