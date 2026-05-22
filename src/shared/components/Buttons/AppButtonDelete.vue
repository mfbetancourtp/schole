<template>
  <AppButton
    variant="primary"
    outlined
    :icon="icon"
    v-tooltip="title"
    v-bind="$props"
  ></AppButton>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppButton from './AppButton.vue';

import { RouteLocationRaw } from 'vue-router';

export default defineComponent({
  name: 'AppButtonDelete',
  components: { AppButton },
  props: {
    to: {
      type: Object as PropType<RouteLocationRaw>,
      default: null,
    },
    href: String,
  },
  setup() {
    const icon = 'trash';
    const title = 'core.delete';

    return {
      icon,
      title,
    };
  },
});
</script>

<style scoped></style>
