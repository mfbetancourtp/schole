<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="lg">
    <!-- HEAD -->
    <template #head>
      <AppDrawerHeader
        variant="view"
        icon="sliders-h"
        :title="modalTitle"
        :subtitle="programDetail ? `${programDetail.campusName} > ${programDetail.facultieName || ''} > ${programDetail.programName}` : ''"
      />
    </template>

    <!-- BODY -->
    <template #body>
      <div class="drawer-body-wrapper">
        <AppLoading v-if="loading" />

        <template v-else>
          <div class="config-container">
            <!-- Section 1: Configuración General -->
            <div class="config-section">
              <div class="section-header">
                <AppIcon icon="cog" class="section-icon" />
                <h6 class="section-title">Configuración General</h6>
              </div>

              <div class="section-body">
                <div class="row g-3">
                  <div class="col-md-4">
                    <AppFormField :form-control="v$.form.minCapacity" label="Cupo mínimo">
                      <AppInput v-model.number="v$.form.minCapacity.$model" type="number" placeholder="Ej: 25" min="1" />
                    </AppFormField>
                  </div>

                  <div class="col-md-4">
                    <AppFormField :form-control="v$.form.maxCapacity" label="Cupo máximo">
                      <AppInput v-model.number="v$.form.maxCapacity.$model" type="number" placeholder="Ej: 35" min="1" />
                    </AppFormField>
                  </div>

                  <div class="col-md-4">
                    <AppFormField :form-control="v$.form.periodValue" label="Valor del período (EOP)">
                      <AppInput v-model.number="v$.form.periodValue.$model" type="number" placeholder="Ej: 12500000" min="1" />
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

                <!-- Mallas Curriculares Selector -->
                <AppFormField :form-control="v$.form.selectedCurriculum" label="Malla Curricular">
                  <div v-if="programCurriculums.length === 0" style="padding: 8px 12px; background-color: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; color: #004085; display: block">
                    <AppIcon icon="info-circle" style="margin-right: 8px" />
                    No hay mallas curriculares asociadas a este programa.
                  </div>
                  <AppAutocomplete
                    v-else
                    v-model="v$.form.selectedCurriculum.$model"
                    :options="programCurriculums || []"
                    :reduce="(curriculum: any) => curriculum.id"
                    label="name"
                    input-id="selectedCurriculum"
                    :clearable="false"
                  ></AppAutocomplete>
                </AppFormField>
              </div>
            </div>

            <!-- Section 2: Cortes de Evaluación -->
            <div class="config-section">
              <div class="section-header">
                <AppIcon icon="chart-line" class="section-icon" />
                <h6 class="section-title">Cortes de Evaluación</h6>
              </div>

              <div class="section-body">
                <!-- Distribution Alert -->
                <div v-if="totalPercentage < 100" class="alert alert-warning alertContent">
                  <AppIcon icon="exclamation-triangle" />
                  <span
                    ><strong>Falta {{ 100 - totalPercentage }}%</strong> por distribuir</span
                  >
                </div>
                <div v-else-if="totalPercentage === 100" class="alert alert-success alertContent">
                  <AppIcon icon="check-circle" />
                  <span><strong>100%</strong> del período distribuido correctamente</span>
                </div>
                <div v-else class="alert alert-danger alertContent">
                  <AppIcon icon="times-circle" />
                  <span
                    ><strong>Excede en {{ totalPercentage - 100 }}%</strong> la distribución permitida</span
                  >
                </div>

                <!-- Cuts Info Message -->
                <div v-if="!programDetail || !programDetail.evaluationBreaks || programDetail.evaluationBreaks.length === 0" class="alert alert-info">
                  <AppIcon icon="info-circle" class="me-2" />
                  No hay cortes de evaluación configurados para este programa.
                </div>

                <!-- Cuts List -->
                <div v-else class="cuts-list">
                  <div v-for="cut in programDetail.evaluationBreaks" :key="cut.id" class="cut-item">
                    <div class="cut-header">
                      <div class="cut-info">
                        <h6 class="cut-title">{{ cut.name }}</h6>
                        <span class="badge bg-primary">{{ cut.percentage }}% del período</span>
                      </div>
                      <AppButtonEdit @click="openEditCutModal(cut)"></AppButtonEdit>
                    </div>

                    <div class="cut-details">
                      <div class="detail-row">
                        <span class="detail-label">Periodo de evaluación:</span>
                        <span class="detail-value">{{ formatDate(cut.startDate) }} - {{ formatDate(cut.endDate) }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Carga de notas:</span>
                        <span class="detail-value">{{ formatDate(cut.gradeLoadStartDate) }} - {{ formatDate(cut.gradeLoadEndDate) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="d-flex justify-content-end gap-2">
        <AppButton variant="ghost" @click="$emit('update:isVisible', false)" :disabled="savingConfig">Cerrar</AppButton>
        <AppButton variant="primary" :loading="savingConfig" @click="saveGeneralConfig">Guardar Configuración</AppButton>
      </div>
    </template>
  </AppDrawer>

  <!-- Modal para editar corte -->
  <AppModal v-model="editCutModal" :size="'md'">
    <AppFormModal v-if="editCutModal && currentCut" title="Editar Corte de Evaluación" @cancel="closeEditCutModal">
      <template v-slot:content>
        <AppFormField label="Nombre del corte">
          <AppInput v-model="editCutForm.name" type="text" readonly disabled />
        </AppFormField>

        <div class="badge-container mb-3">
          <span class="badge bg-primary">{{ currentCut.percentage }}% del período</span>
        </div>

        <h6 class="fw-bold text-dark mb-3">Período de evaluación</h6>
        <div class="form-row">
          <AppFormField :form-control="v$Cut.editCutForm.startDate" label="Fecha inicio">
            <AppInput v-model="v$Cut.editCutForm.startDate.$model" type="date" />
          </AppFormField>

          <AppFormField :form-control="v$Cut.editCutForm.endDate" label="Fecha fin">
            <AppInput v-model="v$Cut.editCutForm.endDate.$model" type="date" />
          </AppFormField>
        </div>

        <h6 class="fw-bold text-dark mb-3">Período de carga de notas</h6>
        <div class="form-row">
          <AppFormField :form-control="v$Cut.editCutForm.gradeLoadStartDate" label="Fecha inicio">
            <AppInput v-model="v$Cut.editCutForm.gradeLoadStartDate.$model" type="date" />
          </AppFormField>

          <AppFormField :form-control="v$Cut.editCutForm.gradeLoadEndDate" label="Fecha fin">
            <AppInput v-model="v$Cut.editCutForm.gradeLoadEndDate.$model" type="date" />
          </AppFormField>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton variant="primary" :loading="savingCut" @click="saveEditCut">Guardar</AppButton>
      </template>
    </AppFormModal>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minValue } from '../../../shared/plugins/vuelidate.plugin';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetCurriculumOfferingDetailService, CurriculumOfferingDetailDto, EvaluationBreakDto } from '../services/getCurriculumOfferingDetail.service';
import { UpdateCurriculumOfferingConfigService } from '../services/updateCurriculumOfferingConfig.service';
import { UpdateEvaluationBreakService } from '../services/updateEvaluationBreak.service';
import { GetProgramCurriculumsService } from '../../institutionalConfiguration/services/getProgramCurriculums.service';
import { ToastService } from '../../../shared/services/toast.service';

const getCurriculumOfferingDetailService = new GetCurriculumOfferingDetailService();
const updateCurriculumOfferingConfigService = new UpdateCurriculumOfferingConfigService();
const updateEvaluationBreakService = new UpdateEvaluationBreakService();
const getProgramCurriculumsService = new GetProgramCurriculumsService();
const toastService = new ToastService();

export default defineComponent({
  name: 'ProgramConfigurationDrawer',
  components: {
    AppDrawer,
    AppDrawerHeader,
    AppFormModal,
    AppFormField,
    AppInput,
    AppButton,
    AppButtonEdit,
    AppLoading,
    AppModal,
    AppIcon,
    AppAutocomplete,
  },
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    academicPeriodId: {
      type: Number,
      required: true,
    },
    data: {
      type: Object,
      default: null,
    },
  },
  emits: ['update:isVisible', 'saved'],
  setup(props, { emit }) {
    const loading = ref(true);
    const savingConfig = ref(false);
    const savingCut = ref(false);
    const editCutModal = ref(false);
    const currentCut = ref<EvaluationBreakDto | null>(null);

    const programDetail = ref<CurriculumOfferingDetailDto | null>(null);
    const programCurriculums = ref<any[]>([]);

    const form = reactive({
      minCapacity: 0,
      maxCapacity: 0,
      periodValue: 0,
      selectedCurriculum: 0,
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
          minCapacity: { required, minValue: minValue(1) },
          maxCapacity: { required, minValue: minValue(1) },
          periodValue: { required, minValue: minValue(1) },
          selectedCurriculum: { required, minValue: minValue(1) },
        },
      },
      { form }
    );

    const v$Cut = useVuelidate(
      {
        editCutForm: {
          startDate: { required },
          endDate: { required },
          gradeLoadStartDate: { required },
          gradeLoadEndDate: { required },
        },
      },
      { editCutForm }
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

        form.minCapacity = detail.minCapacity;
        form.maxCapacity = detail.maxCapacity;
        form.periodValue = detail.periodValue;

        await v$.value.$reset();
        // Cargar las mallas curriculares del programa
        await loadProgramCurriculums();
      } catch (error) {
        console.error('Error loading program detail:', error);
        toastService.show('Error al cargar el detalle del programa', 'error');
      } finally {
        loading.value = false;
      }
    };

    const loadProgramCurriculums = async () => {
      if (!programDetail.value) return;

      try {
        const response: any = await getProgramCurriculumsService.run({
          programId: programDetail.value.programId,
          state: 'Activo',
          order: 'ASC',
          page: 1,
          perPage: 10,
        } as any);

        // La API devuelve {data: [...], pagination: {...}}
        programCurriculums.value = response?.data || [];

        // Si hay curriculums, seleccionar el primero
        if (programCurriculums.value.length > 0) {
          form.selectedCurriculum = programCurriculums.value[0].id;
        }
      } catch (error) {
        console.error('Error loading program curriculums:', error);
      }
    };

    const saveGeneralConfig = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid || !programDetail.value) {
        toastService.show('Por favor complete todos los campos requeridos', 'warning');
        return;
      }

      try {
        savingConfig.value = true;

        await updateCurriculumOfferingConfigService.run(programDetail.value.id, {
          minCapacity: form.minCapacity,
          maxCapacity: form.maxCapacity,
          periodValue: form.periodValue,
          programCurriculumId: form.selectedCurriculum,
        });

        toastService.show('Configuración actualizada exitosamente', 'success');
        emit('saved');
        emit('update:isVisible', false);
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
      // Reset validación para que no muestre errores de intentos previos
      v$Cut.value.$reset();
    };

    const closeEditCutModal = () => {
      editCutModal.value = false;
      currentCut.value = null;
    };

    const saveEditCut = async () => {
      if (!currentCut.value || !programDetail.value) return;

      // Validar los campos de fecha
      const formIsValid = await v$Cut.value.$validate();
      if (!formIsValid) {
        toastService.show('Por favor complete todos los campos de fecha', 'warning');
        return;
      }

      try {
        savingCut.value = true;

        await updateEvaluationBreakService.run(currentCut.value.id, {
          name: editCutForm.name,
          startDate: editCutForm.startDate,
          endDate: editCutForm.endDate,
          gradeLoadStartDate: editCutForm.gradeLoadStartDate,
          gradeLoadEndDate: editCutForm.gradeLoadEndDate,
        });

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
        await v$Cut.value.$reset();
        closeEditCutModal();
      } catch (error: any) {
        console.error('Error saving cut:', error);
        const message = error?.response?.data?.message || 'Error al guardar el corte. Por favor verifica que las fechas sean válidas.';
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

    // Watch para resetear cuando el drawer se abre
    watch(
      () => props.isVisible,
      (newVal) => {
        if (newVal) {
          loadProgramDetail();
        }
      }
    );

    // Watch para resetear cuando cambian los datos
    watch(
      () => props.data,
      () => {
        if (props.isVisible) {
          loadProgramDetail();
        }
      },
      { deep: true }
    );

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
      v$Cut,
      modalTitle,
      totalPercentage,
      programCurriculums,
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
.drawer-body-wrapper {
  padding: 1.5rem;
}

.config-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.config-section {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1.5rem;
}

.config-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.section-icon {
  font-size: 1.25rem;
  color: var(--color-primary);
}

.section-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.section-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ALERTS */
.alertContent {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

/* SUMMARY CARDS */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.summary-card {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
}

.summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.summary-label {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

/* CUTS LIST */
.cuts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cut-item {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.cut-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.cut-info {
  flex: 1;
}

.cut-title {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
}

.cut-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e9ecef;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.detail-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
  min-width: 120px;
}

.detail-value {
  font-size: 0.85rem;
  color: #2c3e50;
  font-weight: 500;
}

/* MODAL FIELDS */
.modalField {
  margin-bottom: 0.75rem;
}

.modalLabel {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.modalBadge {
  margin-top: 0.5rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
  margin-top: 0.5rem;
}

/* FORM ROW */
.form-row {
  display: flex;
  gap: 1rem;
}

.form-row > :deep(.fieldWrapper) {
  flex: 1;
}

/* BADGE CONTAINER */
.badge-container {
  display: flex;
  gap: 0.5rem;
}
</style>
