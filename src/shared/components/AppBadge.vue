<template>
  <span class="o-badge" :class="`o-badge--${variant}`">
    {{ label }}
    <slot></slot>
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { VariantsConstant } from '../constant/variants.constant';

export default defineComponent({
  name: 'AppBadge',
  props: {
    label: {
      type: String,
      default: null,
    },
    variant: {
      type: String as PropType<VariantsConstant>,
      default: 'primary',
    },
  },
});
</script>

<style scoped>
.o-badge {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  flex-shrink: 0;
  min-height: 1.9rem;
  padding: 0.4em 0.8em;
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-bold);
  line-height: 1;
  color: var(--color-light);
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  width: fit-content;
  max-width: 100%;
  border-radius: 999px;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: normal;
  word-break: normal;
}

.o-badge--primary {
  background-color: var(--color-primary);
  margin-left: 0.25rem;
}
.o-badge--outlined-primary {
  color: var(--color-primary) !important;
  background-color: transparent;
  margin-left: 0.25rem;
  border-width: var(--border-1);
  border-color: var(--color-primary);
}
.o-badge--secondary {
  background-color: rgba(var(--color-secondary-rgb), var(--opacity-color-100));
}
.o-badge--danger {
  background-color: rgba(var(--color-danger-rgb), var(--opacity-color-100));
}
.o-badge--primary-20 {
  background-color: rgba(var(--color-primary-rgb), var(--opacity-color-20));
  color: var(--color-primary);
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-semibold);
}
.o-badge--success {
  background-color: rgba(var(--color-success-rgb), var(--opacity-color-100));
}
.o-badge--info {
  background-color: rgba(var(--color-info-rgb), var(--opacity-color-100));
}
.o-badge--warning {
  background-color: rgba(var(--color-warning-rgb), var(--opacity-color-100));
  color: var(--color-gray-600);
}
.o-badge--dark {
  background-color: rgba(var(--color-dark-rgb), var(--opacity-color-90));
}
.o-badge--ghost {
  background-color: rgba(var(--color-primary-rgb), var(--opacity-color-10));
  color: var(--color-primary);
  border: 1px solid rgba(var(--color-primary-rgb), var(--opacity-color-30));
}
</style>
