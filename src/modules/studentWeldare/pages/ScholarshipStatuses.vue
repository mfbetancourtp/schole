<template>
  <AppBaseList title="Estados de Becas">
    <template #actions>
      <AppCheckPermission permission="studentWeldare.scholarshipStatuses.create">
        <AppButton outlined variant="light" nativeType="button" @click="onCreate">
          <AppIcon icon="plus" class="ss-btn-icon" />
          Nuevo Estado
        </AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <AppLoading v-if="isLoading" />

      <template v-else>
        <p class="ss-subtitle">Gestiona los diferentes estados del ciclo de vida de una solicitud de beca</p>

        <AppEmptyResponse v-if="!statuses.length" />

        <AppDatatable v-else :data="statuses" name="scholarship-statuses" :paginated="true">
          <AppDatatableColumn label="Código" field="code" :sortable="true" v-slot="{ row }">
            <span class="ss-code">{{ row.code }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn label="Estado" field="name" :sortable="true" v-slot="{ row }">
            <div class="ss-estado">
              <span class="ss-dot" :style="{ background: row.color || '#94a3b8' }" />
              <span class="ss-estado__name">{{ row.name }}</span>
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn label="Descripción" field="description" v-slot="{ row }">
            <span class="ss-desc">{{ row.description }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn label="Estados Siguientes" v-slot="{ row }">
            <span v-if="row.isFinalStatus || !row.nextStatuses || !row.nextStatuses.length" class="ss-final">Estado final</span>
            <div v-else class="ss-chips">
              <span v-for="item in row.nextStatuses" :key="item.id" class="ss-chip" :style="getColorForStatus(item.nextStep.color)">
                {{ item.nextStep.code }}
              </span>
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn label="Vista Previa" v-slot="{ row }">
            <span
              class="ss-preview"
              :style="{
                background: (row.color || '#2563eb') + '20',
                color: row.color || '#2563eb',
              }"
              >{{ row.name }}</span
            >
          </AppDatatableColumn>

          <AppDatatableColumn label="core.actions" :position="'right'" v-slot="{ row }">
            <AppButtonGroup>
              <AppCheckPermission permission="studentWeldare.scholarshipStatuses.edit">
                <AppButtonEdit nativeType="button" @click.stop="onEdit(row)" />
              </AppCheckPermission>
              <AppCheckPermission permission="studentWeldare.scholarshipStatuses.delete">
                <AppButtonDelete nativeType="button" @click.stop="onDelete(row)" />
              </AppCheckPermission>
            </AppButtonGroup>
          </AppDatatableColumn>
        </AppDatatable>
      </template>
    </template>
  </AppBaseList>

  <!-- Create / Edit modal -->
  <ScholarshipStatusDrawer v-if="showDrawer" :isVisible="showDrawer" :mode="drawerMode" :formData="formTarget" :allStatuses="statuses" @update:isVisible="showDrawer = $event" @save="onDrawerSave" />

  <!-- Delete modal -->
  <AppModal v-model="showDeleteModal">
    <AppConfirmDeleteModal v-if="showDeleteModal" entity="estado de beca" @confirmDelete="onConfirmDelete" />
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import ScholarshipStatusDrawer from '../components/ScholarshipStatusDrawer.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import { ToastService } from '../../../shared/services/toast.service';

import type { ScholarshipStatusDto } from '../dtos/scholarshipStatus.dto';
import { BADGE_COLOR_MAP } from '../dtos/scholarshipStatus.dto';
import { GetScholarshipStatusesWithDetailsService } from '../services/getScholarshipStatusesWithDetails.service';
import { CreateOrUpdateScholarshipStatusService } from '../services/createOrUpdateScholarshipStatus.service';
import { DeleteScholarshipStatusService } from '../services/deleteScholarshipStatus.service';
import { GetScholarshipNextStatusesService } from '../services/getScholarshipNextStatuses.service';
import { CreateScholarshipNextStatusService } from '../services/createScholarshipNextStatus.service';
import { DeleteScholarshipNextStatusService } from '../services/deleteScholarshipNextStatus.service';

const toast = new ToastService();
const getScholarshipStatusesService = new GetScholarshipStatusesWithDetailsService();
const createOrUpdateService = new CreateOrUpdateScholarshipStatusService();
const deleteService = new DeleteScholarshipStatusService();
const getNextStatusesService = new GetScholarshipNextStatusesService();
const createNextStatusService = new CreateScholarshipNextStatusService();
const deleteNextStatusService = new DeleteScholarshipNextStatusService();

export default defineComponent({
  name: 'ScholarshipStatuses',
  components: {
    AppBaseList,
    AppLoading,
    AppEmptyResponse,
    AppIcon,
    AppModal,
    AppButton,
    AppButtonGroup,
    AppButtonEdit,
    AppButtonDelete,
    AppDatatable,
    AppDatatableColumn,
    AppConfirmDeleteModal,
    AppCheckPermission,
    ScholarshipStatusDrawer,
  },

  setup() {
    useMeta({ title: 'Estados de Becas' });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Bienestar Estudiantil', url: '' };
    headerStore.moduleItem = { name: 'Estados de Becas', url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const isLoading = ref(true);
    const statuses = ref<ScholarshipStatusDto[]>([]);

    const loadStatuses = async () => {
      try {
        isLoading.value = true;
        const response = await getScholarshipStatusesService.run({
          page: 1,
          perPage: 100,
        });
        statuses.value = response.data || [];
      } catch {
        toast.show('Error al cargar los estados de becas', 'danger');
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      loadStatuses();
    });

    /* Get color for next status chip */
    const getColorForStatus = (hexColor: string) => {
      return {
        background: hexColor + '20', // 20 = ~12% opacity
        color: hexColor,
        borderColor: hexColor,
      };
    };

    /* ── Drawer (create/edit) ── */
    const showDrawer = ref(false);
    const drawerMode = ref<'create' | 'edit'>('create');
    const formTarget = ref<ScholarshipStatusDto | null>(null);
    const previousNextStatusIds = ref<number[]>([]);

    const onCreate = () => {
      formTarget.value = null;
      drawerMode.value = 'create';
      previousNextStatusIds.value = [];
      showDrawer.value = true;
    };

    const onEdit = (item: ScholarshipStatusDto) => {
      formTarget.value = { ...item };
      drawerMode.value = 'edit';
      // Store the current nextStatusIds (cleaned to avoid duplicates)
      const rawIds = (item.nextStatuses || []).map((ns) => ns.nextStep.id);
      previousNextStatusIds.value = [...new Set(rawIds)];
      showDrawer.value = true;
    };

    const onDrawerSave = async (payload: Partial<ScholarshipStatusDto> & { nextStatusIds?: number[] }) => {
      try {
        // Save the scholarship status (without nextStatuses)
        const savedStatus = await createOrUpdateService.run(payload as ScholarshipStatusDto, payload.id);

        // Get the actual status ID from the response (could be in data.id or just id)
        const statusId = payload.id || savedStatus.data?.id || savedStatus.id;

        // Clean duplicates from newNextStatusIds
        const rawNewNextStatusIds = (payload as any).nextStatusIds || [];
        const newNextStatusIds = [...new Set(rawNewNextStatusIds)];

        // Handle next statuses transitions - ONLY if editing
        if (payload.id) {
          // Use the stored previous IDs instead of making a new GET
          const existingNextStatusIds = previousNextStatusIds.value;

          // Compare: find what needs to be deleted and created
          const toDelete = existingNextStatusIds.filter((id: number) => !newNextStatusIds.includes(id));
          const toCreate = newNextStatusIds.filter((id: number) => !existingNextStatusIds.includes(id));

          // ONLY delete if there are transitions to remove
          if (toDelete.length > 0) {
            try {
              const existingTransitionsResponse = await getNextStatusesService.run(payload.id, { noPag: true });

              // The response can be either { data: [...] } or just the array directly
              const existingTransitions = Array.isArray(existingTransitionsResponse) ? existingTransitionsResponse : existingTransitionsResponse?.data || [];

              const transitionsToDelete = existingTransitions.filter((t: any) => toDelete.includes(t.nextStep.id));

              await Promise.all(transitionsToDelete.map((transition: any) => deleteNextStatusService.run(transition.id)));
            } catch {
              // silent — transition delete failure is non-blocking
            }
          }

          // ONLY create if there are new transitions to add
          if (toCreate.length > 0) {
            await Promise.all(
              toCreate.map((nextStepId: number) =>
                createNextStatusService.run({
                  scholarshipStatusId: statusId,
                  nextStepId,
                })
              )
            );
          }
        } else {
          // NEW status: create all selected transitions
          if (newNextStatusIds.length > 0) {
            await Promise.all(
              newNextStatusIds.map((nextStepId: number) =>
                createNextStatusService.run({
                  scholarshipStatusId: statusId,
                  nextStepId,
                })
              )
            );
          }
        }

        await loadStatuses();
        toast.show(payload.id ? 'Estado actualizado correctamente' : 'Estado creado correctamente', 'success');
        showDrawer.value = false;
      } catch {
        toast.show('Error al guardar el estado', 'danger');
      }
    };

    /* ── Delete modal ── */
    const showDeleteModal = ref(false);
    const deleteTarget = ref<ScholarshipStatusDto | null>(null);

    const onDelete = (item: ScholarshipStatusDto) => {
      deleteTarget.value = item;
      showDeleteModal.value = true;
    };

    const onConfirmDelete = async () => {
      if (!deleteTarget.value?.id) return;
      try {
        await deleteService.run(deleteTarget.value.id);
        await loadStatuses();
        toast.show('Estado eliminado correctamente', 'success');
        showDeleteModal.value = false;
        deleteTarget.value = null;
      } catch {
        toast.show('Error al eliminar el estado', 'danger');
      }
    };

    return {
      isLoading,
      statuses,
      colorMap: BADGE_COLOR_MAP,
      getColorForStatus,
      showDrawer,
      drawerMode,
      formTarget,
      onCreate,
      onEdit,
      onDrawerSave,
      showDeleteModal,
      deleteTarget,
      onDelete,
      onConfirmDelete,
    };
  },
});
</script>

<style scoped>
.ss-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: -4px 0 16px;
}

/* Datatable cells */
.ss-code {
  font-size: 12px;
  font-weight: 700;
  color: #dc2626;
}

.ss-estado {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ss-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.ss-estado__name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.ss-desc {
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Chips for next states */
.ss-chips {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.ss-chip {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 4px;
  display: inline-block;
  border: 1px solid;
  border-color: currentColor;
}

.ss-final {
  font-size: 12px;
  font-style: italic;
  color: #94a3b8;
}

/* Status badge */
.ss-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 3px;
}
.ss-badge--active {
  background: #f0fdf4;
  color: #16a34a;
}
.ss-badge--inactive {
  background: #fef2f2;
  color: #dc2626;
}

/* Preview badge */
.ss-preview {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 12px;
  border-radius: 999px;
}

/* Header button icon */
.ss-btn-icon {
  margin-right: 5px;
  font-size: 12px;
}
</style>
