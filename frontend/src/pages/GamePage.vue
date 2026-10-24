<script setup>
import {storeToRefs} from 'pinia';
import {computed, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {ArrowLeft} from 'lucide-vue-next';
import {ROUTE_NAMES} from '@/core/constants';
import {professions} from '@/core/data/professions';
import {usePlayerStore} from '@/core/stores/player';
import {useShift} from '@/composables/useShift';

import ClinicPlan from '@/components/Clinic/ClinicPlan.vue';
import ProfessionCard from '@/components/Professions/ProfessionCard.vue';
import ShiftActivity from '@/components/Shift/ShiftActivity.vue';
import ShiftCounters from '@/components/Shift/ShiftCounters.vue';
import ShiftFinale from '@/components/Shift/ShiftFinale.vue';
import ShiftMorning from '@/components/Shift/ShiftMorning.vue';
import ShiftPatientCard from '@/components/Shift/ShiftPatientCard.vue';

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();
const {isRestored, isSignedIn} = storeToRefs(playerStore);

const professionCode = computed(() => String(route.params.profession));

const {
    state,
    shift,
    counters,
    activeActivity,
    activityStatuses,
    isShiftFinished,
    nextShift,
    morningEvents,
    chapterEnding,
    openActivity,
    closeActivity,
    answerStep,
    startNextShift,
} = useShift(professionCode);

const profession = computed(() => professions.find((item) => item.code === professionCode.value));

watch([isRestored, state], leaveIfCannotPlay, {immediate: true});

watch([activeActivity, () => shift.value?.number], () => window.scrollTo({top: 0}));

function leaveIfCannotPlay() {
    if (!isRestored.value) {
        return;
    }

    if (!isSignedIn.value || !profession.value || (state.value && !shift.value)) {
        leaveGame();
    }
}

function leaveGame() {
    router.replace({name: ROUTE_NAMES.professions});
}
</script>

<template>
    <div
        v-if="shift"
        class="game-page"
    >
        <div
            v-if="activeActivity"
            class="game-page__table"
        >
            <ShiftActivity
                :key="activeActivity.code"
                :activity="activeActivity"
                :state="state"
                @answer="answerStep"
                @close="closeActivity"
            >
                <template #counters>
                    <ShiftCounters :counters="counters" />
                </template>
            </ShiftActivity>
            <ShiftPatientCard
                class="game-page__card"
                :activity="activeActivity"
            />
        </div>

        <template v-else>
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
                        <h1 class="game-page__title">Смена {{ shift.number }}. {{ shift.title }}</h1>
                        <p class="game-page__lead">{{ shift.lead }}</p>
                    </div>
                    <ShiftCounters
                        v-if="!isShiftFinished"
                        :counters="counters"
                    />
                    <ShiftFinale
                        v-if="isShiftFinished"
                        :shift="shift"
                        :counters="counters"
                        :next-shift="nextShift"
                        :ending="chapterEnding"
                        @next="startNextShift"
                        @leave="leaveGame"
                    />
                    <template v-else>
                        <ShiftMorning
                            v-if="morningEvents.length"
                            :events="morningEvents"
                        />
                        <p class="game-page__note">Выбери, с чего начать: подсвеченные комнаты ждут тебя.</p>
                        <ClinicPlan
                            :shift="shift.number"
                            :activities="shift.activities"
                            :statuses="activityStatuses"
                            @open="openActivity"
                        />
                    </template>
                </div>
                <ProfessionCard
                    v-if="profession"
                    class="game-page__card"
                    :profession="profession"
                    :percent="playerStore.getPercent(profession.code)"
                    is-patient-sick
                />
            </div>
        </template>
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

        @include column($indent-step * 8);
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
            width: 100%;
            max-width: $card-width;
            justify-self: center;
            rotate: 0deg;
        }
    }

    &__note {
        margin-bottom: -$indent-step * 4;
        color: $color-on-playmat-soft;
        font-size: $font-size-sm;
    }
}
</style>
