<template>
  <div class="treeItem">
    <!-- Node row -->
    <div class="treeRow" :style="{ backgroundColor: levelCfg.bg }">
      <div class="treeCell">
        <div class="treeIndent" :style="{ paddingLeft: `${level * 22}px` }">
          <button v-if="hasChildren" class="caret" @click="isOpen = !isOpen">
            {{ isOpen ? '▾' : '▸' }}
          </button>
          <span v-else class="caretPlaceholder" />

          <AppIcon :icon="levelCfg.icon" class="nodeIcon" :style="{ color: levelCfg.color }" />
          <span class="nodeCode" :style="{ color: levelCfg.color }">{{ node.code }}</span>
          <span class="nodeName">{{ node.name }}</span>
        </div>
      </div>

      <div class="nodeActions">
        <span :class="node.isActive ? 'tag-active' : 'tag-inactive'">
          {{ node.isActive ? 'Activo' : 'Inactivo' }}
        </span>
        <AppButtonEdit @click="$emit('edit', node)" />
        <button v-if="levelCfg.childType" class="btn-add" @click="$emit('add-child', node, levelCfg.childType)">+ {{ levelCfg.childType }}</button>
      </div>
    </div>

    <!-- Children (recursive) -->
    <div v-if="isOpen && hasChildren" class="treeChildren">
      <PhysicalStructureNode v-for="child in node.children" :key="child.id" :node="child" :level="level + 1" @edit="$emit('edit', $event)" @add-child="(n, t) => $emit('add-child', n, t)" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import { PhysicalStructureNodeDto } from '../dtos/physicalStructure.dto';

const LEVEL_CFG: Record<string, { bg: string; color: string; icon: string; childType: string | null }> = {
  Campus: {
    bg: '#eff6ff',
    color: '#2563eb',
    icon: 'university',
    childType: 'Sede',
  },
  Sede: {
    bg: '#fdf4ff',
    color: '#9333ea',
    icon: 'building',
    childType: 'Edificio',
  },
  Edificio: {
    bg: '#fefce8',
    color: '#d97706',
    icon: 'school',
    childType: 'Piso',
  },
  Piso: {
    bg: '#f8fafc',
    color: '#64748b',
    icon: 'layer-group',
    childType: null,
  },
};

export default defineComponent({
  name: 'PhysicalStructureNode',
  components: { AppIcon, AppButtonEdit },

  props: {
    node: {
      type: Object as PropType<PhysicalStructureNodeDto>,
      required: true,
    },
    level: { type: Number, default: 0 },
  },

  emits: ['edit', 'add-child'],

  setup(props) {
    const isOpen = ref(true);
    const hasChildren = computed(() => (props.node.children?.length ?? 0) > 0);
    const levelCfg = computed(() => LEVEL_CFG[props.node.levelType] ?? LEVEL_CFG['Piso']);

    return { isOpen, hasChildren, levelCfg };
  },
});
</script>

<style scoped>
.treeItem {
  margin-bottom: 2px;
}

.treeRow {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  min-height: 2.5rem;
  transition: filter 0.1s;
}
.treeRow:hover {
  filter: brightness(0.97);
}

/* Left */
.treeIndent {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
}
.caret {
  width: 1.4rem;
  height: 1.4rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #64748b;
}
.caretPlaceholder {
  display: inline-block;
  width: 1.4rem;
  flex-shrink: 0;
}
.nodeIcon {
  font-size: 0.8rem;
  flex-shrink: 0;
}
.nodeCode {
  font-size: 0.72rem;
  font-weight: 600;
  flex-shrink: 0;
}
.nodeName {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Right */
.nodeActions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}
.tag-active {
  font-size: 0.72rem;
  font-weight: 600;
  color: #16a34a;
  white-space: nowrap;
}
.tag-inactive {
  font-size: 0.72rem;
  font-weight: 600;
  color: #dc2626;
  white-space: nowrap;
}
.btn-add {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
}
.btn-add:hover {
  background: #dbeafe;
}

.treeChildren {
}
</style>
