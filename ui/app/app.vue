<template>
  <div class="min-h-screen bg-slate-700 grid md:grid-cols-3 p-12">
    <div class="md:col-start-2">
      <card>
        <div class="grid grid-cols-[1fr_auto]">
          <h1 class="text-2xl">Pixel</h1>
          <button v-if="pixels.length" @click="showPixels = !showPixels">
            {{ showPixels ? 'Hide' : 'Show' }} Pixels
          </button>
          <p v-else>No Pixels Found</p>
        </div>
        <template v-if="showPixels">
          <pixel v-for="p in pixels" :key="p.id" :data="p" @refresh="refreshData"/>
        </template>
      </card>
      <card>
        <div class="grid grid-cols-[1fr_auto]">
          <h1 class="text-2xl">Log</h1>
          <button v-if="logs.length" @click="showLogs = !showLogs">
            {{ showLogs ? 'Hide' : 'Show' }} Logs
          </button>
          <p v-else>No Logs Found</p>
        </div>
        <template v-if="showLogs">
          <log v-for="l in logs" :key="l.id" :data="l"/>
        </template>
      </card>
    </div>
    <create @created="refreshData"/>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';

const logs = ref<any>([]);
const pixels = ref<any>([]);
const logsPage = ref(0);
const pixelsPage = ref(0);
const showLogs = ref(true);
const showPixels = ref(true);

async function refreshData() {
  try {
    const [p , l] = await Promise.all([
      axios.get('/pixel', {params: {page: pixelsPage.value}}),
      axios.get('/log', {params: {page: logsPage.value}})
    ])
    if (pixelsPage && !p.data.length) {
      pixelsPage.value = 0;
    } else {
      pixels.value = p.data;
    }
    if (logsPage && !l.data.length) {
      logsPage.value = 0;
    } else {
      logs.value = l.data;
    }
  } catch (e) {
    console.error(e);
    window.location.href = '/auth/login';
  }
}

onMounted(async () => {
  await refreshData();
  console.log(pixels.value);
  console.log(logs.value);
})
</script>
