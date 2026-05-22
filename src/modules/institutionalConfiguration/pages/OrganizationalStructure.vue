<template>
  <AppBaseList :title="title">
    <AppLoading v-if="loading"></AppLoading>
    <template #actions>
      <!-- HEADER -->
      <header class="org-header">
        <div class="content-buttons">
          <AppButton class="btn" :class="{ active: viewMode === 'org' }" @click="viewMode = 'org'" variant="primary" label=" Vista Organigrama" style="color: white"> </AppButton>

          <AppButton class="btn" :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'" variant="primary" label=" Vista Tabla" style="color: white"> </AppButton>

          <AppButton class="btn" variant="primary" @click="addRoot" label="+ Nueva sede" style="color: white"> </AppButton>
        </div>
      </header>
    </template>

    <template #content>
      <div class="org-page">
        <!-- ================= ORGANIGRAMA ================= -->
        <section v-if="viewMode === 'org'" class="org-canvas">
          <!-- NUEVO: Resumen de responsables separado del diagrama -->

          <VueFlow
            v-model:nodes="nodes"
            v-model:edges="edges"
            :fit-view-on-init="true"
            :zoom-on-scroll="true"
            :pan-on-drag="true"
            :min-zoom="0.2"
            :max-zoom="2.5"
            :snap-to-grid="true"
            :snap-grid="[16, 16]"
            :default-viewport="{ x: 0, y: 0, zoom: 0.9 }"
          >
            <Background pattern="dots" :gap="18" :size="1" />
            <MiniMap />
            <Controls />
            <template #node-orgUnit="{ id, data, selected }">
              <div class="org-node" :class="{ selected }" @mouseenter="hoveredNodeId = id" @mouseleave="hoveredNodeId = null">
                <div class="org-node__content">
                  <AppAvatar :avatar="data.userAvatar" :name="data.userName" size="md" />

                  <div class="org-node__info">
                    <strong class="org-node__title">{{ data.unitName }}</strong>
                    <small class="org-node__director">
                      {{ data.userName || 'Sin director asignado' }}
                    </small>
                  </div>
                </div>

                <NodeToolbar :is-visible="selected">
                  <AppCheckPermission permission="institutionalConfiguration.organizationalStructure.create">
                    <AppButton v-if="canCreateChild(data.entityType)" @click.stop="addChild(id)" v-tooltip="getCreateTooltip(data.entityType)" variant="primary" outlined icon="plus" />
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.organizationalStructure.edit">
                    <AppButtonEdit @click.stop="openEdit(id)" />
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.organizationalStructure.delete">
                    <AppButtonDelete @click.stop="openDeleteModal(id)" />
                  </AppCheckPermission>
                </NodeToolbar>
              </div>
            </template>
          </VueFlow>
        </section>

        <!-- ================= TABLA / ÁRBOL ================= -->
        <section v-else class="org-table">
          <OrganizationalStructureTreeRow v-for="unit in orgTree" :key="unit.id" :unit="unit" :level="0" @add-child="addChild" @edit="openEdit" @remove="openDeleteModal" />
        </section>

        <!-- ================= MODAL ================= -->
        <AppModal v-model="organitationsModal">
          <OrganizationalForm v-if="organitationsModal" :data="currentSubject" @close="closeOrganitationModal" @submit="handleSubmitOrganization" />
        </AppModal>
        <!-- Modal de confirmación para eliminar -->

        <AppModal v-model="showDeleteModal">
          <AppConfirmDeleteModal v-if="showDeleteModal" :entity="currentEntity?.name" @confirmDelete="confirmDelete" @close="closeDeleteModal" />
        </AppModal>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { VueFlow, type Node, type Edge } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import { Controls } from '@vue-flow/controls';
import { NodeToolbar } from '@vue-flow/node-toolbar';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import dagreImport from 'dagre';

import { useHeaderStore } from '../../../stores/header.store';

import OrganizationalStructureTreeRow from '../components/OrganizationalStructureTreeRow.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import OrganizationalForm from '../../academicPrograms/components/OrganizationalForm.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';

import { GetOrganizationsCampusesService } from '../services/getOrganizationsCampuses.service';
import { CreateOrUpdateCampusesService } from '../services/createOrUpdateCampuses.service';
import { CreateOrUpdateFacultiesService } from '../services/createOrUpdateFaculties.service';
import { CreateOrUpdateDepartmentsService } from '../services/createOrUpdateDepartments.service';
import { CreateOrUpdateProgramsService } from '../services/createOrUpdatePrograms.service';
import { DeleteCampusesService } from '../services/deleteCampuses.service';
import { DeleteFacultiesService } from '../services/deleteFaculties.service';
import { DeleteDepartmentsService } from '../services/deleteDepartments.service';
import { DeleteProgramsService } from '../services/deletePrograms.service';
import AppAvatar from '../../../shared/components/AppAvatar.vue';

const getOrganizationsCampusesService = new GetOrganizationsCampusesService();
const createOrUpdateCampusesService = new CreateOrUpdateCampusesService();
const createOrUpdateFacultiesService = new CreateOrUpdateFacultiesService();
const createOrUpdateDepartmentsService = new CreateOrUpdateDepartmentsService();
const createOrUpdateProgramsService = new CreateOrUpdateProgramsService();
const deleteCampusesService = new DeleteCampusesService();
const deleteFacultiesService = new DeleteFacultiesService();
const deleteDepartmentsService = new DeleteDepartmentsService();
const deleteProgramsService = new DeleteProgramsService();

type OrgEntityType = 'campus' | 'faculty' | 'department' | 'program';
type OrgTypeCode = 'S' | 'F' | 'D' | 'P';

const ENTITY_LABELS: Record<OrgEntityType, string> = {
  campus: 'sede',
  faculty: 'facultad',
  department: 'departamento',
  program: 'programa',
};

const TYPE_CODE_TO_ENTITY: Record<OrgTypeCode, OrgEntityType> = {
  S: 'campus',
  F: 'faculty',
  D: 'department',
  P: 'program',
};

const ENTITY_TYPE_TO_CODE: Record<OrgEntityType, OrgTypeCode> = {
  campus: 'S',
  faculty: 'F',
  department: 'D',
  program: 'P',
};

const NEXT_ENTITY_BY_TYPE: Record<OrgEntityType, OrgEntityType | null> = {
  campus: 'faculty',
  faculty: 'department',
  department: 'program',
  program: null,
};

export interface OrgType {
  id?: number;
  name?: string;
  code?: string;
  description?: string | null;
}

export interface OrgUnitTree {
  id: string; // id único para UI
  backendId: number; // id real del backend
  entityType?: OrgEntityType | null;
  name: string;
  code?: string;
  description?: string;
  organizationType?: OrgType | null;
  roleId?: number | null;
  userId?: number | null;
  roleName?: string | null;
  userName?: string | null;
  userAvatar?: string | null;
  parentId: string | null;
  children: OrgUnitTree[];
}

type OrgFormModel = {
  mode: 'create' | 'edit';
  uiId?: string;
  entityType: OrgEntityType;
  entityLabel: string;
  name: string;
  code: string;
  description: string;
  parentId: string | null;
  directorUserId?: number | null;
};

export default defineComponent({
  name: 'OrganizationalStructure',
  components: {
    VueFlow,
    Background,
    MiniMap,
    Controls,
    NodeToolbar,
    OrganizationalStructureTreeRow,
    AppBaseList,
    AppLoading,
    AppModal,
    OrganizationalForm,
    AppConfirmDeleteModal,
    AppButton,
    AppCheckPermission,
    AppButtonEdit,
    AppButtonDelete,
    AppAvatar,
  },

  setup() {
    const { t } = useI18n();
    const dagre: any = (dagreImport as any)?.default ?? dagreImport;
    const title = 'core.menu.institutionalConfigurationOrganizationalStructure';
    const headerStore = useHeaderStore();

    useMeta({ title: t(title) });

    const loading = ref(true);
    const viewMode = ref<'org' | 'table'>('org');

    const orgTree = ref<OrgUnitTree[]>([]);
    const nodes = ref<Node[]>([]);
    const edges = ref<Edge[]>([]);
    const hoveredNodeId = ref<string | null>(null);

    const organitationsModal = ref(false);
    const showDeleteModal = ref(false);

    const currentEntity = ref<{ id: string; name: string } | null>(null);

    const currentSubject = ref<OrgFormModel>({
      mode: 'create',
      uiId: undefined,
      entityType: 'campus',
      entityLabel: ENTITY_LABELS.campus,
      name: '',
      code: '',
      description: '',
      parentId: null,
      directorUserId: null,
    });

    const resetCurrentSubject = (overrides?: Partial<OrgFormModel>) => {
      currentSubject.value = {
        mode: 'create',
        uiId: undefined,
        entityType: 'campus',
        entityLabel: ENTITY_LABELS.campus,
        name: '',
        code: '',
        description: '',
        parentId: null,
        directorUserId: null,
        ...overrides,
      };
    };

    const openOrganitationModal = () => {
      organitationsModal.value = true;
    };

    const closeOrganitationModal = () => {
      organitationsModal.value = false;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      currentEntity.value = null;
    };

    const buildDirectorName = (item: any) => {
      const fullName = [item?.director?.people?.names ?? '', item?.director?.people?.lastnames ?? ''].filter(Boolean).join(' ').trim();

      return fullName;
    };
    const buildDirectorAvatar = (item: any) => {
      return item?.director?.avatar ?? null;
    };
    const buildUiNodeId = (item: any, parentId: string | null, index: number) => {
      const typeCode = item?.organizationType?.code || item?.organizationTypeId || 'node';
      return `${parentId ?? 'root'}-${typeCode}-${item.id}-${index}`;
    };

    const resolveTypeCode = (organizationType?: OrgType | null): OrgTypeCode | null => {
      const code = String(organizationType?.code ?? '')
        .trim()
        .toUpperCase();

      if (code === 'S' || code === 'F' || code === 'D' || code === 'P') {
        return code;
      }

      return null;
    };

    const getEntityTypeByLevel = (level?: number): OrgEntityType | null => {
      if (level === 0) return 'campus';
      if (level === 1) return 'faculty';
      if (level === 2) return 'department';
      if (level === 3) return 'program';
      return null;
    };

    const resolveEntityType = (organizationType?: OrgType | null, level?: number): OrgEntityType | null => {
      const typeCode = resolveTypeCode(organizationType);

      if (typeCode) {
        return TYPE_CODE_TO_ENTITY[typeCode];
      }

      return getEntityTypeByLevel(level);
    };

    const getTypeCode = (entityType?: OrgEntityType | null, organizationType?: OrgType | null): OrgTypeCode | null => {
      const typeCode = resolveTypeCode(organizationType);
      if (typeCode) return typeCode;
      if (!entityType) return null;
      return ENTITY_TYPE_TO_CODE[entityType];
    };

    const getEntityLabel = (entityType?: OrgEntityType | null) => {
      if (!entityType) return 'unidad';
      return ENTITY_LABELS[entityType];
    };

    const getNextEntityType = (entityType?: OrgEntityType | null): OrgEntityType | null => {
      if (!entityType) return null;
      return NEXT_ENTITY_BY_TYPE[entityType] ?? null;
    };

    const canCreateChild = (entityType?: OrgEntityType | null) => {
      return Boolean(getNextEntityType(entityType));
    };

    const getCreateTooltip = (entityType?: OrgEntityType | null) => {
      const nextEntityType = getNextEntityType(entityType);
      return nextEntityType ? `Crear ${getEntityLabel(nextEntityType)}` : '';
    };
    const mapBackendTreeToUiTree = (items: any[] = [], parentId: string | null = null, level = 0): OrgUnitTree[] => {
      return items.map((item, index) => {
        const uiId = buildUiNodeId(item, parentId, index);
        const entityType = resolveEntityType(item.organizationType, level);

        return {
          id: uiId,
          backendId: Number(item.id),
          entityType,
          name: item.name ?? '',
          code: item.code ?? '',
          description: item.description ?? '',
          organizationType: item.organizationType ?? null,
          roleId: item.roleId ?? null,
          userId: item.directorUserId ?? item.userId ?? null,
          roleName: item.role?.name ?? 'Director',
          userName: buildDirectorName(item),
          userAvatar: buildDirectorAvatar(item),
          parentId,
          children: mapBackendTreeToUiTree(item.children ?? [], uiId, level + 1),
        };
      });
    };

    const findUnitById = (list: OrgUnitTree[], id: string): OrgUnitTree | null => {
      for (const item of list) {
        if (item.id === id) return item;
        const childFound = findUnitById(item.children, id);
        if (childFound) return childFound;
      }
      return null;
    };

    const applyLayout = (flowNodes: Node[], flowEdges: Edge[]) => {
      const graph = new dagre.graphlib.Graph();

      graph.setGraph({
        rankdir: 'TB',
        ranksep: 80,
        nodesep: 40,
      });

      graph.setDefaultEdgeLabel(() => ({}));

      flowNodes.forEach((node) => {
        graph.setNode(node.id, { width: 220, height: 100 });
      });

      flowEdges.forEach((edge) => {
        graph.setEdge(edge.source, edge.target);
      });

      dagre.layout(graph);

      flowNodes.forEach((node) => {
        const position = graph.node(node.id);
        node.position = {
          x: position.x - 110,
          y: position.y - 50,
        };
      });
    };

    const buildFlow = () => {
      const flowNodes: Node[] = [];
      const flowEdges: Edge[] = [];

      const traverse = (list: OrgUnitTree[], parentId?: string) => {
        list.forEach((item) => {
          flowNodes.push({
            id: item.id,
            type: 'orgUnit',
            data: {
              unitName: item.name,
              label: item.name,
              roleName: item.roleName,
              userName: item.userName,
              userAvatar: item.userAvatar,
              roleId: item.roleId,
              userId: item.userId,
              backendId: item.backendId,
              entityType: item.entityType,
              typeCode: getTypeCode(item.entityType, item.organizationType),
            },
            position: { x: 0, y: 0 },
          });

          if (parentId) {
            flowEdges.push({
              id: `e-${parentId}-${item.id}`,
              source: parentId,
              target: item.id,
            });
          }

          if (item.children?.length) {
            traverse(item.children, item.id);
          }
        });
      };

      traverse(orgTree.value);
      applyLayout(flowNodes, flowEdges);

      nodes.value = flowNodes;
      edges.value = flowEdges;
    };

    const loadOrganizations = async () => {
      loading.value = true;

      try {
        const response = await getOrganizationsCampusesService.run();
        orgTree.value = mapBackendTreeToUiTree(response?.data ?? []);
        buildFlow();
      } catch (error) {
        console.error('Error loading organizations', error);
        orgTree.value = [];
        nodes.value = [];
        edges.value = [];
      } finally {
        loading.value = false;
      }
    };

    const addRoot = () => {
      resetCurrentSubject({
        mode: 'create',
        entityType: 'campus',
        entityLabel: ENTITY_LABELS.campus,
        parentId: null,
      });
      openOrganitationModal();
    };

    const addChild = (parentId: string) => {
      const parentUnit = findUnitById(orgTree.value, parentId);
      const nextEntityType = getNextEntityType(parentUnit?.entityType);

      if (!nextEntityType) return;

      resetCurrentSubject({
        mode: 'create',
        entityType: nextEntityType,
        entityLabel: getEntityLabel(nextEntityType),
        parentId,
      });
      openOrganitationModal();
    };

    const openEdit = (id: string) => {
      const unit = findUnitById(orgTree.value, id);
      if (!unit) return;

      const entityType = unit.entityType ?? null;
      if (!entityType) return;

      currentSubject.value = {
        mode: 'edit',
        uiId: unit.id,
        entityType,
        entityLabel: getEntityLabel(entityType),
        name: unit.name ?? '',
        code: unit.code ?? '',
        description: unit.description ?? '',
        parentId: unit.parentId,
        directorUserId: unit.userId ?? null,
      };

      openOrganitationModal();
    };

    const handleSubmitOrganization = async (form: OrgFormModel) => {
      try {
        if (!form.directorUserId) return;

        const parentUnit = form.parentId ? findUnitById(orgTree.value, form.parentId) : null;
        const parentBackendId = parentUnit?.backendId ?? null;
        let currentBackendId: number | undefined;

        if (form.mode === 'edit' && form.uiId) {
          const currentUnit = findUnitById(orgTree.value, form.uiId);
          if (currentUnit?.backendId) {
            currentBackendId = currentUnit.backendId;
          }
        }

        const basePayload = {
          name: form.name.trim(),
          code: form.code.trim(),
          directorUserId: Number(form.directorUserId),
        };

        switch (form.entityType) {
          case 'campus':
            await createOrUpdateCampusesService.run(
              {
                ...basePayload,
                description: form.description?.trim() || '',
              },
              currentBackendId
            );
            break;
          case 'faculty':
            if (!parentBackendId) return;

            await createOrUpdateFacultiesService.run(
              {
                ...basePayload,
                description: form.description?.trim() || '',
                campusIds: [parentBackendId],
              },
              currentBackendId
            );
            break;
          case 'department':
            if (!parentBackendId) return;

            await createOrUpdateDepartmentsService.run(
              {
                ...basePayload,
                description: form.description?.trim() || '',
                facultyId: parentBackendId,
              },
              currentBackendId
            );
            break;
          case 'program':
            if (!parentBackendId) return;

            await createOrUpdateProgramsService.run(
              {
                ...basePayload,
                description: form.description?.trim() || '',
                departmentId: parentBackendId,
              },
              currentBackendId
            );
            break;
        }

        closeOrganitationModal();
        await loadOrganizations();
      } catch (error) {
        console.error('Error saving organization', error);
      }
    };

    const openDeleteModal = (id: string) => {
      const unit = findUnitById(orgTree.value, id);

      currentEntity.value = {
        id,
        name: unit?.name ?? 'Unidad',
      };

      showDeleteModal.value = true;
    };

    const confirmDelete = async () => {
      try {
        if (!currentEntity.value?.id) return;

        const unit = findUnitById(orgTree.value, currentEntity.value.id);
        if (!unit?.backendId) return;

        const entityType = unit.entityType ?? null;
        if (!entityType) return;

        switch (entityType) {
          case 'campus':
            await deleteCampusesService.run(unit.backendId);
            break;
          case 'faculty':
            await deleteFacultiesService.run(unit.backendId);
            break;
          case 'department':
            await deleteDepartmentsService.run(unit.backendId);
            break;
          case 'program':
            await deleteProgramsService.run(unit.backendId);
            break;
        }

        closeDeleteModal();
        await loadOrganizations();
      } catch (error) {
        console.error('Error deleting organization', error);
      }
    };

    onMounted(async () => {
      headerStore.module = { name: 'Configuración institucional', url: '' };
      headerStore.moduleItem = { name: title, url: '' };
      headerStore.moduleSubItem = { name: '', url: '' };

      await loadOrganizations();
    });

    return {
      title,
      t,
      loading,
      viewMode,
      orgTree,
      nodes,
      edges,
      hoveredNodeId,
      organitationsModal,
      showDeleteModal,
      currentEntity,
      currentSubject,
      addRoot,
      addChild,
      openEdit,
      openDeleteModal,
      closeDeleteModal,
      openOrganitationModal,
      closeOrganitationModal,
      canCreateChild,
      getCreateTooltip,
      handleSubmitOrganization,
      confirmDelete,
    };
  },
});
</script>

<style scoped>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/minimap/dist/style.css';
@import '@vue-flow/controls/dist/style.css';

/* (igual que tu css anterior) */
.org-page {
  padding: 16px;
}
.org-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.content-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.org-actions {
  display: flex;
  gap: 8px;
}
.btn:focus {
  outline: none;
  box-shadow: none;
}
.btn.active {
  color: White;
  background: var(--color-secondary);
  /* background-color: var(--color-primary); */
}

.org-canvas {
  /* height: calc(100vh - 140px); */
  height: calc(100vh - 281px);
  border: 1px solid #eaeaea;
  border-radius: 18px;
  margin-top: 12px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.02), transparent);
  overflow: hidden;
}

.org-node__title {
  display: block;
  font-size: 14px;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}
.org-node__meta {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
}

.org-node {
  width: 280px;
  padding: 14px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.org-node.selected {
  border-color: var(--color-primary);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
}

.org-node__content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.org-node__info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  align-items: center;
}

.org-node__title {
  display: block;
  font-size: 14px;
  line-height: 1.25;
  font-weight: 700;
  color: #111827;
  word-break: break-word;
}

.org-node__director {
  display: block;
  font-size: 12px;
  line-height: 1.2;
  color: #6b7280;
  word-break: break-word;
}
</style>
