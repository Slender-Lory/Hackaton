<script setup>
import {useStartGame} from '@/composables/useStartGame';

import NicknameForm from '@/components/Forms/NicknameForm.vue';
import ProfessionsPicker from '@/components/Professions/ProfessionsPicker.vue';

const {pendingProfession, startGame, continueAfterEnter, cancelStart} = useStartGame();
</script>

<template>
    <div class="professions-page">
        <h1 class="professions-page__title">Кем станешь?</h1>
        <ProfessionsPicker @play="startGame" />
        <NicknameForm
            v-if="pendingProfession"
            @close="cancelStart"
            @entered="continueAfterEnter"
        />
    </div>
</template>

<style lang="scss">
.professions-page {
    &__title {
        text-align: center;
        color: $color-white;
        font-size: clamp(34px, 7vw, 54px);
        font-weight: $font-weight-black;
        text-shadow:
            0 3px 0 $color-vet-dark,
            0 8px 24px rgba($color-vet-dark, 35%);

        @include appear(drop-in, 0.6s);
        @include margin('top', 5);
        @include margin('bottom', 6);
    }
}
</style>
