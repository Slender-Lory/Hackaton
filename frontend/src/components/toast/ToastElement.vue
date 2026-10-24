<script setup>
import {onBeforeUnmount} from 'vue';
import {Clock} from 'lucide-vue-next';

const props = defineProps({
    id: {type: Number, required: true},
    message: {type: String, required: true},
    timeout: {type: Number, default: 2200},
});

const emit = defineEmits(['close']);

const timer = setTimeout(() => emit('close', props.id), props.timeout);

onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
    <p
        class="toast"
        role="status"
    >
        <Clock
            class="toast__icon"
            :size="18"
            aria-hidden="true"
        />
        {{ message }}
    </p>
</template>
