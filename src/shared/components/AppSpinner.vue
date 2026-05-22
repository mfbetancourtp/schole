<template>
  <div class="o-spinner-border" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppSpinner',
});
</script>

<style scoped>
.o-spinner-border {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  vertical-align: -0.125em;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  color: rgba(var(--color-primary-rgb), var(--opacity-color-100));
  animation: 0.75s linear infinite spinner-border;
}
@media (prefers-reduced-motion: reduce) {
  .o-spinner-border {
    animation-duration: 1.5s;
  }
}
</style>
