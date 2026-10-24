<script setup>
import {computed} from 'vue';
import {useRouter} from 'vue-router';
import {GraduationCap, Play} from 'lucide-vue-next';
import {ROUTE_NAMES} from '@/core/constants';
import {professions} from '@/core/data/professions';
import {usePlayerStore} from '@/core/stores/player';
import {useToastStore} from '@/core/stores/toast';

import ProfessionCard from '@/components/Professions/ProfessionCard.vue';
import ProfessionCardBack from '@/components/Professions/ProfessionCardBack.vue';
import UiButton from '@/components/Ui/UiButton.vue';

const HAND_SIDE_LAYOUT = Object.freeze([
    {order: 1, tilt: -14, drop: 56},
    {order: 2, tilt: -7, drop: 18},
    {order: 4, tilt: 7, drop: 18},
    {order: 5, tilt: 14, drop: 56},
]);
const MAIN_CARD_ORDER = 3;

const emit = defineEmits(['play']);

const router = useRouter();
const playerStore = usePlayerStore();
const toastStore = useToastStore();

const [mainProfession] = professions.filter((profession) => profession.isAvailable);
const upcomingProfessions = professions.filter((profession) => !profession.isAvailable);

const mainPercent = computed(() => playerStore.getPercent(mainProfession.code));

/** @param {number} index */
function getSideStyle(index) {
    const {order, drop} = HAND_SIDE_LAYOUT[index] ?? HAND_SIDE_LAYOUT.at(-1);

    return {'--hand-order': order, '--hand-drop': `${drop}px`};
}

/** @param {import('@/core/types/profession').Profession} profession */
function handleLocked(profession) {
    toastStore.show(`${profession.title} — карта откроется в следующих обновлениях`);
}

function handleAbout() {
    router.push({name: ROUTE_NAMES.professionAbout, params: {profession: mainProfession.code}});
}
</script>

<template>
    <section
        class="professions"
        aria-labelledby="professions-title"
    >
        <div class="professions__intro">
            <h1
                id="professions-title"
                class="professions__title"
            >
                Кем станешь?
            </h1>
            <p class="professions__lead">Каждая профессия — карта. Открой её и попробуй себя в деле.</p>
        </div>

        <ul
            class="professions__hand"
            aria-label="Колода профессий"
        >
            <li
                class="professions__slot professions__slot--main"
                :style="{'--hand-order': MAIN_CARD_ORDER}"
            >
                <ProfessionCard
                    :profession="mainProfession"
                    :percent="mainPercent"
                />
            </li>
            <li
                v-for="(profession, index) in upcomingProfessions"
                :key="profession.code"
                class="professions__slot"
                :style="getSideStyle(index)"
            >
                <ProfessionCardBack
                    :profession="profession"
                    :tilt="HAND_SIDE_LAYOUT[index]?.tilt ?? 0"
                    @locked="handleLocked(profession)"
                />
            </li>
        </ul>

        <div class="professions__actions">
            <div class="professions__buttons">
                <UiButton
                    large
                    @click="emit('play', mainProfession)"
                >
                    <Play
                        :size="20"
                        aria-hidden="true"
                    />
                    {{ mainPercent === null ? 'Начать смену' : 'Продолжить смену' }}
                </UiButton>
                <UiButton
                    theme="ghost"
                    large
                    @click="handleAbout"
                >
                    <GraduationCap
                        :size="20"
                        aria-hidden="true"
                    />
                    Как стать ветеринаром
                </UiButton>
            </div>
            <p class="professions__note">Без регистрации, нужно только имя</p>
        </div>
    </section>
</template>

<style lang="scss">
$main-card-width: 300px;
$side-card-width: 168px;
$side-card-overlap: 10px;
$mobile-card-width: 248px;
$mobile-card-half: 124px;

.professions {
    align-items: center;
    text-align: center;

    @include column($indent-step * 6);
    @include padding('top', 2);
    @include padding('bottom', 10);

    &__intro {
        align-items: center;

        @include column($indent-step * 3);
    }

    &__title {
        @include display(clamp(40px, 6vw, 76px));

        text-wrap: balance;
    }

    &__lead {
        max-width: 46ch;
        color: $color-on-playmat-soft;
        font-size: $font-size-lg;
    }

    &__hand {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        width: 100%;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    &__slot {
        position: relative;
        flex: 0 0 $side-card-width;
        order: var(--hand-order);
        margin-inline: -$side-card-overlap;
        transform: translateY(var(--hand-drop, 0));

        &--main {
            z-index: $ui-index-2;
            flex-basis: $main-card-width;
            margin-inline: $indent-step * 2;
            animation: card-deal 0.9s $ease-out 0.15s both;
            text-align: left;
        }
    }

    &__actions {
        align-items: center;

        @include column($indent-step * 3);
    }

    &__buttons {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: $indent-step * 3;
    }

    &__note {
        color: $color-on-playmat-soft;
        font-size: $font-size-sm;
    }

    @include tablet {
        gap: $indent-step * 6;

        &__hand {
            overflow-x: auto;
            align-items: flex-start;
            justify-content: flex-start;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            gap: $indent-step * 4;

            @include padding('y', 4);

            padding-inline: calc(50% - #{$mobile-card-half});

            &::-webkit-scrollbar {
                display: none;
            }
        }

        &__slot {
            flex-basis: $mobile-card-width;
            order: 0;
            margin-inline: 0;
            transform: none;
            scroll-snap-align: center;

            &--main {
                flex-basis: $mobile-card-width;
                min-width: 0;
                margin-inline: 0;
            }

            .profession-card-back {
                transform: none;
            }
        }

        &__actions {
            position: sticky;
            z-index: $ui-index-2;
            bottom: $indent-step * 4;
            width: 100%;

            .ui-button {
                width: 100%;
            }
        }

        &__note {
            display: none;
        }
    }
}
</style>
