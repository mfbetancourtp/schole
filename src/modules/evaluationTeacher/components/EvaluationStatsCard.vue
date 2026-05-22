<template>
  <div class="tw-bg-white tw-rounded-xl tw-shadow tw-p-4 tw-flex tw-items-center tw-justify-between">
    <div class="tw-space-y-1">
      <p class="tw-text-sm tw-text-gray-500">{{ title }}</p>
      <p class="tw-text-2xl tw-font-bold tw-text-gray-800">
        {{ formattedValue }}
      </p>
    </div>

    <div v-if="icon" class="tw-w-10 tw-h-10 tw-rounded-full tw-bg-gray-100 tw-flex tw-items-center tw-justify-center">
      <!-- Si tu proyecto ya usa AppGetIcon, lo usamos -->
      <AppGetIcon :name="icon" class="tw-text-gray-600" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';

const props = defineProps<{
  title: string;
  value: number | string;
  icon?: string; // opcional, ej: "chartBar", "checkCircle", etc
}>();

const formattedValue = computed(() => {
  if (typeof props.value === 'number') return props.value.toLocaleString();
  return props.value;
});
</script>
