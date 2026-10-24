<script setup>
import {ref, watch} from 'vue';
import {safeStorage} from '@/core/helpers/safeStorage';
import {applyEffects} from '@/core/utils/shift';
import {isTriageState} from '@/core/utils/triage';
import TriageActivity from './TriageActivity.vue';

const STORAGE_KEY = 'hackat.triage-preview.v1';
const startingCounters = {revenue: 3000, reputation: 50, pigHealth: 60};
let saved = null;
try {
    const parsed = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (
        isTriageState(parsed?.state) &&
        Object.keys(startingCounters).every((key) => Number.isFinite(parsed.counters?.[key]))
    )
        saved = parsed;
} catch {
    saved = null;
}
const state = ref(saved?.state ?? null);
const counters = ref(saved?.counters ?? {...startingCounters});
const appliedScenarioIds = ref(saved?.appliedScenarioIds ?? []);
const run = ref(0);
const continued = ref(false);

function persist() {
    safeStorage.set(
        STORAGE_KEY,
        JSON.stringify({state: state.value, counters: counters.value, appliedScenarioIds: appliedScenarioIds.value}),
    );
}

function updateState(nextState) {
    state.value = nextState;
    persist();
}

function resolve(result, resolvedState) {
    if (!appliedScenarioIds.value.includes(result.scenarioId)) {
        counters.value = applyEffects(counters.value, result.effects);
        appliedScenarioIds.value = [...appliedScenarioIds.value, result.scenarioId];
    }
    state.value = resolvedState;
    persist();
}

function restart() {
    state.value = null;
    counters.value = {...startingCounters};
    appliedScenarioIds.value = [];
    continued.value = false;
    run.value += 1;
    persist();
}

watch(continued, persist);
</script>

<template>
    <main class="triage-preview">
        <nav
            class="triage-preview__nav"
            aria-label="Проверка модуля"
        >
            <a href="/">← К игре</a>
            <span>Тестовая приёмная · не влияет на игровой профиль</span>
            <button
                type="button"
                @click="restart"
            >
                Новый прогон
            </button>
        </nav>
        <TriageActivity
            :key="run"
            :state="state"
            :counters="counters"
            @update:state="updateState"
            @resolve="resolve"
            @continue="continued = true"
        />
        <p
            v-if="continued"
            class="triage-preview__notice"
            role="status"
        >
            Модуль завершён. В игре это событие передаёт управление следующей сцене второго дня.
        </p>
        <p class="triage-preview__note">
            Учебная игровая ситуация, не инструкция по лечению животных. Таймер и решения сохраняются при обновлении
            страницы.
        </p>
    </main>
</template>

<style lang="scss">
.triage-preview {
    max-width: 1180px;
    margin: 0 auto;
    padding: 24px;
    &__nav {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 24px;
        font-size: $font-size-xs;
    }
    &__nav a {
        color: $color-on-playmat;
        text-decoration: none;
    }
    &__nav button {
        border: 1px solid $color-on-playmat-soft;
        border-radius: $radius-chip;
        color: $color-white;
        background: transparent;
        padding: 10px 16px;
        min-height: 44px;
    }
    &__nav span {
        color: $color-on-playmat-soft;
    }
    &__note,
    &__notice {
        margin-top: 20px;
        font-size: $font-size-xs;
        line-height: 1.6;
        color: $color-on-playmat-soft;
    }
    &__notice {
        color: $color-action;
    }
    @include mobile {
        padding: 12px;
    }
}
</style>
