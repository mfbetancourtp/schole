<template>
  <AppButton
    variant="secondary"
    outlined
    :icon="icon"
    v-tooltip="title"
    v-bind="$props"
  ></AppButton>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { RouteLocationRaw } from 'vue-router';

import AppButton from './AppButton.vue';

export default defineComponent({
  name: 'AppButtonEdit',
  components: { AppButton },
  props: {
    to: {
      type: Object as PropType<RouteLocationRaw>,
      default: null,
    },
    href: String,
  },
  setup() {
    const icon = 'pencil-alt';
    const title = 'core.edit';

    return {
      icon,
      title,
    };
  },
});
</script>

<style scoped></style>
