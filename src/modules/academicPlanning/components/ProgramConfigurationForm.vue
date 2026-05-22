<template>
  <AppFormModal :title="modalTitle">
    <template v-slot:content>
      <AppLoading v-if="loading" />

      <template v-else>
        <!-- Breadcrumb Info -->
        <div class="tw-mb-4 tw-pb-3 tw-border-b" v-if="programDetail">
          <div class="tw-text-sm tw-text-gray-600">
            <span>{{ programDetail.campusName }}</span>
            <span class="tw-mx-2" v-if="programDetail.facultieName">&gt;</span>
            <span v-if="programDetail.facultieName">{{ programDetail.facultieName }}</span>
            <span class="tw-mx-2">&gt;</span>
            <span class="tw-font-semibold tw-text-gray-800">{{ programDetail.programName }}</span>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <ul class="nav nav-tabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="general-config-tab" data-bs-toggle="tab" data-bs-target="#general-config" type="button" role="tab">
              <AppIcon icon="cog" class="me-2" />
              Configuración General
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="cuts-tab" data-bs-toggle="tab" data-bs-target="#cuts" type="button" role="tab">
              <AppIcon icon="chart-line" class="me-2" />
              Cortes de Evaluación
            </button>
          </li>
        </ul>

        <!-- Tabs Content -->
        <div class="tab-content mt-3">
          <!-- Tab 1: Configuración General -->
          <div class="tab-pane fade show active" id="general-config" role="tabpanel">
            <div class="row tw-mb-4">
              <div class="col-md-4">
                <AppFormField :form-control="v$.form.minCapacity">
                  <label for="minCapacity">Cupo mínimo</label>
                  <input class="form-control" type="number" id="minCapacity" v-model.number="v$.form.minCapacity.$model" placeholder="Ej: 25" min="0" />
                </AppFormField>
              </div>

              <div class="col-md-4">
                <AppFormField :form-control="v$.form.maxCapacity">
                  <label for="maxCapacity">Cupo máximo</label>
                  <input class="form-control" type="number" id="maxCapacity" v-model.number="v$.form.maxCapacity.$model" placeholder="Ej: 35" min="0" />
                </AppFormField>
              </div>

              <div class="col-md-4">
                <AppFormField :form-control="v$.form.periodValue">
                  <label for="periodValue">Valor del período (EOP)</label>
                  <input class="form-control" type="number" id="periodValue" v-model.number="v$.form.periodValue.$model" placeholder="Ej: 12500000" min="0" />
                </AppFormField>
              </div>
            </div>

            <!-- Summary Cards -->
            <div class="summary-cards">
              <div class="summary-card">
                <div class="summary-value">{{ form.minCapacity || 0 }}</div>
                <div class="summary-label">Cupo mínimo</div>
              </div>
              <div class="summary-card">
                <div class="summary-value">{{ form.maxCapacity || 0 }}</div>
                <div class="summary-label">Cupo máximo</div>
              </div>
              <div class="summary-card">
                <div class="summary-value">
                  {{ programDetail?.totalCuts || 0 }}
                </div>
                <div class="summary-label">Cortes configurados</div>
              </div>
            </div>
          </div>

          <!-- Tab 2: Cortes de Evaluación -->
          <div class="tab-pane fade" id="cuts" role="tabpanel">
            <div class="tw-mb-4">
              <h6 class="tw-text-base tw-font-semibold tw-text-gray-800 tw-mb-3">Cortes de Evaluación</h6>

              <!-- Distribution Alert -->
              <div v-if="totalPercentage < 100" class="alert alert-warning tw-flex tw-items-center tw-gap-2">
                <AppIcon icon="exclamation-triangle" />
                <span
                  ><strong>Falta {{ 100 - totalPercentage }}%</strong> por distribuir</span
                >
              </div>
              <div v-else-if="totalPercentage === 100" class="alert alert-success tw-flex tw-items-center tw-gap-2">
                <AppIcon icon="check-circle" />
                <span><strong>100%</strong> del período distribuido correctamente</span>
              </div>
              <div v-else class="alert alert-danger tw-flex tw-items-center tw-gap-2">
                <AppIcon icon="times-circle" />
                <span
                  ><strong>Excede en {{ totalPercentage - 100 }}%</strong> la distribución permitida</span
                >
              </div>
            </div>

            <div v-if="!programDetail || !programDetail.evaluationBreaks || programDetail.evaluationBreaks.length === 0" class="alert alert-info">
              <AppIcon icon="info-circle" class="me-2" />
              No hay cortes de evaluación configurados para este programa.
            </div>

            <div v-else class="cuts-list">
              <div v-for="cut in programDetail.evaluationBreaks" :key="cut.id" class="cut-item">
                <div class="cut-header">
                  <div>
                    <h6 class="cut-title tw-mb-1">{{ cut.name }}</h6>
                    <span class="badge bg-primary">{{ cut.percentage }}% del período</span>
                  </div>
                  <AppButton variant="outline-primary" size="sm" icon="edit" @click="openEditCutModal(cut)"> Editar </AppButton>
                </div>

                <div class="cut-body tw-mt-3">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="cut-date-group">
                        <label class="tw-text-xs tw-font-semibold tw-text-gray-600">Periodo de evaluación</label>
                        <div class="tw-text-sm tw-text-gray-800">
                          {{ formatDate(cut.startDate) }} -
                          {{ formatDate(cut.endDate) }}
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="cut-date-group">
                        <label class="tw-text-xs tw-font-semibold tw-text-gray-600">Periodo de carga de notas</label>
                        <div class="tw-text-sm tw-text-gray-800">
                          {{ formatDate(cut.gradeLoadStartDate) }} -
                          {{ formatDate(cut.gradeLoadEndDate) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <template v-slot:actions>
      <AppButton variant="outline-secondary" @click="$emit('close')"> Cerrar </AppButton>
      <AppButton variant="primary" :loading="savingConfig" @click="saveGeneralConfig"> Guardar Configuración </AppButton>
    </template>
  </AppFormModal>

  <!-- Modal para editar corte -->
  <AppModal v-model="editCutModal" :size="'md'">
    <AppFormModal v-if="editCutModal && currentCut" title="Editar Corte de Evaluación" @cancel="closeEditCutModal">
      <template v-slot:content>
        <div class="tw-mb-3">
          <AppFormField>
            <label for="cut-name">Nombre del corte</label>
            <input class="form-control" type="text" id="cut-name" v-model="editCutForm.name" readonly />
          </AppFormField>
          <div class="tw-mt-2">
            <span class="badge bg-primary">{{ currentCut.percentage }}% del período</span>
          </div>
        </div>

        <div class="tw-mb-3">
          <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">Periodo de evaluación</label>
          <div class="row">
            <div class="col-md-6">
              <AppFormField>
                <label for="cut-start">Fecha inicio</label>
                <input class="form-control" type="date" id="cut-start" v-model="editCutForm.startDate" />
              </AppFormField>
            </div>
            <div class="col-md-6">
              <AppFormField>
                <label for="cut-end">Fecha fin</label>
                <input class="form-control" type="date" id="cut-end" v-model="editCutForm.endDate" />
              </AppFormField>
            </div>
          </div>
        </div>

        <div class="tw-mb-3">
          <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">Periodo de carga de notas</label>
          <div class="row">
            <div class="col-md-6">
              <AppFormField>
                <label for="grade-start">Fecha inicio</label>
                <input class="form-control" type="date" id="grade-start" v-model="editCutForm.gradeLoadStartDate" />
              </AppFormField>
            </div>
            <div class="col-md-6">
              <AppFormField>
                <label for="grade-end">Fecha fin</label>
                <input class="form-control" type="date" id="grade-end" v-model="editCutForm.gradeLoadEndDate" />
              </AppFormField>
            </div>
          </div>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton variant="primary" :loading="savingCut" @click="saveEditCut"> Guardar </AppButton>
      </template>
    </AppFormModal>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import { GetCurriculumOfferingDetailService, CurriculumOfferingDetailDto, EvaluationBreakDto } from '../services/getCurriculumOfferingDetail.service';
import { UpdateCurriculumOfferingConfigService } from '../services/updateCurriculumOfferingConfig.service';
import { UpdateEvaluationBreakService } from '../services/updateEvaluationBreak.service';
import { ToastService } from '../../../shared/services/toast.service';

const getCurriculumOfferingDetailService = new GetCurriculumOfferingDetailService();
const updateCurriculumOfferingConfigService = new UpdateCurriculumOfferingConfigService();
const updateEvaluationBreakService = new UpdateEvaluationBreakService();
const toastService = new ToastService();

export default defineComponent({
  name: 'ProgramConfigurationForm',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    AppLoading,
    AppModal,
    AppIcon,
  },
  props: {
    academicPeriodId: {
      type: Number,
      required: true,
    },
    data: {
      type: Object,
      default: null,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const loading = ref(true);
    const savingConfig = ref(false);
    const savingCut = ref(false);
    const editCutModal = ref(false);
    const currentCut = ref<EvaluationBreakDto | null>(null);

    const programDetail = ref<CurriculumOfferingDetailDto | null>(null);

    const form = reactive({
      minCapacity: 0,
      maxCapacity: 0,
      periodValue: 0,
    });

    const editCutForm = reactive({
      name: '',
      startDate: '',
      endDate: '',
      gradeLoadStartDate: '',
      gradeLoadEndDate: '',
    });

    const v$ = useVuelidate(
      {
        form: {
          minCapacity: { required },
          maxCapacity: { required },
          periodValue: { required },
        },
      },
      { form }
    );

    const modalTitle = computed(() => {
      return programDetail.value ? `Configurar programa: ${programDetail.value.programName}` : 'Configurar programa';
    });

    const totalPercentage = computed(() => {
      if (!programDetail.value || !programDetail.value.evaluationBreaks || !Array.isArray(programDetail.value.evaluationBreaks)) return 0;
      return programDetail.value.evaluationBreaks.reduce((sum, cut) => sum + cut.percentage, 0);
    });

    const loadProgramDetail = async () => {
      if (!props.data || !props.data.id) {
        loading.value = false;
        return;
      }

      try {
        loading.value = true;
        const detail = await getCurriculumOfferingDetailService.run(props.data.id);
        programDetail.value = detail;

        // Populate form
        form.minCapacity = detail.minCapacity;
        form.maxCapacity = detail.maxCapacity;
        form.periodValue = detail.periodValue;
      } catch (error) {
        console.error('Error loading program detail:', error);
        toastService.show('Error al cargar el detalle del programa', 'error');
      } finally {
        loading.value = false;
      }
    };

    const saveGeneralConfig = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid || !programDetail.value) return;

      try {
        savingConfig.value = true;

        await updateCurriculumOfferingConfigService.run(programDetail.value.id, {
          minCapacity: form.minCapacity,
          maxCapacity: form.maxCapacity,
          periodValue: form.periodValue,
        });

        toastService.show('Configuración actualizada exitosamente', 'success');
        emit('close');
      } catch (error: any) {
        console.error('Error saving configuration:', error);
        const message = error?.response?.data?.message || 'Error al guardar la configuración';
        toastService.show(message, 'error');
      } finally {
        savingConfig.value = false;
      }
    };

    const openEditCutModal = (cut: EvaluationBreakDto) => {
      currentCut.value = cut;
      editCutForm.name = cut.name;
      editCutForm.startDate = cut.startDate || '';
      editCutForm.endDate = cut.endDate || '';
      editCutForm.gradeLoadStartDate = cut.gradeLoadStartDate || '';
      editCutForm.gradeLoadEndDate = cut.gradeLoadEndDate || '';
      editCutModal.value = true;
    };

    const closeEditCutModal = () => {
      editCutModal.value = false;
      currentCut.value = null;
    };

    const saveEditCut = async () => {
      if (!currentCut.value || !programDetail.value) return;

      try {
        savingCut.value = true;

        await updateEvaluationBreakService.run(currentCut.value.id, {
          name: editCutForm.name,
          startDate: editCutForm.startDate,
          endDate: editCutForm.endDate,
          gradeLoadStartDate: editCutForm.gradeLoadStartDate,
          gradeLoadEndDate: editCutForm.gradeLoadEndDate,
        });

        // Update the cut in place without reloading all data
        const cutIndex = programDetail.value.evaluationBreaks.findIndex((cut) => cut.id === currentCut.value!.id);
        if (cutIndex !== -1) {
          programDetail.value.evaluationBreaks[cutIndex] = {
            ...programDetail.value.evaluationBreaks[cutIndex],
            startDate: editCutForm.startDate,
            endDate: editCutForm.endDate,
            gradeLoadStartDate: editCutForm.gradeLoadStartDate,
            gradeLoadEndDate: editCutForm.gradeLoadEndDate,
          };
        }

        toastService.show('Corte actualizado exitosamente', 'success');
        closeEditCutModal();
      } catch (error: any) {
        console.error('Error saving cut:', error);
        const message = error?.response?.data?.message || 'Error al guardar el corte';
        toastService.show(message, 'error');
      } finally {
        savingCut.value = false;
      }
    };

    const formatDate = (dateString: string | null) => {
      if (!dateString) return 'Sin configurar';
      const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${day} ${months[month - 1]} ${year}`;
    };

    onMounted(() => {
      loadProgramDetail();
    });

    return {
      loading,
      savingConfig,
      savingCut,
      editCutModal,
      currentCut,
      programDetail,
      form,
      editCutForm,
      v$,
      modalTitle,
      totalPercentage,
      saveGeneralConfig,
      openEditCutModal,
      closeEditCutModal,
      saveEditCut,
      formatDate,
    };
  },
});
</script>

<style scoped>
.nav-tabs {
  border-bottom: 2px solid #dee2e6;
}

.nav-tabs .nav-link {
  color: #6c757d;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s;
}

.nav-tabs .nav-link:hover {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  background-color: transparent;
}

.nav-tabs .nav-link.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  background-color: transparent;
}

.tab-content {
  padding: 1.5rem 0;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.summary-card {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1.25rem;
  text-align: center;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.summary-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

.cuts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cut-item {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1.25rem;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.cut-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.cut-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.cut-body {
  margin-top: 1rem;
}

.cut-date-group {
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 0.375rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

button:focus {
  outline: none !important;
  box-shadow: none !important;
}

button:active {
  outline: none !important;
}
</style>
