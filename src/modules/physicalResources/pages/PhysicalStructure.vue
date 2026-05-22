<template>
  <AppBaseList :title="title">
    <template #actions>
      <!-- Acciones contextuales están dentro del árbol; no hay "Nuevo Nivel" global -->
    </template>

    <template #content>
      <AppLoading v-if="isLoading" />

      <template v-else>
        <!-- Root accordion card -->
        <div class="root-accordion">
          <AppAccordion styleType="rounded">
            <template v-slot="{ accordionId }">
              <AppAccordionItem :accordionId="accordionId" :initOpen="true">
                <template #head>
                  <div class="root-head">
                    <div class="root-head__left">
                      <AppIcon icon="sitemap" class="root-head__icon" />
                      <div class="root-head__texts">
                        <span class="root-head__title">Estructura Física Disponible</span>
                        <span class="root-head__sub">Define la jerarquía de ubicaciones para crear espacios</span>
                      </div>
                    </div>
                    <span class="campus-counter"> {{ campuses.length }} campus configurado{{ campuses.length !== 1 ? 's' : '' }} </span>
                  </div>
                </template>

                <template #content>
                  <p class="tw-text-xs tw-text-gray-400 tw-mb-2">Campus → Edificios → Pisos · Expande cada nivel para ver sus sub-niveles</p>

                  <div v-if="!campuses.length" class="tw-text-center tw-py-10 tw-text-gray-400">
                    <AppIcon icon="sitemap" class="tw-text-4xl tw-mb-3 tw-block tw-mx-auto tw-text-gray-200" />
                    <p class="tw-text-sm tw-font-medium">No hay campus configurados</p>
                    <p class="tw-text-xs">Contacta al administrador para configurar la estructura</p>
                  </div>

                  <div v-else class="nodes-list">
                    <AppTreeNode
                      v-for="campus in campuses"
                      :key="campus.id"
                      :node="campus"
                      :level="0"
                      :level-configs="LEVEL_CONFIG"
                      :fetch-children="fetchChildren"
                      reload-event="physicalStructureChildReload"
                      @edit="openEditModal"
                      @add-child="openAddChildModal"
                      @confirm-delete="confirmDelete"
                    />
                  </div>
                </template>
              </AppAccordionItem>
            </template>
          </AppAccordion>
        </div>

        <!-- Modal: Crear / Editar edificio o piso -->
        <AppModal v-model="showFormModal">
          <PhysicalStructureLevelForm v-if="showFormModal" :data="selectedNode" :default-level-type="defaultLevelType" :parent-id="addParentId" @save="handleFormSave" />
        </AppModal>

        <!-- Modal: Confirmar eliminar -->
        <AppModal v-model="showDeleteModal">
          <AppConfirmDeleteModal v-if="showDeleteModal" entity="nivel" @confirmDelete="handleDelete" />
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';

import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppTreeNode, { AppTreeNodeDto, AppTreeNodeLevelConfig } from '../../../shared/components/Tree/AppTreeNode.vue';

import PhysicalStructureLevelForm from '../components/PhysicalStructureLevelForm.vue';

import { PhysicalStructureNodeDto } from '../dtos/physicalStructure.dto';
import { GetCampusesService } from '../services/getCampuses.service';
import { GetBuildingsByCampusService } from '../services/getBuildingsByCampus.service';
import { GetFloorsByBuildingService } from '../services/getFloorsByBuilding.service';
import { CreateOrUpdatePhysicalStructureNodeService } from '../services/createOrUpdatePhysicalStructureNode.service';
import { DeletePhysicalStructureNodeService } from '../services/deletePhysicalStructureNode.service';

const getCampusesService = new GetCampusesService();
const getBuildingsService = new GetBuildingsByCampusService();
const getFloorsService = new GetFloorsByBuildingService();
const createOrUpdateNodeService = new CreateOrUpdatePhysicalStructureNodeService();
const deleteNodeService = new DeletePhysicalStructureNodeService();

// ── Level configuration passed to AppTreeNode ────────────────────────────────
const LEVEL_CONFIG: Record<string, AppTreeNodeLevelConfig> = {
  Campus: {
    bg: 'rgba(37, 99, 235, 0.08)',
    color: '#2563eb',
    icon: 'university',
    childType: 'Edificio',
    canEdit: false,
    canDelete: false,
    canAddChild: true,
  },
  Edificio: {
    bg: 'rgba(217, 119, 6, 0.08)',
    color: '#d97706',
    icon: 'school',
    childType: 'Piso',
    canEdit: true,
    canDelete: true,
    canAddChild: true,
  },
  Piso: {
    bg: 'rgba(100, 116, 139, 0.07)',
    color: '#64748b',
    icon: 'layer-group',
    childType: null,
    canEdit: true,
    canDelete: true,
    canAddChild: false,
  },
};

export default defineComponent({
  name: 'PhysicalStructure',

  components: {
    AppBaseList,
    AppLoading,
    AppModal,
    AppConfirmDeleteModal,
    AppIcon,
    AppAccordion,
    AppAccordionItem,
    AppTreeNode,
    PhysicalStructureLevelForm,
  },

  setup() {
    const title = 'Estructura física';
    useMeta({ title });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Recursos físicos académicos', url: '' };
    headerStore.moduleItem = { name: title, url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    // ── State ────────────────────────────────────────────────────────
    const isLoading = ref(true);
    const campuses = ref<PhysicalStructureNodeDto[]>([]);
    const showFormModal = ref(false);
    const showDeleteModal = ref(false);
    const selectedNode = ref<PhysicalStructureNodeDto | null>(null);
    const defaultLevelType = ref('');
    const addParentId = ref<number | null>(null);
    const addChildParentId = ref<number | null>(null);
    const editNodeParentId = ref<number | null>(null);
    const nodeToDeleteId = ref<number | null>(null);
    const nodeToDeleteType = ref('Edificio');
    const nodeToDeleteParentId = ref<number | null>(null);

    const isEditing = computed(() => selectedNode.value !== null);

    // ── fetchChildren passed to AppTreeNode ──────────────────────────
    const fetchChildren = async (node: AppTreeNodeDto): Promise<AppTreeNodeDto[]> => {
      if (node.levelType === 'Campus') return getBuildingsService.run(node.id);
      if (node.levelType === 'Edificio') return getFloorsService.run(node.id);
      return [];
    };

    // ── Dispatch reload to the affected node ─────────────────────────
    const dispatchReload = (parentId: number | null) => {
      if (parentId !== null) {
        window.dispatchEvent(
          new CustomEvent('physicalStructureChildReload', {
            detail: { parentId },
          })
        );
      }
    };

    // ── Data loading ─────────────────────────────────────────────────
    const loadCampuses = async () => {
      try {
        isLoading.value = true;
        campuses.value = await getCampusesService.run();
      } catch (e) {
        console.error('Error cargando campus:', e);
        campuses.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    // ── Modal actions ────────────────────────────────────────────────
    const openAddChildModal = (parent: AppTreeNodeDto, childType: string) => {
      selectedNode.value = null;
      defaultLevelType.value = childType;
      addParentId.value = parent.id;
      addChildParentId.value = parent.id;
      editNodeParentId.value = null;
      showFormModal.value = true;
    };

    const openEditModal = (node: AppTreeNodeDto) => {
      selectedNode.value = node as PhysicalStructureNodeDto;
      defaultLevelType.value = node.levelType;
      addParentId.value = node.parentId;
      editNodeParentId.value = node.parentId;
      addChildParentId.value = null;
      showFormModal.value = true;
    };

    const closeFormModal = () => {
      showFormModal.value = false;
      selectedNode.value = null;
      addParentId.value = null;
    };

    // ── CRUD ─────────────────────────────────────────────────────────
    const handleFormSave = async (form: any) => {
      try {
        const id = selectedNode.value?.id;
        await createOrUpdateNodeService.run(form, id);
        closeFormModal();
        const parentId = isEditing.value ? editNodeParentId.value : addChildParentId.value;
        dispatchReload(parentId);
      } catch (e) {
        console.error('Error guardando nodo:', e);
      }
    };

    const confirmDelete = (node: AppTreeNodeDto) => {
      nodeToDeleteId.value = node.id;
      nodeToDeleteType.value = node.levelType ?? 'Edificio';
      nodeToDeleteParentId.value = node.parentId;
      showDeleteModal.value = true;
    };

    const handleDelete = async () => {
      try {
        if (nodeToDeleteId.value) {
          await deleteNodeService.run(nodeToDeleteId.value, nodeToDeleteType.value);
        }
        showDeleteModal.value = false;
        dispatchReload(nodeToDeleteParentId.value);
        nodeToDeleteId.value = null;
        nodeToDeleteParentId.value = null;
      } catch (e) {
        console.error('Error eliminando nodo:', e);
      }
    };

    onMounted(() => {
      loadCampuses();
    });

    return {
      title,
      isLoading,
      campuses,
      LEVEL_CONFIG,
      fetchChildren,
      showFormModal,
      showDeleteModal,
      selectedNode,
      defaultLevelType,
      addParentId,
      openAddChildModal,
      openEditModal,
      handleFormSave,
      confirmDelete,
      handleDelete,
    };
  },
});
</script>

<style scoped>
.root-accordion :deep(.o-accordion-item) {
  background-color: #f8fafc;
  overflow: hidden;
}
.root-accordion :deep(.o-accordion-body) {
  background-color: #fff;
}

.root-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.75rem;
}
.root-head__left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}
.root-head__icon {
  font-size: 1.25rem;
  color: #64748b;
  flex-shrink: 0;
}
.root-head__texts {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.root-head__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
}
.root-head__sub {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.3;
}

.campus-counter {
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  padding: 0.2rem 0.75rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.nodes-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
