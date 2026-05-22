<template>
  <div
    class="tw-flex tw-flex-0 tw-items-center tw-justify-center tw-rounded-full tw-overflow-hidden"
    :class="{
      'tw-w-10': size === 'sm',
      'tw-h-10': size === 'sm',
      'tw-w-14': size === 'md',
      'tw-h-14': size === 'md',
      'tw-w-20': size === 'lg',
      'tw-h-20': size === 'lg',
    }"
  >
    <template v-if="avatar">
      <img
        class="tw-object-cover tw-w-full tw-h-full"
        :src="avatar"
        :alt="name"
      />
    </template>
    <template v-if="!avatar">
      <div
        class="tw-flex tw-items-center tw-justify-center tw-w-full tw-h-full tw-rounded-full tw-text-lg tw-uppercase tw-bg-gray-200 tw-text-gray-600"
      >
        {{ name.charAt(0) }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

// Size: sm md lg

export default defineComponent({
  name: 'AppAvatar',
  // props: ['avatar', 'name', 'size'],
  props: {
    avatar: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      default: 'md',
    },
  },
});
</script>

<style scoped></style>
