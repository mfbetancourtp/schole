<template>
  <div class="more-info-btn">
    <AppGetIcon :name="iconName" :style="{ color: color }" v-tooltip="text"></AppGetIcon>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppGetIcon from './AppGetIcon.vue';

export default defineComponent({
  name: 'AppMoreInfo',
  components: { AppGetIcon },
  props: {
    iconName: {
      type: String,
      required: false,
      default: 'question',
    },
    text: {
      type: String,
      required: false,
      default: '',
    },
    color: {
      type: String,
      required: false,
      default: '#4454C5',
    },
  },
});
</script>

<style scoped>
.more-info-btn {
  cursor: pointer;
}
</style>
