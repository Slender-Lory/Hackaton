<script setup>
import {onMounted} from 'vue';
import {usePlayerStore} from '@/core/stores/player';

import SteppeBackdrop from '@/components/SteppeBackdrop.vue';
import TheHeader from '@/components/Header/TheHeader.vue';

const playerStore = usePlayerStore();

onMounted(playerStore.loadProfile);
</script>

<template>
    <div class="layout">
        <SteppeBackdrop />
        <TheHeader />
        <main class="layout__main">
            <slot />
        </main>
    </div>
</template>

<style lang="scss">
.layout {
    max-width: $page-max-width;
    min-height: 100vh;
    margin: 0 auto;
    padding: $page-gutter $page-gutter ($indent-step * 12);
}
</style>
