<script setup>
import {useStartGame} from '@/composables/useStartGame';

import NicknameForm from '@/components/Forms/NicknameForm.vue';
import ProfessionsPicker from '@/components/Professions/ProfessionsPicker.vue';

const {isNicknameFormOpen, startGame, continueAfterEnter, switchToLogin, cancelStart} = useStartGame();
</script>

<template>
    <div class="professions-page">
        <ProfessionsPicker @play="startGame" />
        <NicknameForm
            v-if="isNicknameFormOpen"
            @close="cancelStart"
            @entered="continueAfterEnter"
            @login="switchToLogin"
        />
    </div>
</template>
