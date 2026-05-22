<template>
  <div class="evaluation-config-section">
    <!-- Input de período académico y botón de filtros -->
    <div class="period-filter-container">
      <div class="period-input">
        <AppFormField :label="'Período Académico'">
          <AppAutocomplete v-model="academicPeriod" :options="academicPeriods" :clearable="false" class="bg-white" />
        </AppFormField>
      </div>
      <div class="filter-button" style="position: relative">
        <AppButton icon="filter" variant="ghost" @click="showPanelFilter = !showPanelFilter" />
        <div v-if="showPanelFilter" class="custom-filter-panel">
          <AppFilter v-model="filters.gradeId" filter-name="filtroGrado">
            <AppFormField label="Grado">
              <AppAutocomplete v-model="filters.gradeId" :options="grades" label="name" placeholder="Seleccionar grado" />
            </AppFormField>
          </AppFilter>
          <AppFilter v-model="filters.periodId" filter-name="filtroPeriodo">
            <AppFormField label="Período">
              <AppAutocomplete v-model="filters.periodId" :options="periods" label="name" placeholder="Seleccionar período" />
            </AppFormField>
          </AppFilter>
          <div class="d-flex flex-row flex-wrap gap-2 mt-2">
            <AppButton
              class="flex-fill"
              variant="primary"
              label="Aplicar"
              @click="
                applyFilters(filters);
                showPanelFilter = false;
              "
            />
            <AppButton class="flex-fill" variant="secondary" label="Cancelar" @click="showPanelFilter = false" />
          </div>
        </div>
      </div>
    </div>

    <!-- Cards de evaluaciones -->
    <div class="evaluations-grid">
      <!-- Card para crear nueva evaluación -->
      <AppButtonContainerNew @click="openModal(null)"></AppButtonContainerNew>
      <!-- Cards de evaluaciones existentes -->
      <AppCard v-for="evaluation in evaluations" :key="evaluation.id" :image="evaluation.image" class="evaluation-card">
        <template #title>
          <div>{{ evaluation.name }}</div>
        </template>
        <template #footer>
          <div class="custom-footer">
            <div class="info-section">
              <div class="date-info">
                <AppIcon :icon="'calendar'" class="icon-form-nav" />
                <span>{{ evaluation.endDate }}</span>
              </div>
              <div class="students-info">
                <AppIcon :icon="'graduation-cap'" class="icon-form-nav" />
                <span>{{ evaluation.enrolledStudents }} inscritos</span>
              </div>
            </div>
            <div class="actions-section">
              <AppButtonEdit @click="openModal(evaluation)" />
              <AppButtonDelete @click="openDeleteModal(evaluation.id)" />
            </div>
          </div>
        </template>
      </AppCard>
    </div>

    <!-- Modal para crear/editar evaluación -->
    <AppModal v-model:active="showModal" size="xl">
      <EvaluationFormModal :evaluation="selectedEvaluation" @save="saveEvaluation" @close="closeModal" />
    </AppModal>
    <AppModal v-model="showDeleteModal">
      <AppConfirmDeleteModal v-if="showDeleteModal" entity="evaluación" @confirmDelete="confirmDeleteEvaluation"></AppConfirmDeleteModal>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import EvaluationFormModal from './EvaluationFormModal.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppButtonContainerNew from '../../../shared/components/Buttons/AppButtonContainerNew.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

export default defineComponent({
  name: 'EvaluationConfigurationSection',

  components: {
    AppFormField,
    AppButton,
    AppCard,
    AppModal,
    EvaluationFormModal,
    AppAutocomplete,
    AppFilter,
    AppButtonContainerNew,
    AppIcon,
    AppButtonDelete,
    AppButtonEdit,
    AppConfirmDeleteModal,
  },

  setup() {
    const academicPeriod = ref('');
    const showModal = ref(false);
    const showPanelFilter = ref(false);
    const filters = ref({ gradeId: undefined, periodId: undefined });
    const grades = ref([
      { id: 1, name: 'Kinder' },
      { id: 2, name: 'Preparatoria' },
      { id: 3, name: 'Primero' },
      { id: 4, name: 'Segundo' },
      { id: 5, name: 'Tercero' },
      { id: 6, name: 'Cuarto' },
      { id: 7, name: 'Quinto' },
    ]);
    const periods = ref([
      { id: 1, name: 'Período I' },
      { id: 2, name: 'Período II' },
      { id: 3, name: 'Período III' },
      { id: 4, name: 'Período IV' },
    ]);
    const selectedEvaluation = ref(null);
    const showDeleteModal = ref(false);
    const evaluationToDelete = ref(null);

    // Datos de ejemplo para las evaluaciones
    const evaluations = ref([
      {
        id: 1,
        name: 'Evaluación Trimestral Q1',
        image: 'https://blog.peoplenext.com/hubfs/evaluaci%C3%B3n%20de%20desempe%C3%B1o%20constante%20para%20los%20empleados_imgdest.png',
        startDate: '2024-09-01',
        endDate: '2024-12-15',
        performanceEvaluationId: 1,
        qualitativeScaleId: 2,
        periods: [1, 2],
        targetGroups: [1, 2],
        isPublished: true,
        enrolledStudents: 25,
      },
      {
        id: 2,
        name: 'Evaluación de Competencias',
        image: `https://static.vecteezy.com/system/resources/previews/014/396/144/non_2x/employee-performance-appraisal-review-to-improve-efficiency-rate-each-person-s-work-bosses-use-a-magnifying-glass-to-assess-their-employees-by-list-illustration-vector.jpg`,
        startDate: '2024-10-01',
        endDate: '2024-12-20',
        performanceEvaluationId: 2,
        qualitativeScaleId: 1,
        periods: [3],
        targetGroups: [3, 4],
        isPublished: false,
        enrolledStudents: 18,
      },
      {
        id: 3,
        name: 'Evaluación Final',
        image: 'https://scmlatam.com/wp-content/uploads/2023/03/guia-evaluacion-de-desempeno-laboral-scm-latam-scaled-2467x2467.webp',
        startDate: '2024-11-01',
        endDate: '2024-12-30',
        performanceEvaluationId: 3,
        qualitativeScaleId: 3,
        periods: [4],
        targetGroups: [5, 6],
        isPublished: true,
        enrolledStudents: 32,
      },
    ]);

    const academicPeriods = ref([
      { id: 1, name: '2024 - Primer Semestre' },
      { id: 2, name: '2024 - Segundo Semestre' },
      { id: 3, name: '2025 - Primer Semestre' },
      { id: 4, name: '2025 - Segundo Semestre' },
      { id: 5, name: '2026 - Primer Semestre' },
    ]);

    const openModal = (evaluation: any) => {
      selectedEvaluation.value = evaluation;
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      selectedEvaluation.value = null;
    };

    const saveEvaluation = (evaluation: any) => {
      console.log('Guardar evaluación:', evaluation);
      if (evaluation.id) {
        // Editar existente
        const index = evaluations.value.findIndex((e) => e.id === evaluation.id);
        if (index !== -1) {
          evaluations.value[index] = {
            ...evaluations.value[index],
            ...evaluation,
          };
        }
      } else {
        // Crear nueva
        const newEvaluation = {
          ...evaluation,
          id: Date.now(),
          image: 'https://via.placeholder.com/150x100/9C27B0/white?text=Nueva',
        };
        evaluations.value.push(newEvaluation);
      }
      closeModal();
    };

    const openDeleteModal = (evaluation: any) => {
      evaluationToDelete.value = evaluation;
      showDeleteModal.value = true;
    };
    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      evaluationToDelete.value = null;
    };
    const confirmDeleteEvaluation = () => {
      console.log('Eliminar evaluación:', evaluationToDelete.value);
      closeDeleteModal();
    };

    const applyFilters = (filters: any) => {
      console.log('Aplicar filtros:', filters);
    };

    return {
      academicPeriod,
      academicPeriods,
      evaluations,
      showModal,
      showPanelFilter,
      filters,
      grades,
      periods,
      selectedEvaluation,
      showDeleteModal,
      evaluationToDelete,
      openModal,
      closeModal,
      saveEvaluation,
      openDeleteModal,
      closeDeleteModal,
      confirmDeleteEvaluation,
      applyFilters,
    };
  },
});
</script>

<style scoped>
.evaluation-config-section {
  padding: 16px;
}

.period-filter-container {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.period-input {
  flex: 1;
}

.evaluations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.create-card {
  cursor: pointer;
  border: 2px dashed #ddd;
}

.create-card:hover {
  border-color: #007bff;
}

.create-content {
  text-align: center;
  padding: 32px 16px;
  color: #666;
}

.create-icon {
  font-size: 36px;
  color: #007bff;
  margin-bottom: 12px;
}

.custom-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-info,
.students-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.actions-section {
  display: flex;
  gap: 4px;
}

.custom-filter-panel {
  position: absolute;
  top: 40px;
  right: 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 18px 20px;
  z-index: 100;
  min-width: 280px;
  display: flex;
  flex-direction: column;
}
</style>
