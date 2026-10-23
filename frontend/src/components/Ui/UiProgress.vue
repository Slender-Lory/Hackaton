<script setup>
// Полоска прогресса 0–100 с подписью внутри. Цвет — из --accent родителя.
defineProps({
    value: {type: Number, required: true},
});
</script>

<template>
    <div
        class="ui-progress"
        role="progressbar"
        :aria-valuenow="value"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="`Пройдено ${value}%`"
    >
        <div
            class="ui-progress__fill"
            :style="{width: `${value}%`}"
        />
        <span class="ui-progress__label">{{ value }}%</span>
    </div>
</template>

<style lang="scss">
.ui-progress {
    position: relative;
    overflow: hidden;
    width: min(280px, 100%);
    height: 22px;
    margin: 0 auto;
    border-radius: $radius-pill;
    background: accent-tint(14%);

    &__fill {
        height: 100%;
        transition: width $duration-slow ease;
        border-radius: inherit;
        background: $color-accent;
    }

    &__label {
        position: absolute;
        inset: 0;
        font-size: $font-size-xs;
        font-weight: $font-weight-extra-bold;

        @include flex-center;
    }
}
</style>
