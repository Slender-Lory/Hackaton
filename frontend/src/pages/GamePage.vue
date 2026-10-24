<script setup>
import {computed} from 'vue';
import {useRoute} from 'vue-router';
import {ArrowLeft} from 'lucide-vue-next';
import {ROUTE_NAMES} from '@/core/constants';
import {professions} from '@/core/data/professions';
import {usePlayerStore} from '@/core/stores/player';

import ClinicPlan from '@/components/Clinic/ClinicPlan.vue';
import ProfessionCard from '@/components/Professions/ProfessionCard.vue';

const route = useRoute();
const playerStore = usePlayerStore();

const profession = computed(() => professions.find((item) => item.code === route.params.profession));
</script>

<template>
    <div class="game-page">
        <RouterLink
            class="game-page__back"
            :to="{name: ROUTE_NAMES.professions}"
        >
            <ArrowLeft
                :size="18"
                aria-hidden="true"
            />
            К колоде
        </RouterLink>

        <div class="game-page__table">
            <div class="game-page__main">
                <div class="game-page__intro">
                    <h1 class="game-page__title">Смена 1. Первый вызов</h1>
                    <p class="game-page__lead">
                        6:40, звонит Пётр Ильич: поросята не встают, у троих слюна. До фермы сорок минут, а в приёмной
                        уже ждёт Барон.
                    </p>
                </div>
                <ClinicPlan :shift="1" />
                <p class="game-page__note">Смена в разработке: здесь появятся приём, триаж и выезд на ферму.</p>
            </div>
            <ProfessionCard
                v-if="profession"
                class="game-page__card"
                :profession="profession"
                :percent="playerStore.getPercent(profession.code)"
                is-patient-sick
            />
        </div>
    </div>
</template>

<style lang="scss">
$card-width: 320px;

.game-page {
    @include padding('y', 6);
    @include padding('bottom', 16);

    &__back {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        color: $color-on-playmat-soft;
        font-weight: $font-weight-semibold;
        gap: $indent-step * 2;

        @include hover {
            color: $color-on-playmat;
        }
    }

    &__main {
        min-width: 0;

        @include column($indent-step * 10);
    }

    &__intro {
        max-width: 720px;

        @include column($indent-step * 4);
    }

    &__title {
        @include display(clamp(36px, 6vw, 72px));

        text-wrap: balance;
    }

    &__lead {
        max-width: 60ch;
        color: $color-on-playmat-soft;
        font-size: $font-size-lg;
    }

    &__table {
        display: grid;
        align-items: start;
        grid-template-columns: minmax(0, 1fr) $card-width;
        gap: $indent-step * 10;

        @include margin('top', 6);

        @include tablet {
            grid-template-columns: 1fr;
        }
    }

    &__card {
        position: sticky;
        top: $indent-step * 6;
        rotate: 2deg;

        @include tablet {
            position: static;
            max-width: $card-width;
            justify-self: center;
            rotate: 0deg;
        }
    }

    &__note {
        color: $color-on-playmat-soft;
        font-size: $font-size-sm;
    }
}
</style>
