<template>
  <div class="drawerHead" :class="`drawerHead--${variant}`">
    <div class="drawerHead__inner">
      <div class="drawerHead__main">
        <div v-if="icon" class="drawerHead__icon">
          <AppIcon :icon="icon" />
        </div>

        <div class="drawerHead__content">
          <h3 class="drawerHead__title">
            {{ title }}
          </h3>

          <p v-if="subtitle" class="drawerHead__subtitle">
            {{ subtitle }}
          </p>

          <div v-if="$slots.meta" class="drawerHead__meta">
            <slot name="meta"></slot>
          </div>
        </div>
      </div>

      <div v-if="$slots.actions" class="drawerHead__actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppIcon from './AppIcon.vue';

type DrawerHeaderVariant = 'create' | 'edit' | 'view';

export default defineComponent({
  name: 'AppDrawerHeader',
  components: {
    AppIcon,
  },
  props: {
    variant: {
      type: String as PropType<DrawerHeaderVariant>,
      default: 'create',
    },
    icon: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
  },
});
</script>

<style scoped>
.drawerHead {
  width: 100%;
}

.drawerHead__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.drawerHead__main {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.drawerHead__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.drawerHead--create .drawerHead__icon {
  background: #dbeafe;
  color: #2563eb;
}

.drawerHead--edit .drawerHead__icon {
  background: #fef3c7;
  color: #b45309;
}

.drawerHead--view .drawerHead__icon {
  background: #2563eb;
  color: #ffffff;
}

.drawerHead__content {
  flex: 1;
  min-width: 0;
}

.drawerHead__title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
}

.drawerHead__subtitle {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.95rem;
}

.drawerHead__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.45rem;
  min-width: 0;
}

.drawerHead__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .drawerHead__inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .drawerHead__actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
