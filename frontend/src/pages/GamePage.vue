<script setup>
import {storeToRefs} from 'pinia';
import {computed, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {ArrowLeft, RotateCcw} from 'lucide-vue-next';
import {ROUTE_NAMES} from '@/core/constants';
import {professions} from '@/core/data/professions';
import {usePlayerStore} from '@/core/stores/player';
import {useToastStore} from '@/core/stores/toast';
import {useShift} from '@/composables/useShift';

import ClinicPlan from '@/components/Clinic/ClinicPlan.vue';
import PatientPassport from '@/components/Patients/PatientPassport.vue';
import ProfessionCard from '@/components/Professions/ProfessionCard.vue';
import ResetProgressForm from '@/components/Forms/ResetProgressForm.vue';
import ShiftActivity from '@/components/Shift/ShiftActivity.vue';
import ShiftCounters from '@/components/Shift/ShiftCounters.vue';
import ShiftDifficulty from '@/components/Shift/ShiftDifficulty.vue';
import ShiftFinale from '@/components/Shift/ShiftFinale.vue';
import ShiftMorning from '@/components/Shift/ShiftMorning.vue';
import ShiftPatientCard from '@/components/Shift/ShiftPatientCard.vue';
import TriageActivity from '@/components/Triage/TriageActivity.vue';

const PLAN_NOTE = 'Выбери, с чего начать: подсвеченные комнаты ждут тебя.';

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();
const toastStore = useToastStore();
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
    hasProgress,
    needsDifficulty,
    shiftHint,
    openRoomCodes,
    activeChart,
    openActivity,
    closeActivity,
    getAnswers,
    answerStep,
    saveTriage,
    resolveTriage,
    startNextShift,
    chooseDifficulty,
    restart,
} = useShift(professionCode);

const isResetFormOpen = ref(false);
const isPassportOpen = ref(false);

const profession = computed(() => professions.find((item) => item.code === professionCode.value));

watch([isRestored, state], leaveIfCannotPlay, {immediate: true});

watch([activeActivity, () => shift.value?.number], () => {
    isPassportOpen.value = false;
    window.scrollTo({top: 0});
});

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

function handleReset() {
    isResetFormOpen.value = false;
    restart();
    toastStore.show('Прогресс сброшен: глава начинается с первой смены');
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
            <TriageActivity
                v-if="activeActivity.kind === 'triage'"
                :key="activeActivity.code"
                :state="getAnswers(activeActivity.code).triage ?? null"
                :scenario-id="`vet-shift-${shift.number}-${activeActivity.code}`"
                :counters="counters"
                @update:state="saveTriage"
                @resolve="resolveTriage"
                @continue="closeActivity"
            />
            <ShiftActivity
                v-else
                :key="activeActivity.code"
                :activity="activeActivity"
                :state="state"
                @answer="answerStep"
                @close="closeActivity"
                @passport="isPassportOpen = true"
            >
                <template #counters>
                    <ShiftCounters :counters="counters" />
                </template>
            </ShiftActivity>
            <ShiftPatientCard
                v-if="activeActivity.kind !== 'triage'"
                class="game-page__card"
                :activity="activeActivity"
                @passport="isPassportOpen = true"
            />
        </div>

        <template v-else>
            <div class="game-page__top">
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
                <button
                    v-if="hasProgress"
                    class="game-page__back"
                    type="button"
                    @click="isResetFormOpen = true"
                >
                    <RotateCcw
                        :size="16"
                        aria-hidden="true"
                    />
                    Начать заново
                </button>
            </div>

            <div class="game-page__table">
                <div class="game-page__main">
                    <div class="game-page__intro">
                        <h1 class="game-page__title">Смена {{ shift.number }}. {{ shift.title }}</h1>
                        <p class="game-page__lead">{{ shift.lead }}</p>
                    </div>
                    <ShiftDifficulty
                        v-if="needsDifficulty"
                        @choose="chooseDifficulty"
                    />
                    <ShiftFinale
                        v-else-if="isShiftFinished"
                        :shift="shift"
                        :counters="counters"
                        :next-shift="nextShift"
                        :ending="chapterEnding"
                        @next="startNextShift"
                        @restart="isResetFormOpen = true"
                        @leave="leaveGame"
                    />
                    <template v-else>
                        <ShiftCounters :counters="counters" />
                        <ShiftMorning
                            v-if="morningEvents.length"
                            :events="morningEvents"
                        />
                        <p class="game-page__note">{{ shiftHint ?? PLAN_NOTE }}</p>
                        <ClinicPlan
                            :open-room-codes="openRoomCodes"
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

        <PatientPassport
            v-if="isPassportOpen && activeActivity"
            :patient="activeActivity.patient"
            :chart="activeChart"
            @close="isPassportOpen = false"
        />
        <ResetProgressForm
            v-if="isResetFormOpen && profession"
            :profession="profession"
            @close="isResetFormOpen = false"
            @reset="handleReset"
        />
    </div>
</template>

<style lang="scss">
$card-width: 320px;

.game-page {
    @include padding('y', 6);
    @include padding('bottom', 16);

    &__top {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: $indent-step * 3;
    }

    &__back {
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        text-decoration: none;
        color: $color-on-playmat-soft;
        font-size: $font-size-md;
        font-weight: $font-weight-semibold;
        gap: $indent-step * 2;

        @include button-reset;

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
