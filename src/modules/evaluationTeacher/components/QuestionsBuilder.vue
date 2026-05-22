<template>
  <div class="tw-space-y-3">
    <div v-for="(q, index) in modelValue" :key="index" class="tw-border tw-rounded-lg tw-p-3">
      <input v-model="q.text" placeholder="Pregunta" class="tw-input tw-w-full" />
    </div>

    <AppButton size="sm" @click="addQuestion"> Agregar pregunta </AppButton>
  </div>
</template>

<script setup lang="ts">
import { IQuestion } from '../dtos/applicationAssessments.dto';

const props = defineProps<{
  modelValue: IQuestion[];
}>();

const emit = defineEmits(['update:modelValue']);

function addQuestion() {
  emit('update:modelValue', [...props.modelValue, { text: '', type: 'scale' }]);
}
</script>
