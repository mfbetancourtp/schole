<template>
  <AppButton style="color: white" variant="secondary" outlined :to="to" :label="label"></AppButton>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppButton from './AppButton.vue';
import { RouteLocationRaw } from 'vue-router';

export default defineComponent({
  name: 'AppButtonBack',
  components: { AppButton },
  props: {
    to: {
      type: Object as PropType<RouteLocationRaw>,
      default: null,
      required: true,
    },
    label: {
      type: String,
      default: 'core.back',
    },
  },
});
</script>
<style scoped></style>
