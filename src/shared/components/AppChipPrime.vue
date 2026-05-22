<template>
  <div :class="['app-chip', `app-chip--${variant}`]">
    <!-- Imagen opcional -->
    <img v-if="image" :src="image" class="app-chip__image" />

    <!-- Ícono opcional -->
    <AppIcon v-if="icon" :icon="icon" class="app-chip__icon" :style="!variant ? 'color: white;' : ''" />

    <!-- Label si se usa -->
    <span v-if="label" class="app-chip__label">{{ label }}</span>

    <!-- Contenido adicional -->
    <slot name="content"></slot>

    <!-- Botón de eliminar -->
    <span v-if="removable" class="app-chip__remove" @click="$emit('remove')">
      <slot name="remove-icon">
        <AppIcon icon="times-circle" class="app-chip__icon" :style="!variant ? 'color: white;' : ''" />
      </slot>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { VariantsConstant } from '../constant/variants.constant';
import AppIcon from './AppIcon.vue';

export default defineComponent({
  name: 'AppChip',
  components: { AppIcon },
  props: {
    label: {
      type: [String, Number],
      default: '',
    },
    icon: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    removable: {
      type: Boolean,
      default: true,
    },
    variant: {
      type: String as PropType<VariantsConstant>,
      default: 'primary',
    },
  },
});
</script>

<style scoped>
.app-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.475rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  line-height: 1;
  gap: 0.5rem;

  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-chip__image {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
}

.app-chip__icon {
  font-size: 1rem;
}

.app-chip__label {
  white-space: nowrap;
}

.app-chip__remove {
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* Variantes de color */
.app-chip--primary {
  background-color: var(--color-primary);
  color: var(--color-light);
}

.app-chip--danger {
  background-color: rgba(var(--color-danger-rgb), var(--opacity-color-100));
  color: var(--color-light);
}

.app-chip--success {
  background-color: rgba(var(--color-success-rgb), var(--opacity-color-100));
  color: var(--color-light);
}

.app-chip--secondary {
  background-color: rgba(var(--color-secondary-rgb), var(--opacity-color-100));
  color: var(--color-light);
}

.app-chip--warning {
  background-color: rgba(var(--color-warning-rgb), var(--opacity-color-100));
  color: var(--color-dark);
}
</style>
