<template>
  <div class="o-btn-group">
    <div
      class="dropdown-toggle tw-cursor-pointer"
      data-bs-toggle="dropdown"
      ref="dropdown"
      aria-expanded="false"
    >
      <slot name="button"></slot>
    </div>

    <ul class="dropdown-menu dropdown-menu-end">
      <slot name="items"></slot>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Dropdown } from 'bootstrap';

export default defineComponent({
  name: 'AppDropdown',
  mounted() {
    new Dropdown(this.$refs.dropdown as any);
  },
});
</script>

<style scoped>
.o-btn-group {
  position: relative;
  display: inline-flex;
  vertical-align: middle;
  color: var(--color-primary);
}
</style>
