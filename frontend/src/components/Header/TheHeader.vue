<script setup>
import {storeToRefs} from 'pinia';
import {usePlayerStore} from '@/core/stores/player';

import HeaderPlayer from '@/components/Header/HeaderPlayer.vue';

const APP_TITLE = 'Лапкино';

const {player} = storeToRefs(usePlayerStore());
</script>

<template>
    <header class="header">
        <span class="header__logo">🐾 {{ APP_TITLE }}</span>
        <HeaderPlayer
            v-if="player"
            :nickname="player.nickname"
        />
    </header>
</template>

<style lang="scss">
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: $indent-step * 12;
    gap: $indent-step * 3;

    &__logo {
        color: $color-vet-dark;
        font-size: $font-size-xxl;
        font-weight: $font-weight-black;
        text-shadow: 0 2px 0 rgba($color-white, 70%);
    }

    &-player {
        overflow: hidden;
        max-width: 50vw;
        white-space: nowrap;
        text-overflow: ellipsis;
        border-radius: $radius-pill;
        background: $color-glass;
        box-shadow: $shadow-sm;
        font-weight: $font-weight-extra-bold;

        @include padding('y', 2);
        @include padding('x', 4);

        &__icon {
            @include margin('right', 1);
        }
    }
}
</style>
