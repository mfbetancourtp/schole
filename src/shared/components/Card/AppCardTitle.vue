<template>
  <div class="o-card-title-background">
    <slot>
      <div class="o-card-title-content">
        <span class="o-title">{{ title }}</span>
        <span class="o-subtitle" v-if="subtitle"> {{ subtitle }}</span>
      </div>
    </slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppCardTitle',
  props: ['title', 'subtitle'],
});
</script>

<style scoped>
.o-card-title-background {
  background-color: var(--color-primary);
  color: var(--color-light);
  padding: var(--padding-2);
  line-height: var(--line-height-5);
}
.o-card-title-content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
}
.o-title {
  font-weight: var(--font-weight-bold);
  text-align: center;
  font-size: var(--font-size-2);
}
.o-subtitle {
  font-weight: var(--font-weight-normal);
  font-size: var(--font-size-1);
}
</style>
