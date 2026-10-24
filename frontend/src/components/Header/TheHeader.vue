<script setup>
import {storeToRefs} from 'pinia';
import {LogIn, Stethoscope} from 'lucide-vue-next';
import {ROUTE_NAMES} from '@/core/constants';
import {AUTH_MODES, useAuthDialogStore} from '@/core/stores/authDialog';
import {usePlayerStore} from '@/core/stores/player';

import HeaderPlayer from '@/components/Header/HeaderPlayer.vue';
import UiButton from '@/components/Ui/UiButton.vue';

const authDialogStore = useAuthDialogStore();

const {isSignedIn, isRestored, nickname} = storeToRefs(usePlayerStore());
</script>

<template>
    <header class="header">
        <RouterLink
            class="header__logo"
            :to="{name: ROUTE_NAMES.professions}"
        >
            <Stethoscope
                :size="26"
                aria-hidden="true"
            />
            Ветеринар
        </RouterLink>
        <HeaderPlayer
            v-if="isSignedIn"
            :nickname="nickname"
        />
        <UiButton
            v-else-if="isRestored"
            theme="ghost"
            @click="authDialogStore.open(AUTH_MODES.login)"
        >
            <LogIn
                :size="18"
                aria-hidden="true"
            />
            Войти
        </UiButton>
    </header>
</template>

<style lang="scss">
$avatar-size: 34px;

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $indent-step * 4;

    @include padding('y', 4);

    &__logo {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        color: $color-on-playmat;
        gap: $indent-step * 2;

        @include display($font-size-lg);
    }

    &-player {
        display: flex;
        align-items: center;
        min-width: 0;
        transition: background-color $duration ease;
        text-decoration: none;
        color: $color-on-playmat;
        border: 2px solid rgba($color-white, 25%);
        border-radius: $radius-chip;
        background-color: rgba($color-white, 10%);
        gap: $indent-step * 2;

        @include padding('y', 1);
        @include padding('left', 1);
        @include padding('right', 4);

        @include hover {
            background-color: rgba($color-white, 18%);
        }

        &__avatar {
            flex-shrink: 0;
            width: $avatar-size;
            height: $avatar-size;
            color: $color-ink;
            border-radius: 50%;
            background-color: $color-action;
            font-weight: $font-weight-bold;

            @include flex-center;
        }

        &__name {
            overflow: hidden;
            max-width: 40vw;
            white-space: nowrap;
            text-overflow: ellipsis;
            font-weight: $font-weight-semibold;
        }
    }
}
</style>
