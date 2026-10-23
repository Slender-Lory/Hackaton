<script setup>
import {professions} from '@/core/data/professions';
import {usePlayerStore} from '@/core/stores/player';
import {useToastStore} from '@/core/stores/toast';

import ProfessionCard from '@/components/Professions/ProfessionCard.vue';

const emit = defineEmits(['play']);

const availableProfessions = professions.filter((profession) => profession.isAvailable);
const upcomingProfessions = professions.filter((profession) => !profession.isAvailable);

const playerStore = usePlayerStore();
const toastStore = useToastStore();

/** @param {import('@/core/types/profession').Profession} profession */
function handleLocked(profession) {
    toastStore.show(`${profession.icon} ${profession.title} — скоро!`);
}
</script>

<template>
    <div class="professions">
        <section
            class="professions__main"
            aria-label="Доступные профессии"
        >
            <ProfessionCard
                v-for="(profession, index) in availableProfessions"
                :key="profession.code"
                :profession="profession"
                :percent="playerStore.getPercent(profession.code)"
                :order="index"
                @play="emit('play', profession)"
            />
        </section>

        <h2 class="professions__subheading">Скоро в игре</h2>
        <section
            class="professions__grid"
            aria-label="Профессии в разработке"
        >
            <ProfessionCard
                v-for="(profession, index) in upcomingProfessions"
                :key="profession.code"
                :profession="profession"
                :order="index + availableProfessions.length"
                @locked="handleLocked(profession)"
            />
        </section>
    </div>
</template>

<style lang="scss">
$main-max-width: 520px;
$card-min-width: 150px;

.professions {
    &__main {
        display: grid;
        max-width: $main-max-width;
        margin: 0 auto;
        gap: $indent-step * 4;
    }

    &__subheading {
        text-align: center;
        opacity: 0.8;
        font-size: $font-size-lg;
        font-weight: $font-weight-extra-bold;

        @include margin('top', 9);
        @include margin('bottom', 3);
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax($card-min-width, 1fr));
        gap: $indent-step * 4;
    }
}
</style>
