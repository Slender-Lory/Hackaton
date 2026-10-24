<script setup>
import {computed, onBeforeUnmount, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {ArrowLeft, ArrowRight, Play} from 'lucide-vue-next';
import {ROUTE_NAMES} from '@/core/constants';
import {prologues} from '@/core/data/prologue';
import {useStoryScenes} from '@/composables/useStoryScenes';

import UiButton from '@/components/Ui/UiButton.vue';

const route = useRoute();
const router = useRouter();

const scenes = computed(() => prologues[route.params.profession] ?? []);

const {sceneIndex, currentScene, isLastScene, showNextScene, showPreviousScene} = useStoryScenes(scenes);

onMounted(() => {
    if (!scenes.value.length) {
        openShift();

        return;
    }

    document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown));

function openShift() {
    router.replace({name: ROUTE_NAMES.game, params: {profession: route.params.profession}});
}

function handleNext() {
    if (isLastScene.value) {
        openShift();

        return;
    }

    showNextScene();
}

/** @param {KeyboardEvent} event */
function handleKeydown(event) {
    if (event.target instanceof HTMLButtonElement && event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
        return;
    }

    if (['ArrowRight', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        handleNext();
    }

    if (event.key === 'ArrowLeft') {
        showPreviousScene();
    }
}
</script>

<template>
    <section
        v-if="currentScene"
        class="prologue"
        aria-labelledby="prologue-title"
    >
        <header class="prologue__top">
            <h1
                id="prologue-title"
                class="prologue__title"
            >
                Пролог
            </h1>
            <button
                class="prologue__skip"
                type="button"
                @click="openShift"
            >
                Пропустить
            </button>
        </header>

        <div class="prologue__stage">
            <Transition
                name="prologue-scene"
                mode="out-in"
            >
                <p
                    :key="currentScene.id"
                    class="prologue__text"
                    aria-live="polite"
                >
                    {{ currentScene.text }}
                </p>
            </Transition>
        </div>

        <footer class="prologue__controls">
            <ol
                class="prologue__progress"
                :aria-label="`Сцена ${sceneIndex + 1} из ${scenes.length}`"
            >
                <li
                    v-for="(scene, index) in scenes"
                    :key="scene.id"
                    :class="['prologue__dot', {'prologue__dot--active': index <= sceneIndex}]"
                />
            </ol>

            <div class="prologue__buttons">
                <UiButton
                    v-if="sceneIndex > 0"
                    theme="ghost"
                    aria-label="Предыдущая сцена"
                    @click="showPreviousScene"
                >
                    <ArrowLeft
                        :size="20"
                        aria-hidden="true"
                    />
                </UiButton>
                <UiButton
                    large
                    @click="handleNext"
                >
                    <template v-if="isLastScene">
                        <Play
                            :size="20"
                            aria-hidden="true"
                        />
                        Начать первую смену
                    </template>
                    <template v-else>
                        Дальше
                        <ArrowRight
                            :size="20"
                            aria-hidden="true"
                        />
                    </template>
                </UiButton>
            </div>
        </footer>
    </section>
</template>

<style lang="scss">
.prologue {
    display: grid;
    min-height: calc(100vh - #{$indent-step * 24});
    grid-template-rows: auto 1fr auto;
    gap: $indent-step * 8;

    @include padding('y', 6);

    &__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    &__title {
        color: $color-on-playmat-soft;
        font-size: $font-size-md;
        font-weight: $font-weight-semibold;
    }

    &__skip {
        color: $color-on-playmat-soft;
        font-weight: $font-weight-semibold;
        text-decoration: underline;
        text-underline-offset: 4px;

        @include button-reset;

        @include hover {
            color: $color-on-playmat;
        }
    }

    &__stage {
        @include flex-center;
    }

    &__text {
        max-width: 22ch;
        text-align: center;
        text-wrap: balance;

        @include display(clamp(32px, 5vw, 60px));

        line-height: 1.15;
    }

    &__controls {
        align-items: center;

        @include column($indent-step * 6);
    }

    &__progress {
        display: flex;
        margin: 0;
        padding: 0;
        list-style: none;
        gap: $indent-step * 2;
    }

    &__dot {
        width: 28px;
        height: 6px;
        transition: background-color $duration ease;
        border-radius: $radius-chip;
        background-color: rgba($color-white, 25%);

        &--active {
            background-color: $color-action;
        }
    }

    &__buttons {
        display: flex;
        align-items: center;
        gap: $indent-step * 3;
    }
    &-scene-enter-active,
    &-scene-leave-active {
        transition:
            opacity $duration-slow $ease-out,
            transform $duration-slow $ease-out,
            filter $duration-slow $ease-out;
    }

    &-scene-enter-from {
        transform: translateY($indent-step * 6);
        opacity: 0;
        filter: blur(6px);
    }

    &-scene-leave-to {
        transform: translateY(-$indent-step * 4);
        opacity: 0;
        filter: blur(6px);
    }
}
</style>
