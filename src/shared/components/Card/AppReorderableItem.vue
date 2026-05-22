<template>
  <div
    class="appReorderableItem"
    :class="{
      'appReorderableItem--compact': compact,
      'appReorderableItem--withoutOrder': !showOrder,
      'appReorderableItem--withoutHandle': !showHandle,
    }"
  >
    <button v-if="showHandle" type="button" class="appReorderableItem__handle" :aria-label="handleLabel" :title="handleLabel">
      <slot name="handle">
        <AppIcon :icon="handleIcon" class="me-2" />
      </slot>
    </button>

    <div v-if="showOrder" class="appReorderableItem__order" :class="`appReorderableItem__order--${orderTone}`">
      <slot name="order">
        {{ order }}
      </slot>
    </div>

    <div class="appReorderableItem__content">
      <div v-if="$slots.badges" class="appReorderableItem__badges">
        <slot name="badges" />
      </div>

      <div v-if="$slots.title || title" class="appReorderableItem__title">
        <slot name="title">
          {{ title }}
        </slot>
      </div>

      <div v-if="$slots.subtitle || subtitle" class="appReorderableItem__subtitle">
        <slot name="subtitle">
          {{ subtitle }}
        </slot>
      </div>

      <div v-if="$slots.description || description" class="appReorderableItem__description">
        <slot name="description">
          {{ description }}
        </slot>
      </div>

      <div v-if="$slots.default" class="appReorderableItem__body">
        <slot />
      </div>
    </div>

    <div v-if="$slots.actions" class="appReorderableItem__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import AppIcon from '../AppIcon.vue';

type ReorderableTone = 'blue' | 'green' | 'purple' | 'amber' | 'indigo' | 'gray' | 'red';

export default defineComponent({
  name: 'AppReorderableItem',
  components: {
    AppIcon,
  },
  props: {
    order: {
      type: [String, Number],
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    handleIcon: {
      type: String,
      default: 'arrows-alt',
    },
    handleLabel: {
      type: String,
      default: 'Mover elemento',
    },
    showHandle: {
      type: Boolean,
      default: true,
    },
    showOrder: {
      type: Boolean,
      default: true,
    },
    compact: {
      type: Boolean,
      default: false,
    },
    orderTone: {
      type: String as PropType<ReorderableTone>,
      default: 'blue',
    },
  },
});
</script>

<style scoped>
.appReorderableItem {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto;
  gap: 0.9rem;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #ffffff, #fbfdff);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.appReorderableItem:hover {
  border-color: #cbd5e1;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.appReorderableItem--compact {
  padding: 0.85rem;
  gap: 0.75rem;
}

.appReorderableItem--withoutOrder {
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.appReorderableItem--withoutHandle {
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.appReorderableItem--withoutHandle.appReorderableItem--withoutOrder {
  grid-template-columns: minmax(0, 1fr) auto;
}

.appReorderableItem__handle {
  border: 0;
  background: transparent;
  color: #94a3b8;
  padding: 0.35rem;
  margin-top: 0.15rem;
  border-radius: 12px;
  cursor: grab;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.appReorderableItem__handle:hover {
  background: #f8fafc;
  color: #475569;
}

.appReorderableItem__handle:active {
  cursor: grabbing;
}

.appReorderableItem__handle:focus-visible {
  outline: 2px solid #bfdbfe;
  outline-offset: 2px;
}

.appReorderableItem__order {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.appReorderableItem__order--blue {
  background: #eff6ff;
  color: #1d4ed8;
}

.appReorderableItem__order--green {
  background: #dcfce7;
  color: #15803d;
}

.appReorderableItem__order--purple {
  background: #f3e8ff;
  color: #7e22ce;
}

.appReorderableItem__order--amber {
  background: #fef3c7;
  color: #b45309;
}

.appReorderableItem__order--indigo {
  background: #e0e7ff;
  color: #4338ca;
}

.appReorderableItem__order--gray {
  background: #e2e8f0;
  color: #475569;
}

.appReorderableItem__order--red {
  background: #fee2e2;
  color: #b91c1c;
}

.appReorderableItem__content {
  min-width: 0;
}

.appReorderableItem__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.55rem;
}

.appReorderableItem__title {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.35;
}

.appReorderableItem__subtitle {
  margin-top: 0.2rem;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.4;
}

.appReorderableItem__description {
  margin-top: 0.25rem;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.5;
}

.appReorderableItem__body {
  margin-top: 0.5rem;
}

.appReorderableItem__actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .appReorderableItem {
    grid-template-columns: auto auto 1fr;
  }

  .appReorderableItem--withoutOrder,
  .appReorderableItem--withoutHandle,
  .appReorderableItem--withoutHandle.appReorderableItem--withoutOrder {
    grid-template-columns: 1fr;
  }

  .appReorderableItem__actions {
    grid-column: 1 / -1;
  }
}
</style>
