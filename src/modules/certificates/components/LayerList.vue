<template>
  <div class="layer-list-container">
    <div class="layer-list-header">
      <span class="header-col index">#</span>
      <span class="header-col name">Elemento</span>
      <span class="header-col actions">Acciones</span>
    </div>

    <!-- Draggable List -->
    <draggable v-model="localObjects" item-key="id" handle=".drag-handle" ghost-class="ghost-layer" drag-class="drag-layer" @end="onDragEnd" class="layers-draggable-area">
      <template #item="{ element, index }">
        <div class="layer-item" :class="{ active: element.id === selectedId }" @click="$emit('select', element.id)">
          <!-- Drag Handle & Index -->
          <div class="layer-col index drag-handle" title="Arrastrar para reordenar">
            <span class="layer-number">{{ index + 1 }}</span>
            <AppIcon icon="bars" class="drag-icon" />
          </div>

          <!-- Icon & Name -->
          <div class="layer-col name">
            <div class="layer-type-icon">
              <AppIcon :icon="getObjectIcon(element.type)" />
            </div>
            <span class="layer-label">{{ element.name }}</span>
          </div>

          <!-- Actions -->
          <div class="layer-col actions">
            <!-- Lock Toggle -->
            <button class="action-btn" :class="{ active: element.locked }" @click.stop="$emit('toggle-lock', element)" :title="element.locked ? 'Desbloquear' : 'Bloquear'">
              <AppIcon :icon="element.locked ? 'lock' : 'unlock'" />
            </button>

            <!-- Visibility Toggle -->
            <button class="action-btn" :class="{ active: !element.visible }" @click.stop="$emit('toggle-visibility', element)" :title="element.visible ? 'Ocultar' : 'Mostrar'">
              <AppIcon :icon="element.visible ? 'eye' : 'eye-slash'" />
            </button>

            <!-- Delete -->
            <button class="action-btn delete" @click.stop="$emit('delete', element.id)" title="Eliminar">
              <AppIcon icon="trash" />
            </button>
          </div>
        </div>
      </template>
    </draggable>

    <div v-if="localObjects.length === 0" class="empty-state">
      <p>No hay elementos en el lienzo</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import draggable from 'vuedraggable';
import AppIcon from '../../../shared/components/AppIcon.vue';

export interface LayerItem {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  // ... other props
}

export default defineComponent({
  name: 'LayerList',
  components: {
    draggable,
    AppIcon,
  },
  props: {
    objects: {
      type: Array as PropType<LayerItem[]>,
      required: true,
    },
    selectedId: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  emits: ['update:objects', 'select', 'toggle-lock', 'toggle-visibility', 'delete', 'reorder'],
  setup(props, { emit }) {
    // We expect 'objects' to be passed in established order (usually we want Top first for UI).
    // The parent is responsible for sorting logic. Here we just handle the list mutations via drag.

    const localObjects = computed({
      get: () => props.objects,
      set: (value) => {
        emit('update:objects', value);
        emit('reorder', value);
      },
    });

    const onDragEnd = () => {
      // Event handled by v-model setter
    };

    const getObjectIcon = (type: string) => {
      const icons: Record<string, string> = {
        text: 'font',
        'i-text': 'font',
        textbox: 'font',
        image: 'image',
        rect: 'square',
        circle: 'circle',
        triangle: 'play',
        group: 'object-group',
      };
      return icons[type] || 'square';
    };

    return {
      localObjects,
      onDragEnd,
      getObjectIcon,
    };
  },
});
</script>

<style scoped>
.layer-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.layer-list-header {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
}

.header-col.index {
  width: 2.5rem;
  text-align: center;
}

.header-col.name {
  flex: 1;
  padding-left: 0.5rem;
}

.header-col.actions {
  width: 5.5rem; /* Ajustado para 3 botones */
  text-align: right;
  padding-right: 0.25rem;
}

/* List Styles */
.layers-draggable-area {
  flex: 1;
  overflow-y: auto;
  min-height: 100px;
}

.layer-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.25rem;
  border-bottom: 1px solid #f3f4f6;
  background-color: white;
  transition: background-color 0.2s;
  cursor: pointer;
}

.layer-item:hover {
  background-color: #f9fafb;
}

.layer-item.active {
  background-color: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.layer-item.ghost-layer {
  opacity: 0.5;
  background-color: #e5e7eb;
}

.layer-item.drag-layer {
  background-color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Columns */
.layer-col {
  display: flex;
  align-items: center;
}

.layer-col.index {
  width: 2.5rem;
  justify-content: center;
  color: #9ca3af;
  font-family: monospace;
  font-size: 0.75rem;
  position: relative;
}

.drag-handle {
  cursor: grab;
}
.drag-handle:active {
  cursor: grabbing;
}

.layer-number {
  margin-right: 4px;
}
.drag-icon {
  opacity: 0;
  font-size: 0.75rem;
  transition: opacity 0.2s;
}

.layer-item:hover .drag-icon {
  opacity: 1;
}
.layer-item:hover .layer-number {
  display: none;
}

.layer-col.name {
  flex: 1;
  gap: 0.5rem;
  overflow: hidden;
  padding-right: 0.5rem;
}

.layer-type-icon {
  color: #6b7280;
  font-size: 0.875rem;
  min-width: 1rem;
  text-align: center;
}

.layer-label {
  font-size: 0.875rem;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-col.actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: transparent;
  color: #9ca3af;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.75rem;
}

.action-btn:hover {
  background-color: #e5e7eb;
  color: #4b5563;
}

.action-btn.active {
  color: #3b82f6; /* Azul para activo/locked */
}
/* Visibility off state custom color if needed */
.action-btn:not(.active) .fa-eye-slash {
  color: #ef4444;
}

.action-btn.delete:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}
</style>
