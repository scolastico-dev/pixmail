<template>
  <div class="my-2 bg-black/10 p-2">
    <div class="grid grid-cols-[1fr_auto]">
      <p>{{ data.id }}</p>
      <p>{{ new Date(data.timestamp*1000).toLocaleString() }}</p>
    </div>
    <p v-if="data.pixel && data.label" class="text-xs">
      <span class="font-bold">{{ data.label }}</span>
      <span class="font-normal">&nbsp;({{ data.pixel }})</span>
    </p>
    <p class="text-xs italic">{{ data.ip }}; {{ data.user_agent }}</p>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
  data: any;
}>();
</script>
