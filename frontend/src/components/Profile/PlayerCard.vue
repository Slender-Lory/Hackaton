<script setup>
import {computed} from 'vue';
import {Mail, MonitorSmartphone} from 'lucide-vue-next';

const props = defineProps({
    nickname: {type: String, required: true},
    email: {type: String, default: null},
    since: {type: String, default: null},
});

const initial = computed(() => props.nickname.trim().charAt(0).toUpperCase());
const sinceLabel = computed(() =>
    props.since
        ? new Date(props.since).toLocaleDateString('ru-RU', {day: 'numeric', month: 'long', year: 'numeric'})
        : null,
);
</script>

<template>
    <article class="player-card">
        <span
            class="player-card__avatar"
            aria-hidden="true"
        >
            {{ initial }}
        </span>
        <h1 class="player-card__name">{{ nickname }}</h1>
        <p class="player-card__status">
            <template v-if="email">
                <Mail
                    :size="16"
                    aria-hidden="true"
                />
                {{ email }}
            </template>
            <template v-else>
                <MonitorSmartphone
                    :size="16"
                    aria-hidden="true"
                />
                Гость: прогресс в этом браузере
            </template>
        </p>
        <p
            v-if="sinceLabel"
            class="player-card__since"
        >
            В клинике с {{ sinceLabel }}
        </p>
    </article>
</template>

<style lang="scss">
$avatar-size: 96px;

.player-card {
    align-items: center;
    text-align: center;
    color: $color-ink;

    @include card-face;
    @include column($indent-step * 3);
    @include padding('y', 8);
    @include padding('x', 6);

    &__avatar {
        width: $avatar-size;
        height: $avatar-size;
        border-radius: 50%;
        background-color: $color-action;
        box-shadow: 0 0 0 6px $color-card-text-box;

        @include flex-center;
        @include display($font-size-xl * 1.5);
    }

    &__name {
        overflow-wrap: anywhere;

        @include display($font-size-xl);
    }

    &__status {
        @include chip;
    }

    &__since {
        color: $color-ink-soft;
        font-size: $font-size-sm;
    }
}
</style>
