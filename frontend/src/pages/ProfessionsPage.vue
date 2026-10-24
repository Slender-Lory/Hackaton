<script setup>
import {useStartGame} from '@/composables/useStartGame';

import NicknameForm from '@/components/Forms/NicknameForm.vue';
import ProfessionsPicker from '@/components/Professions/ProfessionsPicker.vue';

const {pendingProfession, startGame, continueAfterEnter, cancelStart} = useStartGame();
</script>

<template>
    <div class="professions-page">
        <ProfessionsPicker @play="startGame" />
        <NicknameForm
            v-if="pendingProfession"
            @close="cancelStart"
            @entered="continueAfterEnter"
        />
    </div>
</template>
