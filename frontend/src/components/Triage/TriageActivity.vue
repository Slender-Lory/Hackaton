<script setup>
import {computed, toRef} from 'vue';
import {Cat, Clock3, Dog, Rabbit, HeartPulse, UserRound, UsersRound} from 'lucide-vue-next';
import {TRIAGE_DURATION_MS, TRIAGE_PATIENTS, TRIAGE_SCENARIO_ID} from '@/core/data/triage';
import {useTriage} from '@/composables/useTriage';
import {formatRubles} from '@/core/utils/format';
import UiButton from '@/components/Ui/UiButton.vue';

const props = defineProps({
    state: {type: Object, default: null},
    scenarioId: {type: String, default: TRIAGE_SCENARIO_ID},
    counters: {type: Object, default: () => ({revenue: 0})},
    disabled: {type: Boolean, default: false},
});
const emit = defineEmits(['update:state', 'resolve', 'continue']);
const icons = {dog: Dog, rabbit: Rabbit, cat: Cat};
const {
    state: draft,
    remainingSeconds,
    isResolved,
    canSubmit,
    waitingPatient,
    result,
    assign,
    setWaitingDecision,
    submit,
} = useTriage(toRef(props, 'state'), {
    scenarioId: props.scenarioId,
    onState: (state) => emit('update:state', state),
    onResolve: (resolution, state) => emit('resolve', resolution, state),
});
const countdown = computed(
    () => `${Math.floor(remainingSeconds.value / 60)}:${String(remainingSeconds.value % 60).padStart(2, '0')}`,
);
const waiting = computed(() => TRIAGE_PATIENTS.find((patient) => patient.id === waitingPatient.value));
const statusLabels = {
    stable: 'Помощь оказана · стабилен',
    worse: 'Стало хуже · понадобилась операция',
    referred: 'Ушёл без помощи клиники',
};

function pick(role, patientId) {
    if (!props.disabled) assign(role, patientId);
}
</script>

<template>
    <section
        class="triage"
        aria-labelledby="triage-title"
    >
        <header class="triage__header">
            <div>
                <p class="triage__eyebrow">Приёмная</p>
                <h1
                    id="triage-title"
                    class="triage__title"
                >
                    Трое. Один стол. Минута.
                </h1>
                <p class="triage__lead">
                    Все трое уверены, что их случай важнее. Кого возьмёшь на себя, кого доверишь стажёру Мише, а кто
                    подождёт?
                </p>
            </div>
            <div
                v-if="!isResolved"
                :class="['triage__timer', {'triage__timer--urgent': remainingSeconds <= 15}]"
                role="timer"
                aria-label="Осталось на решение"
            >
                <Clock3
                    :size="22"
                    aria-hidden="true"
                />
                <span>{{ countdown }}</span>
            </div>
            <span
                v-else
                class="triage__complete"
            >
                <HeartPulse
                    :size="20"
                    aria-hidden="true"
                />
                Решение принято
            </span>
        </header>

        <template v-if="!isResolved">
            <progress
                class="triage__timebar"
                :value="remainingSeconds"
                :max="TRIAGE_DURATION_MS / 1000"
                aria-label="Время на решение"
            />
            <p class="triage__rules">
                <UsersRound
                    :size="20"
                    aria-hidden="true"
                />
                Ты и Миша начинаете одновременно. Ожидающий попадёт на стол следующим. Касса:
                {{ formatRubles(counters.revenue) }}.
            </p>
            <div class="triage__patients">
                <article
                    v-for="patient in TRIAGE_PATIENTS"
                    :key="patient.id"
                    :class="['triage__patient', `triage__patient--${patient.id}`]"
                >
                    <div class="triage__patient-top">
                        <component
                            :is="icons[patient.icon]"
                            :size="36"
                            aria-hidden="true"
                        />
                        <span class="triage__urgency">{{ patient.urgency }}</span>
                    </div>
                    <h2 class="triage__patient-name">{{ patient.name }}</h2>
                    <p class="triage__owner">{{ patient.owner }}</p>
                    <p class="triage__symptoms">{{ patient.symptoms }}</p>
                    <details class="triage__hint">
                        <summary>Подсказка по состоянию</summary>
                        <p>{{ patient.hint }}</p>
                    </details>
                    <fieldset
                        class="triage__assignment"
                        :disabled="disabled"
                    >
                        <legend class="triage__legend">Кто принимает: {{ patient.name }}?</legend>
                        <button
                            type="button"
                            :aria-pressed="draft.assignments.doctor === patient.id"
                            @click="pick('doctor', patient.id)"
                        >
                            <UserRound
                                :size="18"
                                aria-hidden="true"
                            />
                            Ко мне
                        </button>
                        <button
                            type="button"
                            :aria-pressed="draft.assignments.assistant === patient.id"
                            @click="pick('assistant', patient.id)"
                        >
                            <UsersRound
                                :size="18"
                                aria-hidden="true"
                            />
                            К Мише
                        </button>
                    </fieldset>
                    <p
                        class="triage__position"
                        aria-live="polite"
                    >
                        {{
                            draft.assignments.doctor === patient.id
                                ? 'Ты принимаешь первым'
                                : draft.assignments.assistant === patient.id
                                  ? 'Миша помогает сразу'
                                  : waitingPatient === patient.id
                                    ? 'Ожидает свободный стол'
                                    : 'Ещё не распределён'
                        }}
                    </p>
                </article>
            </div>

            <div class="triage__queue">
                <h2 class="triage__queue-title">Следующий на стол</h2>
                <template v-if="waiting">
                    <p>
                        <strong>{{ waiting.name }}</strong>
                        {{
                            waiting.id === 'dog'
                                ? 'не может безопасно ждать. Пересмотри распределение.'
                                : 'остаётся после первого пациента — или уходит без помощи.'
                        }}
                    </p>
                    <fieldset
                        v-if="waiting.id !== 'dog'"
                        class="triage__waiting-options"
                        :disabled="disabled"
                    >
                        <legend>Решение для ожидающего пациента</legend>
                        <label>
                            <input
                                type="radio"
                                name="triage-waiting"
                                value="accept"
                                :checked="draft.waitingDecision === 'accept'"
                                @change="setWaitingDecision('accept')"
                            />
                            Оставить в очереди
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="triage-waiting"
                                value="refer"
                                :checked="draft.waitingDecision === 'refer'"
                                @change="setWaitingDecision('refer')"
                            />
                            Не принимать сегодня
                        </label>
                    </fieldset>
                </template>
                <p v-else>Выбери одного пациента себе и одного Мише. Третий займёт очередь.</p>
            </div>

            <footer class="triage__footer">
                <p>
                    После минуты выбранные назначения сохранятся, а свободные места займут те, кто громче спорит. Псу
                    Олега это может стоить здоровья.
                </p>
                <UiButton
                    :disabled="disabled || !canSubmit"
                    @click="submit"
                >
                    Начать помощь
                </UiButton>
            </footer>
        </template>

        <article
            v-else
            class="triage__result"
            aria-labelledby="triage-result-title"
        >
            <p
                v-if="result.flags.timedOut"
                class="triage__timeout"
            >
                Минута истекла. Клиника начала работу с тем распределением, которое успело сложиться.
            </p>
            <h2
                id="triage-result-title"
                class="triage__result-title"
            >
                {{ result.title }}
            </h2>
            <p class="triage__feedback">{{ result.feedback }}</p>
            <ul class="triage__outcomes">
                <li
                    v-for="patient in TRIAGE_PATIENTS"
                    :key="patient.id"
                    :class="{'triage__outcome--lost': result.patientOutcomes[patient.id] === 'worse'}"
                >
                    <component
                        :is="icons[patient.icon]"
                        :size="24"
                        aria-hidden="true"
                    />
                    <span>
                        <strong>{{ patient.name }}</strong>
                        <small>{{ statusLabels[result.patientOutcomes[patient.id]] }}</small>
                    </span>
                </li>
            </ul>
            <dl class="triage__totals">
                <div>
                    <dt>Изменение выручки</dt>
                    <dd>{{ result.effects.revenue > 0 ? '+' : '' }}{{ formatRubles(result.effects.revenue) }}</dd>
                </div>
                <div>
                    <dt>Изменение репутации</dt>
                    <dd>{{ result.effects.reputation > 0 ? '+' : '' }}{{ result.effects.reputation }}</dd>
                </div>
            </dl>
            <details class="triage__breakdown">
                <summary>Почему изменились счётчики?</summary>
                <p>
                    Пёс Олега: 3 000 ₽ расходников за счёт клиники, если ему стало хуже — 12 000 ₽ на операцию. Кролик
                    Жанны: 3 500 ₽. Кот Бориса Аркадьевича: 4 500 ₽, а у главного врача — втрое больше.
                </p>
                <ul>
                    <li
                        v-for="event in result.reputationEvents"
                        :key="event.code"
                    >
                        {{ event.label }}: {{ event.value > 0 ? '+' : '' }}{{ event.value }}
                    </li>
                </ul>
            </details>
            <p class="triage__lesson">
                Приоритет: сбитый пёс — немедленная помощь, кролик — срочная, пожилой кот — плановый приём. Деньги и
                видео важны для клиники, но очередь по срочности защищает тех, кто не может ждать.
            </p>
            <UiButton
                :disabled="disabled"
                @click="emit('continue', result)"
            >
                Продолжить смену
            </UiButton>
        </article>
    </section>
</template>

<style lang="scss">
.triage {
    color: $color-ink;
    @include card-face;
    @include padding('x', 7);
    @include padding('y', 7);

    &__header,
    &__patient-top,
    &__footer,
    &__rules,
    &__timer,
    &__complete {
        display: flex;
        gap: 12px;
    }
    &__header {
        justify-content: space-between;
        align-items: flex-start;
    }
    &__eyebrow {
        color: $color-ink-soft;
        font-size: $font-size-xs;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }
    &__title {
        margin-top: 12px;
        @include display($font-size-xl);
    }
    &__lead {
        margin-top: 12px;
        max-width: 600px;
        line-height: 1.6;
    }
    &__timer {
        flex-shrink: 0;
        align-items: center;
        padding: 12px 16px;
        background: $color-ink;
        color: white;
        border-radius: $radius-button;
        font-size: 26px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
    }
    &__timer--urgent {
        background: $color-danger-text;
    }
    &__complete {
        align-items: center;
        color: $color-ink-soft;
        font-size: $font-size-sm;
    }
    &__timebar {
        width: 100%;
        height: 6px;
        margin: 24px 0 16px;
        border: 0;
        border-radius: 99px;
        accent-color: $color-profession-vet;
    }
    &__rules {
        align-items: center;
        font-size: $font-size-sm;
        line-height: 1.5;
        color: $color-ink-soft;
    }
    &__rules svg {
        flex-shrink: 0;
    }
    &__patients {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        margin-top: 24px;
    }
    &__patient {
        display: flex;
        flex-direction: column;
        min-width: 0;
        padding: 20px;
        border: 2px solid $color-card-text-box;
        border-radius: $radius-card;
        background: $color-white;
    }
    &__patient--dog {
        border-top: 5px solid $color-danger;
    }
    &__patient--rabbit {
        border-top: 5px solid $color-action;
    }
    &__patient--cat {
        border-top: 5px solid $color-profession-vet;
    }
    &__patient-top {
        justify-content: space-between;
        align-items: center;
    }
    &__urgency {
        padding: 6px 8px;
        background: $color-card-text-box;
        border-radius: $radius-chip;
        font-size: 11px;
        font-weight: 700;
    }
    &__patient-name {
        margin-top: 20px;
        font-size: $font-size-lg;
        font-weight: 700;
    }
    &__owner {
        color: $color-ink-soft;
        font-size: $font-size-xs;
        margin-top: 6px;
    }
    &__symptoms {
        margin: 16px 0;
        font-size: $font-size-sm;
        line-height: 1.6;
    }
    &__hint {
        font-size: $font-size-xs;
        color: $color-ink-soft;
        margin-bottom: 20px;
    }
    &__hint summary,
    &__breakdown summary {
        cursor: pointer;
        min-height: 32px;
    }
    &__hint p {
        line-height: 1.6;
        padding-top: 8px;
    }
    &__assignment {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: auto;
        border: 0;
        padding: 0;
        min-width: 0;
    }
    &__legend {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
    }
    &__assignment button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 48px;
        border: 2px solid $color-card-text-box;
        border-radius: $radius-card-inner;
        background: $color-card-face;
        color: $color-ink;
        cursor: pointer;
        font: inherit;
        font-size: $font-size-xs;
        font-weight: 600;
    }
    &__assignment button[aria-pressed='true'] {
        background: $color-action;
        border-color: $color-action-deep;
    }
    &__assignment button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }
    &__assignment button:focus-visible,
    &__waiting-options input:focus-visible,
    summary:focus-visible {
        outline: 3px solid $color-playmat;
        outline-offset: 3px;
    }
    &__position {
        min-height: 32px;
        margin-top: 12px;
        font-size: 12px;
        line-height: 1.4;
        font-weight: 600;
        color: $color-ink-soft;
    }
    &__queue {
        margin-top: 20px;
        padding: 20px;
        background: $color-card-text-box;
        border-radius: $radius-card-inner;
        line-height: 1.6;
    }
    &__queue-title {
        margin-bottom: 8px;
        font-weight: 700;
    }
    &__waiting-options {
        display: flex;
        gap: 12px 24px;
        flex-wrap: wrap;
        padding: 0;
        border: 0;
        margin-top: 16px;
        font-size: $font-size-sm;
    }
    &__waiting-options legend {
        font-size: $font-size-xs;
        color: $color-ink-soft;
        margin-bottom: 8px;
    }
    &__waiting-options label {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 44px;
        cursor: pointer;
    }
    &__waiting-options input {
        accent-color: $color-playmat;
        width: 18px;
        height: 18px;
    }
    &__footer {
        justify-content: space-between;
        align-items: center;
        margin-top: 24px;
    }
    &__footer p {
        max-width: 480px;
        font-size: $font-size-xs;
        line-height: 1.6;
        color: $color-ink-soft;
    }
    &__footer button {
        flex-shrink: 0;
    }
    &__result {
        margin-top: 28px;
    }
    &__result-title {
        @include display($font-size-xl);
    }
    &__feedback,
    &__lesson,
    &__timeout {
        margin: 16px 0;
        line-height: 1.7;
    }
    &__timeout {
        padding: 12px 16px;
        background: $color-action-light;
        border-radius: $radius-card-inner;
    }
    &__outcomes {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        list-style: none;
        padding: 0;
        margin: 24px 0;
    }
    &__outcomes li {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding: 16px;
        background: $color-card-text-box;
        border-radius: $radius-card-inner;
    }
    &__outcomes svg {
        flex-shrink: 0;
    }
    &__outcomes strong,
    &__outcomes small {
        display: block;
    }
    &__outcomes small {
        margin-top: 8px;
        line-height: 1.5;
    }
    &__outcome--lost {
        color: $color-danger-text;
    }
    &__totals {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
        margin: 24px 0;
    }
    &__totals dt {
        font-size: $font-size-sm;
        color: $color-ink-soft;
    }
    &__totals dd {
        margin: 8px 0 0;
        font-size: $font-size-xl;
        font-weight: 700;
    }
    &__breakdown {
        line-height: 1.7;
        font-size: $font-size-sm;
    }
    &__breakdown ul {
        margin: 12px 0;
        padding-left: 20px;
    }
    &__lesson {
        font-size: $font-size-sm;
        color: $color-ink-soft;
    }

    @include tablet {
        @include padding('x', 5);
        &__patients,
        &__outcomes {
            grid-template-columns: 1fr;
        }
        &__patient {
            padding: 20px;
        }
        &__symptoms {
            margin: 12px 0;
        }
        &__header,
        &__footer {
            flex-wrap: wrap;
        }
        &__footer button {
            width: 100%;
        }
    }
    @include mobile {
        @include padding('x', 4);
        &__title {
            font-size: 22px;
        }
        &__timer {
            font-size: 22px;
            padding: 10px 14px;
        }
    }
}
</style>
