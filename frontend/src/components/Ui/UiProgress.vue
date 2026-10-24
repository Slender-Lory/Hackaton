<script setup>
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
        <span class="ui-progress__track">
            <span
                class="ui-progress__fill"
                :style="{width: `${value}%`}"
            />
        </span>
        <span class="ui-progress__value">{{ value }}%</span>
    </div>
</template>

<style lang="scss">
.ui-progress {
    display: flex;
    align-items: center;
    gap: $indent-step * 2;

    &__track {
        overflow: hidden;
        flex: 1;
        height: 8px;
        border-radius: $radius-chip;
        background-color: $color-card-text-box;
    }

    &__fill {
        display: block;
        height: 100%;
        transition: width $duration-slow $ease-out;
        border-radius: inherit;
        background-color: $color-accent;
    }

    &__value {
        color: $color-ink;
        font-size: $font-size-xs;
        font-weight: $font-weight-bold;
    }
}
</style>
