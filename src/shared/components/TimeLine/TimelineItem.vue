<template>
  <div class="row" :style="{ gap: gap + 'px' }">
    <!-- Left -->
    <div class="left" :style="{ width: dotSize + 'px' }">
      <div class="dot" :class="dotClass" :style="{ width: dotSize + 'px', height: dotSize + 'px' }">
        <AppIcon v-if="dotIcon" :icon="dotIcon" class="dotIcon" />
      </div>

      <div v-if="!isLast" class="line" :class="lineClass" :style="{ top: dotSize + 8 + 'px' }" />
    </div>

    <!-- Content -->
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import AppIcon from '../AppIcon.vue';

export type TimelineVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export default defineComponent({
  name: 'TimelineItem',
  components: { AppIcon },
  props: {
    isLast: { type: Boolean, default: false },

    dotIcon: { type: String, default: '' },

    dotVariant: {
      type: String as PropType<TimelineVariant>,
      default: 'primary',
    },
    lineVariant: {
      type: String as PropType<TimelineVariant>,
      default: 'primary',
    },

    dotSize: { type: Number, default: 48 },
    gap: { type: Number, default: 24 },
  },
  setup(props) {
    const dotClass = computed(() => `v-${props.dotVariant}`);
    const lineClass = computed(() => `v-${props.lineVariant}`);
    return { dotClass, lineClass };
  },
});
</script>

<style scoped>
.row {
  display: flex;
  align-items: stretch;
  padding-bottom: 32px;
}

.left {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dot {
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.18);
  z-index: 2;
}

.dotIcon {
  font-size: 20px;
  color: #fff;
}

.line {
  position: absolute;
  width: 2px;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 999px;
  z-index: 1;
}

/* Variants */
.v-primary {
  background: var(--color-primary, #1b2e83);
}
.v-success {
  background: #16a34a;
}
.v-warning {
  background: #f59e0b;
}
.v-danger {
  background: #ef4444;
}
.v-neutral {
  background: #111827;
}

/* Líneas con gradiente suave */
.line.v-primary {
  background: linear-gradient(to bottom, var(--color-primary, #1b2e83), rgba(59, 130, 246, 0.35));
}
.line.v-success {
  background: linear-gradient(to bottom, #16a34a, rgba(34, 197, 94, 0.35));
}
.line.v-warning {
  background: linear-gradient(to bottom, #f59e0b, rgba(251, 191, 36, 0.35));
}
.line.v-danger {
  background: linear-gradient(to bottom, #ef4444, rgba(248, 113, 113, 0.35));
}
.line.v-neutral {
  background: linear-gradient(to bottom, #111827, rgba(156, 163, 175, 0.35));
}

.content {
  flex: 1;
  min-width: 0;
}
</style>
