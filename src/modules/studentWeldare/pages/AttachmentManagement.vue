<template>
  <AppBaseList :title="t('studentWelfare.attachmentManagement.title')">
    <template #actions>
      <AppCheckPermission permission="studentWeldare.attachmentManagement.create">
        <AppButton style="color: white" nativeType="button" @click="onCreate">
          <AppIcon icon="plus" class="btn-icon" />
          {{ t('studentWelfare.attachmentManagement.create') }}
        </AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <!-- Page header -->
      <div class="page-header">
        <h1 class="page-header__title">
          {{ t('studentWelfare.attachmentManagement.title') }}
        </h1>
        <p class="page-header__subtitle">
          {{ t('studentWelfare.attachmentManagement.subtitle') }}
        </p>
      </div>

      <!-- Stats -->
      <div class="am-stats" v-if="stats">
        <div class="am-stat am-stat--blue">
          <div class="am-stat__icon-wrap am-stat__icon-wrap--blue">
            <AppIcon icon="file" class="am-stat__icon" />
          </div>
          <div>
            <p class="am-stat__num">{{ stats.total ?? 0 }}</p>
            <p class="am-stat__label">
              {{ t('studentWelfare.attachmentManagement.stats.total') }}
            </p>
          </div>
        </div>
        <div class="am-stat am-stat--green">
          <div class="am-stat__icon-wrap am-stat__icon-wrap--green">
            <AppIcon icon="check-circle" class="am-stat__icon" />
          </div>
          <div>
            <p class="am-stat__num">{{ stats.totalActivos ?? 0 }}</p>
            <p class="am-stat__label">
              {{ t('studentWelfare.attachmentManagement.stats.active') }}
            </p>
          </div>
        </div>
        <div class="am-stat am-stat--red">
          <div class="am-stat__icon-wrap am-stat__icon-wrap--red">
            <AppIcon icon="exclamation-circle" class="am-stat__icon" />
          </div>
          <div>
            <p class="am-stat__num">{{ stats.totalObligatorios ?? 0 }}</p>
            <p class="am-stat__label">
              {{ t('studentWelfare.attachmentManagement.stats.required') }}
            </p>
          </div>
        </div>
        <div class="am-stat am-stat--purple">
          <div class="am-stat__icon-wrap am-stat__icon-wrap--purple">
            <AppIcon icon="file-download" class="am-stat__icon" />
          </div>
          <div>
            <p class="am-stat__num">{{ stats.totalOpcionales ?? 0 }}</p>
            <p class="am-stat__label">
              {{ t('studentWelfare.attachmentManagement.stats.optional') }}
            </p>
          </div>
        </div>
      </div>

      <AppDatatable name="scholarship-documents" :service="getScholarshipDocumentsService">
        <AppDatatableColumn :label="t('studentWelfare.attachmentManagement.columns.code')" field="code" :sortable="true" v-slot="{ row }">
          <span class="am-code">{{ row.code }}</span>
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('studentWelfare.attachmentManagement.columns.name')" field="name" :sortable="true" v-slot="{ row }">
          <p class="am-name">{{ row.name }}</p>
          <p class="am-desc">{{ row.description }}</p>
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('studentWelfare.attachmentManagement.columns.type')" field="abjuntoType" :sortable="true" v-slot="{ row }">
          <span class="am-badge" :class="row.abjuntoType === 'Obligatorio' ? 'am-badge--required' : 'am-badge--optional'">
            {{ row.abjuntoType }}
          </span>
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('studentWelfare.attachmentManagement.columns.status')" field="isActive" v-slot="{ row }">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" :checked="row.isActive" @change="toggleStatus(row)" />
          </div>
        </AppDatatableColumn>

        <AppDatatableColumn label="core.actions" :position="'right'" v-slot="{ row }">
          <AppButtonGroup>
            <AppCheckPermission permission="studentWeldare.attachmentManagement.edit">
              <AppButtonEdit nativeType="button" @click.stop="onEdit(row)" />
            </AppCheckPermission>
            <AppCheckPermission permission="studentWeldare.attachmentManagement.delete">
              <AppButtonDelete nativeType="button" @click.stop="onDelete(row)" />
            </AppCheckPermission>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>
    </template>
  </AppBaseList>

  <!-- Drawer create / edit -->
  <AttachmentTypeDrawer v-if="showDrawer" :isVisible="showDrawer" :mode="drawerMode" :formData="formTarget" @update:isVisible="showDrawer = $event" @save="onDrawerSave" />

  <!-- Delete modal -->
  <AppModal v-model="showDeleteModal">
    <AppConfirmDeleteModal v-if="showDeleteModal" :entity="t('studentWelfare.attachmentManagement.entity')" @confirmDelete="onConfirmDelete" />
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
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

import AttachmentTypeDrawer from '../components/AttachmentTypeDrawer.vue';

import type { AttachmentTypeDto, AttachmentTypeStatsDto } from '../dtos/attachmentType.dto';
import { GetScholarshipDocumentsService } from '../services/getScholarshipDocuments.service';
import { GetScholarshipDocumentsStatsService } from '../services/getScholarshipDocumentsStats.service';
import { CreateOrUpdateScholarshipDocumentService } from '../services/createOrUpdateScholarshipDocument.service';
import { DeleteScholarshipDocumentService } from '../services/deleteScholarshipDocument.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { ToastService } from '../../../shared/services/toast.service';

const getScholarshipDocumentsService = new GetScholarshipDocumentsService();
const getScholarshipDocumentsStatsService = new GetScholarshipDocumentsStatsService();
const createOrUpdateScholarshipDocumentService = new CreateOrUpdateScholarshipDocumentService();
const deleteScholarshipDocumentService = new DeleteScholarshipDocumentService();
const updateDatatableService = new UpdateDatatableService();
const toast = new ToastService();

type DrawerMode = 'create' | 'edit';

export default defineComponent({
  name: 'AttachmentManagement',
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
    AttachmentTypeDrawer,
  },

  setup() {
    const { t } = useI18n();

    useMeta({ title: t('studentWelfare.attachmentManagement.title') });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Bienestar Estudiantil', url: '' };
    headerStore.moduleItem = {
      name: t('studentWelfare.attachmentManagement.title'),
      url: '',
    };
    headerStore.moduleSubItem = { name: '', url: '' };

    const stats = ref<AttachmentTypeStatsDto | null>(null);

    const loadStats = async () => {
      try {
        stats.value = await getScholarshipDocumentsStatsService.run();
      } catch {
        // stats are non-critical
      }
    };

    onMounted(() => {
      loadStats();
    });

    const refreshData = () => {
      updateDatatableService.run();
      loadStats();
    };

    /* ── Drawer ── */
    const showDrawer = ref(false);
    const drawerMode = ref<DrawerMode>('create');
    const formTarget = ref<AttachmentTypeDto | null>(null);

    const onCreate = () => {
      formTarget.value = null;
      drawerMode.value = 'create';
      showDrawer.value = true;
    };

    const onEdit = (item: AttachmentTypeDto) => {
      formTarget.value = item;
      drawerMode.value = 'edit';
      showDrawer.value = true;
    };

    const onDrawerSave = async (form: Omit<AttachmentTypeDto, 'id'>) => {
      try {
        await createOrUpdateScholarshipDocumentService.run(form, formTarget.value?.id);
        showDrawer.value = false;
        refreshData();
      } catch (e) {
        toast.show('Error al guardar el tipo de adjunto', 'danger');
      }
    };

    const toggleStatus = async (item: AttachmentTypeDto) => {
      try {
        await createOrUpdateScholarshipDocumentService.run({ ...item, isActive: !item.isActive }, item.id);
        refreshData();
      } catch (e) {
        toast.show('Error al cambiar el estado', 'danger');
      }
    };

    /* ── Delete modal ── */
    const showDeleteModal = ref(false);
    const deleteTarget = ref<AttachmentTypeDto | null>(null);

    const onDelete = (item: AttachmentTypeDto) => {
      deleteTarget.value = item;
      showDeleteModal.value = true;
    };

    const onConfirmDelete = async () => {
      if (!deleteTarget.value) return;
      try {
        await deleteScholarshipDocumentService.run(deleteTarget.value.id);
        showDeleteModal.value = false;
        deleteTarget.value = null;
        refreshData();
      } catch (e) {
        toast.show('Error al eliminar el tipo de adjunto', 'danger');
      }
    };

    return {
      t,
      stats,
      getScholarshipDocumentsService,
      showDrawer,
      drawerMode,
      formTarget,
      onCreate,
      onEdit,
      onDrawerSave,
      toggleStatus,
      showDeleteModal,
      onDelete,
      onConfirmDelete,
    };
  },
});
</script>

<style scoped>
/* ── Page header ── */
.page-header {
  padding: 0.75rem 1.5rem 0.5rem;
}

.page-header__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.2rem;
}

.page-header__subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

/* ── Button icon spacing ── */
.btn-icon {
  margin-right: 4px;
  font-size: 12px;
}

/* ── Stats ── */
.am-stats {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  padding: 0 1.5rem 1rem;
}

.am-stat {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 130px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 18px;
}

.am-stat__icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.am-stat__icon-wrap--blue {
  background: #eff6ff;
}
.am-stat__icon-wrap--green {
  background: #f0fdf4;
}
.am-stat__icon-wrap--red {
  background: #fef2f2;
}
.am-stat__icon-wrap--purple {
  background: #faf5ff;
}

.am-stat--blue .am-stat__icon {
  color: #2563eb;
  font-size: 16px;
}
.am-stat--green .am-stat__icon {
  color: #16a34a;
  font-size: 16px;
}
.am-stat--red .am-stat__icon {
  color: #dc2626;
  font-size: 16px;
}
.am-stat--purple .am-stat__icon {
  color: #9333ea;
  font-size: 16px;
}

.am-stat__num {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1;
}

.am-stat__label {
  font-size: 11px;
  color: #64748b;
  margin: 3px 0 0;
}

/* ── Datatable cells ── */
.am-code {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.am-name {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.am-desc {
  font-size: 11px;
  color: #2563eb;
  margin: 2px 0 0;
}

/* ── Badges ── */
.am-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
}

.am-badge--required {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.am-badge--optional {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

/* ── Toggle switch ── */
.form-check-input {
  width: 2.5em;
  height: 1.25em;
  cursor: pointer;
}

.form-check-input:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}
</style>
