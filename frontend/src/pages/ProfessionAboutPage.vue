<script setup>
import {computed, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {ArrowLeft, BookOpen, HeartHandshake, Play, Sparkles, Stethoscope, Wallet} from 'lucide-vue-next';
import {ROUTE_NAMES} from '@/core/constants';
import {professionInfo} from '@/core/data/professionInfo';
import {professions} from '@/core/data/professions';
import {useStartGame} from '@/composables/useStartGame';

import NicknameForm from '@/components/Forms/NicknameForm.vue';
import UiButton from '@/components/Ui/UiButton.vue';

const SECTION_ICONS = Object.freeze({
    what: Stethoscope,
    why: HeartHandshake,
    skills: Sparkles,
    money: Wallet,
    how: BookOpen,
});

const route = useRoute();
const router = useRouter();
const {isNicknameFormOpen, startGame, continueAfterEnter, switchToLogin, cancelStart} = useStartGame();

const profession = computed(() => professions.find((item) => item.code === String(route.params.profession)));
const info = computed(() => professionInfo[String(route.params.profession)] ?? null);

watch(info, leaveIfUnknown, {immediate: true});

function leaveIfUnknown() {
    if (!info.value) {
        router.replace({name: ROUTE_NAMES.professions});
    }
}

function handlePlay() {
    if (profession.value) {
        startGame(profession.value);
    }
}
</script>

<template>
    <article
        v-if="info"
        class="profession-about"
    >
        <RouterLink
            class="profession-about__back"
            :to="{name: ROUTE_NAMES.professions}"
        >
            <ArrowLeft
                :size="18"
                aria-hidden="true"
            />
            К колоде
        </RouterLink>

        <header class="profession-about__head">
            <h1 class="profession-about__title">Профессия: {{ info.title.toLowerCase() }}</h1>
            <p class="profession-about__lead">{{ info.lead }}</p>
        </header>

        <div class="profession-about__sections">
            <section
                v-for="section in info.sections"
                :key="section.id"
                class="profession-about__section"
            >
                <h2 class="profession-about__section-title">
                    <component
                        :is="SECTION_ICONS[section.id]"
                        class="profession-about__icon"
                        :size="22"
                        aria-hidden="true"
                    />
                    {{ section.title }}
                </h2>
                <ul class="profession-about__list">
                    <li
                        v-for="item in section.items"
                        :key="item"
                        class="profession-about__item"
                    >
                        {{ item }}
                    </li>
                </ul>
            </section>
        </div>

        <footer class="profession-about__cta">
            <p class="profession-about__cta-text">
                Лучший способ понять профессию — попробовать. Три смены в клинике и на ферме.
            </p>
            <UiButton
                large
                @click="handlePlay"
            >
                <Play
                    :size="20"
                    aria-hidden="true"
                />
                Попробовать в игре
            </UiButton>
        </footer>

        <NicknameForm
            v-if="isNicknameFormOpen"
            @close="cancelStart"
            @entered="continueAfterEnter"
            @login="switchToLogin"
        />
    </article>
</template>

<style lang="scss">
$content-width: 880px;

.profession-about {
    width: 100%;
    max-width: $content-width;
    margin: 0 auto;

    @include column($indent-step * 6);
    @include padding('y', 6);
    @include padding('bottom', 16);

    &__back {
        display: inline-flex;
        align-items: center;
        align-self: flex-start;
        text-decoration: none;
        color: $color-on-playmat-soft;
        font-weight: $font-weight-semibold;
        gap: $indent-step * 2;

        @include hover {
            color: $color-on-playmat;
        }
    }

    &__head {
        color: $color-on-playmat;

        @include column($indent-step * 3);
    }

    &__title {
        @include display(clamp(32px, 5vw, 56px));
    }

    &__lead {
        color: $color-on-playmat-soft;
        font-size: $font-size-lg;
        line-height: 1.5;
    }

    &__sections {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: $indent-step * 4;

        @include mobile {
            grid-template-columns: minmax(0, 1fr);
        }
    }

    &__section {
        color: $color-ink;

        @include card-face;
        @include column($indent-step * 3);
        @include padding('y', 5);
        @include padding('x', 5);
    }

    &__section-title {
        display: flex;
        align-items: center;
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
        gap: $indent-step * 2;
    }

    &__icon {
        flex-shrink: 0;
        color: $color-accent;
    }

    &__list {
        margin: 0;
        padding: 0;
        list-style: none;

        @include column($indent-step * 2);
    }

    &__item {
        position: relative;
        font-size: $font-size-sm;
        line-height: 1.5;

        @include padding('left', 4);

        &::before {
            position: absolute;
            top: 0.6em;
            left: 0;
            width: $indent-step * 1.5;
            height: $indent-step * 1.5;
            content: '';
            border-radius: $radius-chip;
            background-color: $color-accent;
        }
    }

    &__cta {
        align-items: flex-start;
        color: $color-on-playmat;

        @include column($indent-step * 3);
    }

    &__cta-text {
        font-size: $font-size-md;
    }
}
</style>
