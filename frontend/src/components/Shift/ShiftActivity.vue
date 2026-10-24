<script setup>
import {computed, ref, watch} from 'vue';
import {ArrowLeft, ArrowRight, IdCard, Lightbulb, LogOut} from 'lucide-vue-next';
import {STORY_ANSWER} from '@/core/constants';
import {getHint, getLockedOptions, getOpenStepIndex, getStepResult, getStoryVariant} from '@/core/utils/shift';

import ShiftChecklist from '@/components/Shift/ShiftChecklist.vue';
import ShiftChoice from '@/components/Shift/ShiftChoice.vue';
import ShiftEffects from '@/components/Shift/ShiftEffects.vue';
import ShiftExam from '@/components/Shift/ShiftExam.vue';
import ShiftScene from '@/components/Shift/ShiftScene.vue';
import UiButton from '@/components/Ui/UiButton.vue';

const props = defineProps({
    /** @type {import('vue').PropType<import('@/core/types/shift').ShiftActivity>} */
    activity: {type: Object, required: true},
    /** @type {import('vue').PropType<import('@/core/types/shift').ShiftState>} */
    state: {type: Object, required: true},
});

const emit = defineEmits(['answer', 'close', 'passport']);

const stepIndex = ref(getOpenStepIndex(props.activity.steps, props.state.answers[props.activity.code] ?? {}));
const isHintShown = ref(false);

const answers = computed(() => props.state.answers[props.activity.code] ?? {});
const revenue = computed(() => props.state.counters.revenue);
const step = computed(() => props.activity.steps[stepIndex.value]);
const answer = computed(() => answers.value[step.value.id] ?? null);
const isAnswered = computed(() => answer.value !== null);
const isStory = computed(() => step.value.kind === 'story');
const isLastStep = computed(() => stepIndex.value === props.activity.steps.length - 1);
const isNextShown = computed(() => isStory.value || isAnswered.value);
const result = computed(() => (isAnswered.value && !isStory.value ? getStepResult(step.value, answer.value) : null));
const hasResult = computed(() => Boolean(result.value?.feedback || Object.keys(result.value?.effects ?? {}).length));
const hint = computed(() => getHint(step.value.hints, props.state.difficulty));
const variant = computed(() => (isStory.value ? getStoryVariant(step.value, props.state, answer.value) : null));
const view = computed(() => ({
    title: variant.value?.title ?? step.value.title,
    text: variant.value?.text ?? step.value.text,
    speaker: variant.value?.speaker ?? step.value.speaker ?? null,
    effects: variant.value ? variant.value.effects : step.value.effects,
}));
const lockedOptions = computed(() =>
    step.value.kind === 'choice' && !isAnswered.value ? getLockedOptions(step.value.options, props.state) : {},
);

watch(stepIndex, () => {
    isHintShown.value = false;
});

/** @param {import('@/core/types/shift').StepAnswer} value */
function handleAnswer(value) {
    emit('answer', step.value, value);
}

function handleNext() {
    if (isStory.value && !isAnswered.value) {
        handleAnswer(variant.value?.id ?? STORY_ANSWER);
    }

    if (isLastStep.value) {
        emit('close');

        return;
    }

    stepIndex.value += 1;
}

function handleHintToggle() {
    isHintShown.value = !isHintShown.value;
}
</script>

<template>
    <section
        class="shift-activity"
        aria-labelledby="shift-activity-title"
    >
        <header class="shift-activity__head">
            <div class="shift-activity__nav">
                <button
                    class="shift-activity__back"
                    type="button"
                    @click="emit('close')"
                >
                    <ArrowLeft
                        :size="18"
                        aria-hidden="true"
                    />
                    К плану клиники
                </button>
                <button
                    class="shift-activity__passport"
                    type="button"
                    @click="emit('passport')"
                >
                    <IdCard
                        :size="18"
                        aria-hidden="true"
                    />
                    Паспорт: {{ activity.patient.name }}
                </button>
            </div>
            <h1
                id="shift-activity-title"
                class="shift-activity__title"
            >
                {{ activity.title }}
            </h1>
            <p class="shift-activity__place">{{ activity.place }}</p>
        </header>

        <ol
            class="shift-activity__progress"
            :aria-label="`Шаг ${stepIndex + 1} из ${activity.steps.length}`"
        >
            <li
                v-for="(item, index) in activity.steps"
                :key="item.id"
                :class="['shift-activity__dot', {'shift-activity__dot--done': index <= stepIndex}]"
            />
        </ol>

        <slot name="counters" />

        <Transition
            name="shift-step"
            mode="out-in"
        >
            <article
                :key="step.id"
                class="shift-activity__step"
            >
                <ShiftScene :room-code="activity.roomCode" />
                <h2 class="shift-activity__step-title">{{ view.title }}</h2>
                <p
                    v-if="view.speaker"
                    class="shift-activity__speaker"
                >
                    <span
                        class="shift-activity__avatar"
                        aria-hidden="true"
                    >
                        {{ view.speaker.name.charAt(0) }}
                    </span>
                    <span>
                        <span class="shift-activity__speaker-name">{{ view.speaker.name }}</span>
                        <span class="shift-activity__speaker-role">{{ view.speaker.role }}</span>
                    </span>
                </p>
                <p :class="['shift-activity__text', {'shift-activity__text--speech': view.speaker}]">{{ view.text }}</p>

                <div
                    v-if="hint && !isAnswered"
                    class="shift-activity__hint"
                >
                    <button
                        class="shift-activity__hint-toggle"
                        type="button"
                        :aria-expanded="isHintShown"
                        @click="handleHintToggle"
                    >
                        <Lightbulb
                            :size="16"
                            aria-hidden="true"
                        />
                        {{ isHintShown ? 'Скрыть подсказку' : 'Подсказка' }}
                    </button>
                    <p
                        v-if="isHintShown"
                        class="shift-activity__hint-text"
                    >
                        {{ hint }}
                    </p>
                </div>

                <ShiftChoice
                    v-if="step.kind === 'choice'"
                    :step="step"
                    :answer="answer"
                    :revenue="revenue"
                    :locked-options="lockedOptions"
                    @answer="handleAnswer"
                />
                <ShiftExam
                    v-else-if="step.kind === 'exam'"
                    :step="step"
                    :answer="answer"
                    @answer="handleAnswer"
                />
                <ShiftChecklist
                    v-else-if="step.kind === 'checklist'"
                    :step="step"
                    :answer="answer"
                    :revenue="revenue"
                    @answer="handleAnswer"
                />
                <ShiftEffects
                    v-else-if="view.effects"
                    :effects="view.effects"
                />

                <div
                    v-if="hasResult"
                    class="shift-activity__feedback"
                    aria-live="polite"
                >
                    <p v-if="result.feedback">{{ result.feedback }}</p>
                    <ShiftEffects :effects="result.effects" />
                </div>

                <footer
                    v-if="isNextShown"
                    class="shift-activity__footer"
                >
                    <UiButton @click="handleNext">
                        <template v-if="isLastStep">
                            <LogOut
                                :size="20"
                                aria-hidden="true"
                            />
                            Вернуться в клинику
                        </template>
                        <template v-else>
                            Дальше
                            <ArrowRight
                                :size="20"
                                aria-hidden="true"
                            />
                        </template>
                    </UiButton>
                </footer>
            </article>
        </Transition>
    </section>
</template>

<style lang="scss">
.shift-activity {
    min-width: 0;

    @include column($indent-step * 5);

    &__head {
        align-items: flex-start;

        @include column($indent-step * 2);
    }

    &__nav {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: space-between;
        width: 100%;
        gap: $indent-step * 3;

        @include margin('bottom', 2);
    }

    &__passport {
        cursor: pointer;

        @include button-reset;
        @include chip($color-action);

        font-size: $font-size-sm;

        @include padding('y', 2);
        @include padding('x', 4);

        @include hover {
            background-color: $color-action-light;
        }
    }

    &__back {
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        color: $color-on-playmat-soft;
        font-size: $font-size-md;
        font-weight: $font-weight-semibold;
        gap: $indent-step * 2;

        @include button-reset;

        @include hover {
            color: $color-on-playmat;
        }
    }

    &__title {
        @include display(clamp(32px, 5vw, 56px));
    }

    &__place {
        color: $color-on-playmat-soft;
        font-size: $font-size-lg;
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

        &--done {
            background-color: $color-action;
        }
    }

    &__step {
        color: $color-ink;

        @include card-face;
        @include column($indent-step * 4);
        @include padding('y', 6);
        @include padding('x', 6);

        @include mobile {
            @include padding('y', 5);
            @include padding('x', 4);
        }
    }

    &__step-title {
        @include display($font-size-xl);
    }

    &__speaker {
        display: flex;
        align-items: center;
        gap: $indent-step * 3;
    }

    &__avatar {
        flex-shrink: 0;
        width: $indent-step * 10;
        height: $indent-step * 10;
        color: $color-white;
        border-radius: $radius-chip;
        background-color: $color-accent;
        font-weight: $font-weight-bold;

        @include flex-center;
    }

    &__speaker-name {
        display: block;
        font-weight: $font-weight-bold;
    }

    &__speaker-role {
        display: block;
        color: $color-ink-soft;
        font-size: $font-size-xs;
    }

    &__text--speech {
        border-radius: $radius-card-inner;
        background-color: $color-card-text-box;

        @include padding('y', 3);
        @include padding('x', 4);
    }

    &__text {
        max-width: 60ch;
        font-size: $font-size-md;
        line-height: 1.5;
    }

    &__hint {
        align-items: flex-start;

        @include column($indent-step * 2);
    }

    &__hint-toggle {
        cursor: pointer;

        @include button-reset;
        @include chip($color-card-text-box, $color-ink-soft);

        @include hover {
            color: $color-ink;
        }
    }

    &__hint-text {
        color: $color-ink-soft;
        font-size: $font-size-sm;
        border-left: 3px solid $color-action;

        @include padding('left', 3);
    }

    &__feedback {
        border-radius: $radius-card-inner;
        background-color: $color-card-text-box;
        font-weight: $font-weight-medium;
        line-height: 1.5;

        @include column($indent-step * 3);
        @include padding('y', 4);
        @include padding('x', 4);
    }

    &__footer {
        display: flex;
        justify-content: flex-end;
    }
}

.shift-step-enter-active,
.shift-step-leave-active {
    transition:
        opacity $duration $ease-out,
        transform $duration $ease-out;
}

.shift-step-enter-from {
    transform: translateX($indent-step * 6);
    opacity: 0;
}

.shift-step-leave-to {
    transform: translateX(-$indent-step * 6);
    opacity: 0;
}
</style>
