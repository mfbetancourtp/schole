<template>
  <div class="timelineList">
    <TimelineItem
      v-for="(item, index) in items"
      :key="getKey(item, index)"
      :isLast="index === items.length - 1"
      :dotIcon="getDotIcon?.(item, index)"
      :dotVariant="getDotVariant?.(item, index)"
      :lineVariant="getLineVariant?.(item, index)"
      :dotSize="dotSize"
      :gap="gap"
    >
      <template #default>
        <slot name="item" :item="item" :index="index" />
      </template>
    </TimelineItem>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import TimelineItem from './TimelineItem.vue';

export type TimelineVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export default defineComponent({
  name: 'TimelineList',
  components: { TimelineItem },
  props: {
    items: {
      type: Array as PropType<any[]>,
      default: () => [],
    },

    /** Key resolver (si no lo envías, intenta item.id o usa index) */
    itemKey: {
      type: [String, Function] as PropType<string | ((item: any, index: number) => string)>,
      default: 'id',
    },

    /** Icono en el dot (ej: 'briefcase') */
    getDotIcon: {
      type: Function as PropType<(item: any, index: number) => string>,
      default: undefined,
    },

    /** Variant del dot */
    getDotVariant: {
      type: Function as PropType<(item: any, index: number) => TimelineVariant>,
      default: undefined,
    },

    /** Variant de la línea */
    getLineVariant: {
      type: Function as PropType<(item: any, index: number) => TimelineVariant>,
      default: undefined,
    },

    dotSize: {
      type: Number,
      default: 48,
    },

    gap: {
      type: Number,
      default: 24,
    },
  },
  setup(props) {
    const getKey = (item: any, index: number) => {
      if (typeof props.itemKey === 'function') return props.itemKey(item, index);
      const k = props.itemKey || 'id';
      return String(item?.[k] ?? index);
    };

    return { getKey };
  },
});
</script>

<style scoped>
.timelineList {
  display: grid;
  gap: 0;
}
</style>
