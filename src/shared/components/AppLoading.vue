<template>
  <div class="d-flex justify-content-center mt-4">
    <AppSpinner></AppSpinner>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppSpinner from './AppSpinner.vue';

export default defineComponent({
  name: 'AppLoading',
  components: { AppSpinner },
});
</script>

<style scoped></style>
