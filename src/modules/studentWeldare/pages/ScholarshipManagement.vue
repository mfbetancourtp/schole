<template>
  <AppBaseList title="Gestión de Becas">
    <template #actions>
      <AppCheckPermission permission="studentWeldare.scholarshipManagement.create">
        <AppButton variant="light" nativeType="button" @click="onCreate">
          <AppIcon icon="plus" class="sm-btn-icon" />
          Nueva Beca
        </AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <p class="sm-title">Gestión de Becas</p>
      <p class="sm-subtitle">Administra los parámetros, requisitos y reglas de cada beca institucional</p>

      <!-- Section header -->
      <p class="sm-list-title">Becas Configuradas</p>

      <!-- Stats cards -->
      <div class="sm-stats">
        <div class="sm-stat sm-stat--purple">
          <div class="sm-stat__icon-wrap">
            <AppIcon icon="graduation-cap" class="sm-stat__icon" />
          </div>
          <div>
            <p class="sm-stat__num">{{ summary.total }}</p>
            <p class="sm-stat__label">Total Becas</p>
          </div>
        </div>
        <div class="sm-stat sm-stat--green">
          <div class="sm-stat__icon-wrap sm-stat__icon-wrap--green">
            <AppIcon icon="chart-line" class="sm-stat__icon" />
          </div>
          <div>
            <p class="sm-stat__num">{{ summary.totalActiva }}</p>
            <p class="sm-stat__label">Activas</p>
          </div>
        </div>
        <div class="sm-stat sm-stat--blue">
          <div class="sm-stat__icon-wrap sm-stat__icon-wrap--blue">
            <AppIcon icon="users" class="sm-stat__icon" />
          </div>
          <div>
            <p class="sm-stat__num">{{ summary.totalCapacity }}</p>
            <p class="sm-stat__label">Cupos Totales</p>
          </div>
        </div>
        <div class="sm-stat sm-stat--orange">
          <div class="sm-stat__icon-wrap sm-stat__icon-wrap--orange">
            <AppIcon icon="calendar" class="sm-stat__icon" />
          </div>
          <div>
            <p class="sm-stat__num">{{ summary.totalBorrador }}</p>
            <p class="sm-stat__label">Borrador</p>
          </div>
        </div>
      </div>

      <!-- Datatable -->
      <AppDatatable name="scholarship-management" :service="getSettingsService" :params="{ order: 'DESC' }">
        <AppDatatableColumn label="Código" field="code" :sortable="true" v-slot="{ row }">
          <span class="sm-code">{{ row.code }}</span>
        </AppDatatableColumn>

        <AppDatatableColumn label="Nombre" field="name" :sortable="true" v-slot="{ row }">
          <p class="sm-name">{{ row.name }}</p>
          <p class="sm-program">
            {{ getScholarshipScope(row) }}
          </p>
        </AppDatatableColumn>

        <AppDatatableColumn label="Tipo" field="typeScholarship" :sortable="false" v-slot="{ row }">
          <span class="sm-type">{{ row.typeScholarship?.name ?? '—' }}</span>
        </AppDatatableColumn>

        <AppDatatableColumn label="Periodo" field="academicPeriod" :sortable="false" v-slot="{ row }">
          {{ row.academicPeriod?.name ?? '—' }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Cupos" field="capacity" :sortable="true" v-slot="{ row }">
          {{ row.capacity }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Cobertura" field="percentage" :sortable="true" v-slot="{ row }"> {{ row.percentage }}% </AppDatatableColumn>

        <AppDatatableColumn label="Estado" field="statusScholarship" :sortable="true" v-slot="{ row }">
          <span class="sm-badge" :class="getStatusClass(row.statusScholarship)">
            {{ row.statusScholarship }}
          </span>
        </AppDatatableColumn>

        <AppDatatableColumn label="core.actions" :position="'right'" v-slot="{ row }">
          <AppButtonGroup>
            <AppCheckPermission permission="studentWeldare.scholarshipManagement.edit">
              <AppButtonEdit nativeType="button" @click.stop="onEdit(row)" />
            </AppCheckPermission>
            <AppCheckPermission permission="studentWeldare.scholarshipManagement.create">
              <AppButton variant="secondary" outlined icon="copy" nativeType="button" v-tooltip="'Duplicar'" @click.stop="onDuplicate(row)" />
            </AppCheckPermission>
            <AppCheckPermission permission="studentWeldare.scholarshipManagement.delete">
              <AppButtonDelete nativeType="button" @click.stop="onDelete(row)" />
            </AppCheckPermission>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>
    </template>
  </AppBaseList>

  <!-- Create / Edit drawer -->
  <ScholarshipSettingDrawer v-if="showDrawer" :isVisible="showDrawer" :mode="drawerMode" :formData="formTarget" @update:isVisible="showDrawer = $event" @save="onDrawerSave" />

  <!-- Delete confirm modal -->
  <AppModal v-model="showDeleteModal">
    <AppConfirmDeleteModal v-if="showDeleteModal && deleteTarget" entity="esta beca" @confirmDelete="onConfirmDelete" />
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import ScholarshipSettingDrawer from '../components/ScholarshipSettingDrawer.vue';
import type { ScholarshipSettingDto, CreateOrUpdateScholarshipSettingDto, ScholarshipSettingSummaryDto } from '../dtos/scholarshipConfig.dto';
import { GetScholarshipSettingsService } from '../services/getScholarshipSettings.service';
import { GetScholarshipSettingsSummaryService } from '../services/getScholarshipSettingsSummary.service';
import { CreateOrUpdateScholarshipSettingService } from '../services/createOrUpdateScholarshipSetting.service';
import { DeleteScholarshipSettingService } from '../services/deleteScholarshipSetting.service';
import { DuplicateScholarshipSettingService } from '../services/duplicateScholarshipSetting.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { ToastService } from '../../../shared/services/toast.service';

const getSettingsService = new GetScholarshipSettingsService();
const getSummaryService = new GetScholarshipSettingsSummaryService();
const createOrUpdateService = new CreateOrUpdateScholarshipSettingService();
const deleteSettingService = new DeleteScholarshipSettingService();
const duplicateSettingService = new DuplicateScholarshipSettingService();
const updateDatatableService = new UpdateDatatableService();
const toast = new ToastService();

export default defineComponent({
  name: 'ScholarshipManagement',
  components: {
    AppBaseList,
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
    ScholarshipSettingDrawer,
  },

  setup() {
    useMeta({ title: 'Gestión de Becas' });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Bienestar Estudiantil', url: '' };
    headerStore.moduleItem = { name: 'Gestión de Becas', url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const summary = reactive<ScholarshipSettingSummaryDto>({
      total: 0,
      totalActiva: 0,
      totalBorrador: 0,
      totalCapacity: 0,
    });

    const loadSummary = async () => {
      try {
        const summaryRes = await getSummaryService.run();
        Object.assign(summary, summaryRes ?? {});
      } catch (e) {
        console.error('Error al cargar el resumen de becas:', e);
      }
    };

    const refreshData = () => {
      updateDatatableService.run();
      loadSummary();
    };

    onMounted(() => {
      loadSummary();
    });

    const getStatusClass = (status: string) => {
      if (status === 'Activa') return 'sm-badge--active';
      if (status === 'Cerrado') return 'sm-badge--closed';
      return 'sm-badge--draft';
    };

    const getScholarshipScope = (row: ScholarshipSettingDto): string => {
      if (row.programs && row.programs.length > 0) {
        const first = row.programs[0].program.name;
        return row.programs.length > 1 ? `${first} +${row.programs.length - 1}` : first;
      }
      if (row.faculties && row.faculties.length > 0) {
        const first = row.faculties[0].faculty.name;
        return row.faculties.length > 1 ? `${first} +${row.faculties.length - 1}` : first;
      }
      return row.academicLevel?.name ?? '—';
    };

    /* ── Drawer (create / edit) ── */
    const showDrawer = ref(false);
    const drawerMode = ref<'create' | 'edit'>('create');
    const formTarget = ref<ScholarshipSettingDto | null>(null);

    const onCreate = () => {
      formTarget.value = null;
      drawerMode.value = 'create';
      showDrawer.value = true;
    };

    const onEdit = (item: ScholarshipSettingDto) => {
      formTarget.value = { ...item };
      drawerMode.value = 'edit';
      showDrawer.value = true;
    };

    const onDrawerSave = async (payload: CreateOrUpdateScholarshipSettingDto & { id?: number }) => {
      try {
        const { id, ...data } = payload;
        await createOrUpdateService.run(data, id);
        showDrawer.value = false;
        refreshData();
      } catch (e) {
        toast.show('Error al guardar la beca', 'danger');
      }
    };

    /* ── Duplicate ── */
    const onDuplicate = async (item: ScholarshipSettingDto) => {
      try {
        await duplicateSettingService.run(item.id);
        refreshData();
      } catch (e) {
        toast.show('Error al duplicar la beca', 'danger');
      }
    };

    /* ── Delete ── */
    const showDeleteModal = ref(false);
    const deleteTarget = ref<ScholarshipSettingDto | null>(null);

    const onDelete = (item: ScholarshipSettingDto) => {
      deleteTarget.value = item;
      showDeleteModal.value = true;
    };

    const onConfirmDelete = async () => {
      if (!deleteTarget.value) return;
      try {
        await deleteSettingService.run(deleteTarget.value.id);
        showDeleteModal.value = false;
        deleteTarget.value = null;
        refreshData();
      } catch (e) {
        toast.show('Error al eliminar la beca', 'danger');
      }
    };

    return {
      getSettingsService,
      summary,
      showDrawer,
      drawerMode,
      formTarget,
      onCreate,
      onEdit,
      onDuplicate,
      onDrawerSave,
      showDeleteModal,
      deleteTarget,
      onDelete,
      onConfirmDelete,
      getStatusClass,
      getScholarshipScope,
    };
  },
});
</script>

<style scoped>
/* Title */
.sm-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

/* Subtitle */
.sm-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 18px;
}

/* Stats */
.sm-stats {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}

.sm-stat {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 140px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 18px;
}

.sm-stat__icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f3ff;
  flex-shrink: 0;
}

.sm-stat__icon-wrap--green {
  background: #f0fdf4;
}
.sm-stat__icon-wrap--blue {
  background: #eff6ff;
}
.sm-stat__icon-wrap--orange {
  background: #fff7ed;
}

.sm-stat--purple .sm-stat__icon {
  color: #7c3aed;
}
.sm-stat--green .sm-stat__icon {
  color: #16a34a;
}
.sm-stat--blue .sm-stat__icon {
  color: #2563eb;
}
.sm-stat--orange .sm-stat__icon {
  color: #ea580c;
}

.sm-stat__icon {
  font-size: 18px;
}

.sm-stat__num {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1;
}

.sm-stat__label {
  font-size: 11px;
  color: #64748b;
  margin: 3px 0 0;
}

/* Section title */
.sm-list-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 14px;
}

/* Datatable cells */
.sm-code {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.sm-name {
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
  margin: 0;
}

.sm-program {
  font-size: 11px;
  color: #94a3b8;
  margin: 2px 0 0;
}

.sm-type {
  font-size: 13px;
  color: #374151;
}

/* Status badge */
.sm-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 12px;
  border-radius: 999px;
}

.sm-badge--active {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.sm-badge--draft {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.sm-badge--closed {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

/* Header button icon */
.sm-btn-icon {
  margin-right: 5px;
  font-size: 12px;
}
</style>
