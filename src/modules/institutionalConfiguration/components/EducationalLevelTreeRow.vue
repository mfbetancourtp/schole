<template>
  <div class="educational-tree-table-wrapper">
    <TreeTable v-model:expandedKeys="internalExpandedKeys" :value="treeNodes" class="educational-tree-table" :indentation="1.5" @node-expand="onNodeExpand">
      <template #empty>
        <div class="empty-message">No se encontraron niveles educativos.</div>
      </template>

      <!-- Columna Nombre -->
      <Column field="name" header="Nombre" expander style="min-width: 300px">
        <template #body="slotProps">
          <div class="name-cell">
            <div v-if="!slotProps.node.data.isPlaceholder" class="node-icon" :class="slotProps.node.data.isRoot ? 'node-icon--root' : 'node-icon--child'">
              <AppIcon :icon="slotProps.node.data.isRoot ? 'graduation-cap' : 'sitemap'" />
            </div>
            <div class="name-content">
              <span class="node-name">{{ slotProps.node.data.name }}</span>
              <span class="node-badge" :class="slotProps.node.data.isRoot ? 'badge--root' : 'badge--child'">
                {{ slotProps.node.data.isRoot ? 'Raíz' : `Nivel ${slotProps.node.data.level}` }}
              </span>
            </div>
          </div>
        </template>
      </Column>

      <!-- Columna Código -->
      <Column field="code" header="Código" style="width: 150px">
        <template #body="slotProps">
          <span class="code-badge">
            {{ slotProps.node.data.code }}
          </span>
        </template>
      </Column>

      <!-- Columna Descripción -->
      <Column field="description" header="Descripción">
        <template #body="slotProps">
          <span class="description-text" :title="slotProps.node.data.description">
            {{ slotProps.node.data.description || '-' }}
          </span>
        </template>
      </Column>

      <!-- Columna Acciones -->
      <Column header="Acciones" headerClass="text-center" bodyClass="text-center" style="width: 160px">
        <template #body="slotProps">
          <div class="actions-cell">
            <AppCheckPermission permission="institutionalConfiguration.educationalLevels.edit">
              <AppButton variant="primary" icon="pencil-alt" @click.stop="handleEdit(slotProps.node.data.original)" v-tooltip="'Editar'" />
            </AppCheckPermission>

            <AppCheckPermission permission="institutionalConfiguration.educationalLevels.create">
              <AppButton variant="success" icon="plus" @click.stop="handleAddChild(slotProps.node.data.original.id)" v-tooltip="'Agregar hijo'" />
            </AppCheckPermission>

            <AppCheckPermission permission="institutionalConfiguration.educationalLevels.delete">
              <AppButton variant="danger" icon="trash" @click.stop="handleRemove(slotProps.node.data.original.id)" v-tooltip="'Eliminar'" />
            </AppCheckPermission>
          </div>
        </template>
      </Column>
    </TreeTable>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';
import { EducationTypeDto } from '../dtos/educationTypes.dto';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

interface TreeNode {
  key: string;
  data: {
    id: number;
    name: string;
    code: string;
    description: string;
    isRoot: boolean;
    level: number;
    original: EducationTypeDto;
  };
  children?: TreeNode[];
  leaf?: boolean;
}

export default defineComponent({
  name: 'EducationalLevelTreeRow',

  components: {
    TreeTable,
    Column,
    AppCheckPermission,
    AppIcon,
    AppButton,
  },

  props: {
    educationTypes: {
      type: Array as PropType<EducationTypeDto[]>,
      required: true,
    },
    expandedKeys: {
      type: Object as PropType<Record<string, boolean>>,
      required: true,
    },
  },

  emits: ['add-child', 'edit', 'remove', 'load-children', 'update:expandedKeys'],

  setup(props, { emit }) {
    const internalExpandedKeys = computed({
      get: () => props.expandedKeys,
      set: (val) => emit('update:expandedKeys', val),
    });

    const convertToTreeNodes = (items: EducationTypeDto[], level = 0): TreeNode[] => {
      return items.map((item) => {
        const childrenAreLoaded = Array.isArray(item.children);
        const hasChildren = childrenAreLoaded && item.children!.length > 0;

        const node: TreeNode = {
          key: `node-${item.id}`,
          data: {
            id: item.id,
            name: item.name,
            code: item.code,
            description: item.description || '',
            isRoot: level === 0,
            level,
            original: item,
          },
          leaf: childrenAreLoaded && !hasChildren,
        };

        if (hasChildren) {
          node.children = convertToTreeNodes(item.children!, level + 1);
        }

        return node;
      });
    };

    const treeNodes = computed(() => {
      return convertToTreeNodes(props.educationTypes);
    });

    const onNodeExpand = (node: any) => {
      if (!Array.isArray(node.data.original.children)) {
        emit('load-children', node.data.original);
      }
    };

    // Expandir todos los nodos por defecto (Desactivado para iniciar cerrado)
    /*
    const expandAll = () => {
      const keys: Record<string, boolean> = {};
      const addKeys = (nodes: TreeNode[]) => {
        nodes.forEach((node) => {
          keys[node.key] = true;
          if (node.children) {
            addKeys(node.children);
          }
        });
      };
      addKeys(treeNodes.value);
      expandedKeys.value = keys;
    };

    // Expandir todos al montar
    expandAll();
    */

    const handleEdit = (educationType: EducationTypeDto) => {
      emit('edit', educationType);
    };

    const handleAddChild = (parentId: number) => {
      emit('add-child', parentId);
    };

    const handleRemove = (id: number) => {
      emit('remove', id);
    };

    return {
      internalExpandedKeys,
      treeNodes,
      handleEdit,
      handleAddChild,
      handleRemove,
      onNodeExpand,
    };
  },
});
</script>

<style scoped>
.educational-tree-table-wrapper {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border: 1px solid #f3f4f6;
}

:deep(.p-treetable) {
  width: 100%;
}

:deep(.p-treetable-thead > tr > th) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  padding: 1rem 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

:deep(.p-treetable-tbody > tr) {
  background: transparent;
  transition: background-color 0.2s;
  border: none !important;
}

:deep(.p-treetable-tbody > tr > td) {
  border: none !important;
}

/* Quitar borde de la última fila para evitar doble línea al final */
:deep(.p-treetable-tbody > tr:last-child),
:deep(.p-treetable-tbody > tr:last-child > td) {
  border-bottom: none !important;
}

:deep(.p-treetable-tbody > tr:hover) {
  background-color: #f9fafb;
}

:deep(.p-treetable-toggler) {
  width: 2rem;
  height: 2rem;
  margin-right: 0.75rem;
  border-radius: 50%;
  color: #6b7280;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:deep(.p-treetable-toggler:hover) {
  background-color: #e5e7eb;
  color: #374151;
}

:deep(.p-treetable-toggler:focus) {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

/* Celdas */
.name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Iconos */
.node-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.node-icon--root {
  background-color: var(--color-primary);
  color: #ffffff;
}

.node-icon--child {
  background-color: var(--color-secondary);
  color: var(--color-primary);
}

.name-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
}

.node-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
  text-transform: uppercase;
}

.badge--root {
  background-color: #eef2ff;
  color: var(--color-primary);
}

.badge--child {
  background-color: #fdf4ff;
  color: var(--color-secondary);
}

.code-badge {
  background: #f3f4f6;
  color: #4b5563;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid #e5e7eb;
}

.description-text {
  color: #6b7280;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 300px;
}

/* Acciones */
.actions-cell {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.empty-message {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
  font-style: italic;
}
</style>
