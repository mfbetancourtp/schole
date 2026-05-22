<template>
  <div class="app-tree-node" :style="{ '--node-bg': cfg.bg, '--node-color': cfg.color }">
    <!-- ── Hoja (sin hijos posibles) ── -->
    <div v-if="isLeaf" class="node-card">
      <div class="node-head">
        <div class="node-head__left">
          <AppIcon :icon="cfg.icon" class="node-head__icon" />
          <span class="node-head__type">{{ node.levelType }}</span>
          <span class="node-head__code">{{ node.code }}</span>
          <span class="node-head__name">{{ node.name }}</span>
        </div>
        <div class="node-head__right">
          <span :class="node.isActive ? 'nbadge nbadge--active' : 'nbadge nbadge--inactive'">
            {{ node.isActive ? 'Activo' : 'Inactivo' }}
          </span>
          <AppButtonEdit v-if="cfg.canEdit !== false" @click.stop="$emit('edit', node)" />
          <AppButtonDelete v-if="cfg.canDelete !== false" @click.stop="$emit('confirm-delete', node)" />
        </div>
      </div>
    </div>

    <!-- ── Expandible (con hijos lazy) ── -->
    <div v-else class="node-accordion">
      <div class="node-head node-head--clickable" @click="handleToggle">
        <div class="node-head__left">
          <AppIcon icon="chevron-right" class="node-head__caret" :class="{ 'node-head__caret--open': isOpen }" />
          <AppIcon :icon="cfg.icon" class="node-head__icon" />
          <span class="node-head__type">{{ node.levelType }}</span>
          <span class="node-head__code">{{ node.code }}</span>
          <span class="node-head__name">{{ node.name }}</span>
        </div>
        <div class="node-head__right">
          <span :class="node.isActive ? 'nbadge nbadge--active' : 'nbadge nbadge--inactive'">
            {{ node.isActive ? 'Activo' : 'Inactivo' }}
          </span>
          <button v-if="cfg.canAddChild !== false && cfg.childType" class="btn-add-child" @click.stop="$emit('add-child', node, cfg.childType)">
            <AppIcon icon="plus" style="font-size: 0.65rem" class="me-1" />{{ cfg.childType }}
          </button>
          <AppButtonEdit v-if="cfg.canEdit !== false" @click.stop="$emit('edit', node)" />
          <AppButtonDelete v-if="cfg.canDelete !== false" @click.stop="$emit('confirm-delete', node)" />
        </div>
      </div>

      <div v-if="isOpen" class="node-body">
        <div v-if="isLoadingChildren" class="node-loading">
          <span class="spinner-border spinner-border-sm text-secondary me-2" role="status" />
          Cargando {{ cfg.childType?.toLowerCase() }}s…
        </div>
        <template v-else-if="children.length">
          <AppTreeNode
            v-for="child in children"
            :key="child.id"
            :node="child"
            :level="level + 1"
            :level-configs="levelConfigs"
            :fetch-children="fetchChildren"
            :reload-event="reloadEvent"
            @edit="$emit('edit', $event)"
            @add-child="(n, t) => $emit('add-child', n, t)"
            @confirm-delete="$emit('confirm-delete', $event)"
          />
        </template>
        <p v-else class="node-empty">Sin {{ cfg.childType?.toLowerCase() }}s configurados</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, PropType, ref } from 'vue';
import AppIcon from '../AppIcon.vue';
import AppButtonEdit from '../Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../Buttons/AppButtonDelete.vue';

export interface AppTreeNodeDto {
  id: number;
  code: string;
  name: string;
  levelType: string;
  parentId: number | null;
  isActive: boolean;
  children?: AppTreeNodeDto[];
}

export interface AppTreeNodeLevelConfig {
  /** CSS background color for the node header */
  bg: string;
  /** CSS accent/text color */
  color: string;
  /** FontAwesome icon name */
  icon: string;
  /** Label of the child level (null if leaf) */
  childType: string | null;
  /** Show edit button? default true */
  canEdit?: boolean;
  /** Show delete button? default true */
  canDelete?: boolean;
  /** Show add-child button? default true when childType is set */
  canAddChild?: boolean;
}

export default defineComponent({
  name: 'AppTreeNode',

  components: { AppIcon, AppButtonEdit, AppButtonDelete },

  props: {
    node: {
      type: Object as PropType<AppTreeNodeDto>,
      required: true,
    },
    level: {
      type: Number,
      default: 0,
    },
    /** Config object keyed by levelType string */
    levelConfigs: {
      type: Object as PropType<Record<string, AppTreeNodeLevelConfig>>,
      required: true,
    },
    /**
     * Async function that receives the current node and returns its children.
     * The parent page is responsible for providing the correct fetch logic.
     */
    fetchChildren: {
      type: Function as PropType<(node: AppTreeNodeDto) => Promise<AppTreeNodeDto[]>>,
      required: true,
    },
    /**
     * Custom DOM event name used to trigger a reload of this node's children
     * from the parent page after a CRUD operation.
     * Default: 'appTreeNodeChildReload'
     * Payload: CustomEvent<{ parentId: number }>
     */
    reloadEvent: {
      type: String,
      default: 'appTreeNodeChildReload',
    },
  },

  emits: ['edit', 'add-child', 'confirm-delete'],

  setup(props) {
    const cfg = computed<AppTreeNodeLevelConfig>(
      () =>
        props.levelConfigs[props.node.levelType] ?? {
          bg: '#f1f5f9',
          color: '#64748b',
          icon: 'folder',
          childType: null,
        }
    );

    const isLeaf = computed(() => !cfg.value.childType);

    // ── Accordion state ──────────────────────────────────────────────
    const isOpen = ref(false);
    const isLoadingChildren = ref(false);
    const childrenLoaded = ref(false);
    const children = ref<AppTreeNodeDto[]>([]);

    const loadChildren = async () => {
      isLoadingChildren.value = true;
      try {
        children.value = await props.fetchChildren(props.node);
        childrenLoaded.value = true;
      } catch (e) {
        console.error(`AppTreeNode: error cargando hijos de ${props.node.levelType} ${props.node.id}:`, e);
      } finally {
        isLoadingChildren.value = false;
      }
    };

    const handleToggle = () => {
      isOpen.value = !isOpen.value;
      if (isOpen.value && !childrenLoaded.value) {
        loadChildren();
      }
    };

    // ── Reload event listener ────────────────────────────────────────
    const handleReloadEvent = (e: Event) => {
      const { parentId } = (e as CustomEvent<{ parentId: number }>).detail ?? {};
      if (parentId === props.node.id) {
        childrenLoaded.value = false;
        children.value = [];
        if (isOpen.value) loadChildren();
      }
    };

    onMounted(() => window.addEventListener(props.reloadEvent, handleReloadEvent));
    onUnmounted(() => window.removeEventListener(props.reloadEvent, handleReloadEvent));

    return { cfg, isLeaf, isOpen, isLoadingChildren, children, handleToggle };
  },
});
</script>

<style scoped>
.app-tree-node {
  width: 100%;
}

/* ── Leaf card ── */
.node-card {
  background-color: var(--node-bg, #f8fafc);
  border: 1px solid rgba(0, 0, 0, 0.07);
  border-radius: 8px;
  padding: 0.55rem 1rem;
}

/* ── Expandable shell ── */
.node-accordion {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
}

/* ── Head ── */
.node-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.55rem 1rem;
  background-color: var(--node-bg, #f8fafc);
}

.node-head--clickable {
  cursor: pointer;
  user-select: none;
}
.node-head--clickable:hover {
  filter: brightness(0.97);
}

.node-head__left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.node-head__caret {
  font-size: 0.7rem;
  color: var(--node-color);
  flex-shrink: 0;
  transition: transform 0.18s ease;
}
.node-head__caret--open {
  transform: rotate(90deg);
}

.node-head__icon {
  font-size: 0.85rem;
  color: var(--node-color);
  flex-shrink: 0;
}

.node-head__type {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--node-color);
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid currentColor;
  border-radius: 9999px;
  padding: 0.1rem 0.5rem;
  white-space: nowrap;
  flex-shrink: 0;
  opacity: 0.85;
}

.node-head__code {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--node-color);
  flex-shrink: 0;
}

.node-head__name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-head__right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* ── Badges ── */
.nbadge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  white-space: nowrap;
}
.nbadge--active {
  background: #dcfce7;
  color: #16a34a;
}
.nbadge--inactive {
  background: #fee2e2;
  color: #dc2626;
}

/* ── Add-child button ── */
.btn-add-child {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 2px;
}
.btn-add-child:hover {
  background: rgba(255, 255, 255, 0.6);
}

/* ── Body ── */
.node-body {
  background: #fff;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.node-loading {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #94a3b8;
  padding: 0.4rem 0.25rem;
}

.node-empty {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
  padding: 0.25rem 0;
}
</style>
