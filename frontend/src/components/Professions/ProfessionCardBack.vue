<script setup>
import {computed, ref} from 'vue';
import {Lock} from 'lucide-vue-next';

const props = defineProps({
    /** @type {import('vue').PropType<import('@/core/types/profession').Profession>} */
    profession: {type: Object, required: true},
    tilt: {type: Number, default: 0},
});

const emit = defineEmits(['locked']);

const isHopping = ref(false);

const cardStyle = computed(() => ({
    '--accent': `var(--profession-${props.profession.code})`,
    '--tilt': `${props.tilt}deg`,
}));

function handleClick() {
    isHopping.value = false;
    requestAnimationFrame(() => {
        isHopping.value = true;
    });
    emit('locked');
}
</script>

<template>
    <button
        type="button"
        :class="['profession-card-back', {'profession-card-back--hopping': isHopping}]"
        :style="cardStyle"
        :aria-label="`${profession.title}: карта ещё закрыта`"
        @click="handleClick"
        @animationend="isHopping = false"
    >
        <span class="profession-card-back__face">
            <Lock
                class="profession-card-back__lock"
                :size="28"
                aria-hidden="true"
            />
            <span class="profession-card-back__title">{{ profession.title }}</span>
            <span class="profession-card-back__soon">Скоро</span>
        </span>
    </button>
</template>

<style lang="scss">
.profession-card-back {
    $block: &;

    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
    transition: transform $duration $ease-out;
    transform: rotate(var(--tilt));
    text-align: center;
    gap: $indent-step * 2;

    @include button-reset;

    &__face {
        position: relative;
        width: 100%;
        transition: box-shadow $duration ease;
        aspect-ratio: 5 / 7;

        @include card-back;
        @include flex-center;
    }

    &__lock {
        color: $color-white;
        border: 2px solid rgba($color-white, 50%);
        border-radius: 50%;
        background-color: rgba($color-white, 12%);
        box-sizing: content-box;

        @include padding('y', 3);
        @include padding('x', 3);
    }

    &__title {
        position: absolute;
        right: $indent-step * 2;
        bottom: $indent-step * 3;
        left: $indent-step * 2;
        color: $color-white;
        font-size: $font-size-sm;
        font-weight: $font-weight-bold;
        line-height: 1.2;
        text-wrap: balance;
    }

    &__soon {
        position: absolute;
        top: $indent-step * 3;
        right: $indent-step * 3;

        @include chip($color-action, $color-ink);
    }

    @include hover {
        transform: rotate(var(--tilt)) translateY(-10px);

        #{$block}__face {
            box-shadow:
                0 0 0 3px $color-accent,
                $shadow-card-lifted;
        }
    }

    &--hopping {
        animation: card-hop 0.5s $ease-out;
    }
}
</style>
