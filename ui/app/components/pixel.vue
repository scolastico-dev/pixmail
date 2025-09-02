<template>
  <div class="my-2 bg-black/10 p-2">
    <div class="grid grid-cols-[1fr_auto] hover:underline hover:text-red-500 cursor-pointer" @click="handleDel">
      <p>{{ data.id }}</p>
      <p>{{ new Date(data.timestamp*1000).toLocaleString() }}</p>
    </div>
    <p class="text-xs font-bold">{{ data.label }}</p> 
    <a class="text-xs italic" :href="data.img" target="_blank" rel="noreferrer">{{ data.img }}</a>
    <br />
    <a class="text-xs italic" :href="pixelUrl" target="_blank" rel="noreferrer">{{ pixelUrl }}</a>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';

const emit = defineEmits(['refresh']);

const props = defineProps<{
  data: any;
}>();

const pixelUrl = computed(() => {
  return window.location.protocol + '//' + window.location.host + '/get/' + props.data.id;
})

async function handleDel() {
  if (confirm('Are you sure you want to delete this pixel?')) {
    await axios.delete(`/pixel/${props.data.id}`);
    emit('refresh');
  }
}
</script>
