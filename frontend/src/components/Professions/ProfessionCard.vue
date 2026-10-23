<script setup>
import {computed, ref} from 'vue';

import UiButton from '@/components/Ui/UiButton.vue';
import UiProgress from '@/components/Ui/UiProgress.vue';

const props = defineProps({
    /** @type {import('vue').PropType<import('@/core/types/profession').Profession>} */
    profession: {type: Object, required: true},
    // Процент прохождения; null — профессия не начата
    percent: {type: Number, default: null},
    // Порядковый номер — для поочерёдного появления карточек
    order: {type: Number, default: 0},
});

const emit = defineEmits(['play', 'locked']);

const isShaking = ref(false);

const isStarted = computed(() => props.percent !== null);
const cardStyle = computed(() => ({
    '--accent': `var(--profession-${props.profession.code})`,
    '--order': props.order,
}));

function handleLockedClick() {
    isShaking.value = false;
    // Перезапуск покачивания при повторном клике
    requestAnimationFrame(() => {
        isShaking.value = true;
    });
    emit('locked');
}
</script>

<template>
    <article
        :class="[
            'profession-card',
            {
                'profession-card--main': profession.isAvailable,
                'profession-card--locked': !profession.isAvailable,
                'profession-card--shaking': isShaking,
            },
        ]"
        :style="cardStyle"
        @animationend="isShaking = false"
    >
        <div
            class="profession-card__icon"
            aria-hidden="true"
        >
            <span class="profession-card__emoji">{{ profession.icon }}</span>
        </div>

        <div class="profession-card__body">
            <h2 class="profession-card__title">{{ profession.title }}</h2>
            <p class="profession-card__tagline">{{ profession.tagline }}</p>
            <UiProgress
                v-if="profession.isAvailable && isStarted"
                class="profession-card__progress"
                :value="percent"
            />
        </div>

        <UiButton
            v-if="profession.isAvailable"
            large
            pulse
            @click="emit('play')"
        >
            <span aria-hidden="true">▶</span>
            {{ isStarted ? 'Продолжить' : 'Играть' }}
        </UiButton>
        <UiButton
            v-else
            theme="ghost"
            :aria-label="`${profession.title}: скоро`"
            @click="handleLockedClick"
        >
            <span aria-hidden="true">🔒</span>
            Скоро
        </UiButton>
    </article>
</template>

<style lang="scss">
$icon-size: 84px;
$icon-size-main: 120px;

.profession-card {
    $block: &;

    text-align: center;
    transition:
        transform $duration $ease-back-out,
        box-shadow $duration ease;

    @include surface;
    @include column;
    @include appear(pop-in, 0.55s, var(--order));
    @include padding('y', 5);
    @include padding('x', 4);

    @include hover {
        transform: translateY(-6px);
        box-shadow: $shadow-lg;
    }

    &__icon {
        width: $icon-size;
        border-radius: 50%;
        background: accent-tint(22%);
        font-size: 44px;
        line-height: 1;
        aspect-ratio: 1;

        @include flex-center;
    }

    &__emoji {
        animation: bob 3s ease-in-out infinite;
        animation-delay: calc(var(--order) * -0.6s);
    }

    &__body {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: $indent-step;
    }

    &__title {
        font-size: $font-size-xl;
        font-weight: $font-weight-extra-bold;
    }

    &__tagline {
        color: $color-text-secondary;
        font-size: $font-size-sm;
    }

    &__progress {
        @include margin('top', 2);
    }

    &--main {
        border: 3px solid accent-tint(45%);
        background: radial-gradient(circle at 20% 0%, accent-tint(16%), transparent 60%), $color-surface;

        @include padding('y', 7);
        @include padding('x', 6);

        #{$block}__icon {
            width: $icon-size-main;
            box-shadow: 0 0 0 10px accent-fade(10%);
            font-size: 64px;
        }

        #{$block}__title {
            color: accent-shade();
            font-size: clamp(28px, 5vw, 36px);
        }

        #{$block}__tagline {
            font-size: $font-size-lg;
        }
    }

    &--locked {
        background: $color-surface-muted;

        #{$block}__icon {
            filter: saturate(0.55);
        }

        #{$block}__title,
        #{$block}__tagline {
            opacity: 0.75;
        }
    }

    &--shaking {
        animation: shake 0.45s ease both;
    }
}
</style>
