<template>
  <AppBaseList title="Escalas de Evaluación">
    <template #actions>
      <AppButton style="color: white" @click="navigateToCreate">
        <AppIcon icon="plus" />
        Crear Escala
      </AppButton>
    </template>

    <template #content>
      <AppDatatable :service="getScalesService" name="assessment-scales" :refresh-btn="true" :defaultSortDirection="'ASC'">
        <AppDatatableColumn label="Nombre" field="name" :sortable="true" v-slot="{ row }">
          <span class="fw-semibold">{{ row.name }}</span>
        </AppDatatableColumn>

        <AppDatatableColumn label="Descripción" field="description" v-slot="{ row }">
          <span class="text-muted">{{ row.description || '—' }}</span>
        </AppDatatableColumn>

        <AppDatatableColumn label="Tipo" field="type" v-slot="{ row }">
          <span v-if="row.type" :class="['badge', typeBadgeClass(row.type)]">{{ row.type }}</span>
          <span v-else>—</span>
        </AppDatatableColumn>

        <AppDatatableColumn label="Valor Máx." field="maxValue" v-slot="{ row }">
          {{ row.maxValue ?? '—' }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Niveles" field="options" v-slot="{ row }">
          <span class="badge bg-info text-dark">{{ row.options?.length ?? 0 }}</span>
        </AppDatatableColumn>

        <AppDatatableColumn label="Por Defecto" field="isDefault" v-slot="{ row }">
          <span :class="['badge', row.isDefault ? 'bg-success' : 'bg-secondary']">
            {{ row.isDefault ? 'Sí' : 'No' }}
          </span>
        </AppDatatableColumn>

        <AppDatatableColumn label="Acciones" v-slot="{ row }">
          <div class="btn-group">
            <AppCheckPermission permission="evaluationTeacher.assessmentScales.edit">
              <AppButtonEdit @click="handleEdit(row)" />
            </AppCheckPermission>
            <AppCheckPermission permission="evaluationTeacher.assessmentScales.delete">
              <AppButtonDelete @click="handleDelete(row)" />
            </AppCheckPermission>
          </div>
        </AppDatatableColumn>
      </AppDatatable>
    </template>
  </AppBaseList>

  <AppModal v-model="showDeleteModal">
    <AppConfirmDeleteModal v-if="showDeleteModal" :entity="scaleToDelete?.name || 'Escala'" @confirmDelete="confirmDelete" @close="showDeleteModal = false" />
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { GetEvaluationScalesService } from '../services/getEvaluationScales.service';
import { DeleteAssessmentScaleService } from '../services/deleteAssessmentScale.service';
import type { AssessmentScaleDto } from '../dtos/assessmentScale.dto';
import { useHeaderStore } from '../../../stores/header.store';
import { ToastService } from '../../../shared/services/toast.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';

const getScalesService = new GetEvaluationScalesService();
const deleteScaleService = new DeleteAssessmentScaleService();
const toastService = new ToastService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'AssessmentScales',
  components: {
    AppBaseList,
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    AppIcon,
    AppCheckPermission,
    AppDatatable,
    AppDatatableColumn,
    AppModal,
    AppConfirmDeleteModal,
  },
  setup() {
    useMeta({ title: 'Escalas de Evaluación' });

    const router = useRouter();

    const showDeleteModal = ref(false);
    const scaleToDelete = ref<AssessmentScaleDto | null>(null);

    const typeBadgeClass = (type?: string) => {
      if (!type) return 'bg-secondary';
      const t = type.toUpperCase();
      if (t.includes('LIKERT')) return 'bg-primary';
      if (t.includes('DESEMPE') || t.includes('PERFORMANCE')) return 'bg-purple text-white';
      if (t.includes('NUMERI')) return 'bg-success';
      return 'bg-secondary';
    };

    const navigateToCreate = () => {
      router.push({ name: 'evaluation-teacher.AssessmentScaleNew' });
    };

    const handleEdit = (scale: AssessmentScaleDto) => {
      router.push({
        name: 'evaluation-teacher.AssessmentScaleEdit',
        params: { id: scale.id },
      });
    };

    const handleDelete = (scale: AssessmentScaleDto) => {
      scaleToDelete.value = scale;
      showDeleteModal.value = true;
    };

    const confirmDelete = async () => {
      if (!scaleToDelete.value) return;
      try {
        const institutionId = localStorage.getItem('institutionId') || '2';
        await deleteScaleService.run(scaleToDelete.value.id, institutionId);
        toastService.show('Escala eliminada exitosamente', 'success');
        showDeleteModal.value = false;
        scaleToDelete.value = null;
        updateDatatableService.run();
      } catch {
        toastService.show('Error al eliminar la escala', 'error');
      }
    };

    onMounted(() => {
      const headerStore = useHeaderStore();
      headerStore.module = { name: 'Evaluación Docente', url: '' };
      headerStore.moduleItem = { name: 'Escalas de Evaluación', url: '' };
      headerStore.moduleSubItem = { name: '', url: '' };
    });

    return {
      getScalesService,
      showDeleteModal,
      scaleToDelete,
      typeBadgeClass,
      navigateToCreate,
      handleEdit,
      handleDelete,
      confirmDelete,
    };
  },
});
</script>

<style scoped>
.bg-purple {
  background-color: #6d28d9;
}
</style>
