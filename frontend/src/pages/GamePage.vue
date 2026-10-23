<script setup>
// Точка входа в игру. Здесь будет сама глава — пока экран-заглушка.
import {computed} from 'vue';
import {useRoute} from 'vue-router';
import {ROUTE_NAMES} from '@/core/constants';
import {professions} from '@/core/data/professions';

const route = useRoute();

const profession = computed(() => professions.find((item) => item.code === route.params.profession));
const cardStyle = computed(() => ({'--accent': `var(--profession-${profession.value?.code ?? 'vet'})`}));
</script>

<template>
    <div class="game-page">
        <div
            class="game-page__card"
            :style="cardStyle"
        >
            <div
                class="game-page__icon"
                aria-hidden="true"
            >
                {{ profession?.icon ?? '🎮' }}
            </div>
            <h1 class="game-page__title">{{ profession?.title ?? 'Игра' }}</h1>
            <p class="game-page__text">Игра скоро будет здесь</p>
            <RouterLink
                class="game-page__back"
                :to="{name: ROUTE_NAMES.professions}"
            >
                ← К профессиям
            </RouterLink>
        </div>
    </div>
</template>

<style lang="scss">
.game-page {
    min-height: 60vh;

    @include flex-center;

    &__card {
        text-align: center;

        @include surface;
        @include column($indent-step * 2);
        @include appear(pop-in);
        @include padding('y', 8);
        @include padding('x', 7);
    }

    &__icon {
        font-size: 72px;
    }

    &__title {
        color: accent-shade();
        font-size: clamp(28px, 5vw, 36px);
    }

    &__text {
        color: $color-text-secondary;

        @include margin('bottom', 3);
    }

    &__back {
        text-decoration: none;
        color: $color-white;
        border-radius: $radius-pill;
        background: $color-accent;
        font-weight: $font-weight-extra-bold;

        @include padding('y', 3);
        @include padding('x', 6);
    }
}
</style>
