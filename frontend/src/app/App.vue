<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { getHealth } from "../shared/api/client";

const status = ref<string | null>(null);
const error = ref<string | null>(null);

let cancelled = false;

onMounted(() => {
  getHealth()
    .then((data) => {
      if (!cancelled) status.value = data.status;
    })
    .catch((err: unknown) => {
      if (!cancelled) {
        error.value = err instanceof Error ? err.message : String(err);
      }
    });
});

onUnmounted(() => {
  cancelled = true;
});
</script>

<template>
  <main>
    <h1>hackat</h1>
    <p>API status: {{ status ?? (error ? `error: ${error}` : "loading…") }}</p>
  </main>
</template>
