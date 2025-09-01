<template>
  <div class="fixed right-0 bottom-0">
    <button class="rounded-full bg-green-300 m-8 p-4 flex justify-center items-center h-12 w-12" @click="dialogOpen = true">
      <icon name="lucide:plus" />
    </button>
  </div>
  <div class="fixed inset-0 bg-black/60 p-4 grid md:grid-cols-3" v-if="dialogOpen">
    <div class="md:col-start-2">
      <card>
        <h1 class="text-2xl italic mb-4">Create new pixel</h1>
        <input v-model="img" type="text" placeholder="Image URL" class="w-full my-2 outline px-2 py-1" />
        <input v-model="label" type="text" placeholder="Label" class="w-full my-2 outline px-2 py-1" />
        <div class="text-right mt-4">
          <button @click="cancel" class="outline px-2 py-1 mr-2">Cancel</button>
          <button @click="create" class="outline px-2 py-1">Create</button>
        </div>
      </card>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { defineEmits } from 'vue';

const dialogOpen = ref(false);
const img = ref('');
const label = ref('');

const emit = defineEmits(['created']);

function cancel() {
  dialogOpen.value = false;
  img.value = '';
  label.value = '';
}

function create() {
  axios.post('/pixel', {
    img: img.value,
    label: label.value
  });
  emit('created');
  cancel();
}
</script>
