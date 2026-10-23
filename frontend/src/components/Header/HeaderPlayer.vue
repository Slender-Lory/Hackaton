<script setup>
defineProps({
    nickname: {type: String, required: true},
});
</script>

<template>
    <span
        class="header-player"
        :title="nickname"
    >
        <span
            class="header-player__icon"
            aria-hidden="true"
        >
            🩺
        </span>
        {{ nickname }}
    </span>
</template>
