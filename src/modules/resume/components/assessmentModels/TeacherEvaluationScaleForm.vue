<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButton type="button" style="color: white" :to="{ name: 'resume.teacherEvaluationScale' }">
        <AppIcon icon="arrow-left" />
        Volver
      </AppButton>

      <AppButton type="button" style="color: white" :disabled="!canSaveScale" @click="handleSave">
        <AppIcon icon="save" />
        Guardar Escala
      </AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="scaleFormPage">
        <div class="sectionHead">
          <div class="contentIconTitle">
            <div class="sectionHead__icon">
              <AppIcon icon="chart-bar" />
            </div>
            <div>
              <h2 class="sectionHead__title">
                {{ isEdit ? 'Editar Escala de Evaluación' : 'Crear Escala de Evaluación' }}
              </h2>
              <p class="sectionHead__subtitle">Configure los rangos de clasificación y sus parámetros</p>
            </div>
          </div>
        </div>

        <AppCard>
          <template #body>
            <div class="noteBox">
              <AppIcon icon="exclamation-circle" class="noteBox__icon" />
              <div>
                <p class="noteBox__title">Nota informativa</p>
                <p class="noteBox__text">Puede tener múltiples escalas activas simultáneamente. Activar esta escala no desactivará otras escalas existentes.</p>
              </div>
            </div>
          </template>
        </AppCard>

        <AppCard>
          <template #title>
            <div class="cardTitle">Configuración General</div>
          </template>

          <template #body>
            <div class="formGrid">
              <div class="field--full">
                <AppFormField :label="'Nombre de la Escala'">
                  <input v-model="formData.name" type="text" class="form-control" placeholder="Ej: Escala General 2026" />
                </AppFormField>
              </div>

              <div class="field--full">
                <AppFormField :label="'Descripción'">
                  <textarea v-model="formData.description" class="form-control textarea-control" placeholder="Describe el propósito y contexto de esta escala..."></textarea>
                </AppFormField>
              </div>

              <AppFormField :label="'Puntaje Mínimo Global'">
                <input v-model.number="formData.minimumOverallScore" type="number" min="0" class="form-control" />
              </AppFormField>

              <AppFormField :label="'Puntaje Máximo Global'">
                <input v-model.number="formData.maximumOverallScore" type="number" min="0" class="form-control" />
              </AppFormField>

              <div class="field--full settingsSwitchGrid">
                <AppFormField>
                  <div class="form-check form-switch settingSwitch">
                    <input id="teacher-evaluation-scale-state" v-model="formData.isActive" class="form-check-input" type="checkbox" />
                    <label class="form-check-label" for="teacher-evaluation-scale-state"> Escala activa </label>
                  </div>
                  <p class="helperText helperText--switch">
                    {{ formData.isActive ? 'La escala quedará activa al guardar.' : 'La escala quedará inactiva al guardar.' }}
                  </p>
                </AppFormField>

                <AppFormField>
                  <div class="form-check form-switch settingSwitch">
                    <input id="teacher-evaluation-scale-tie-standing" v-model="formData.tieStanding" class="form-check-input" type="checkbox" />
                    <label class="form-check-label" for="teacher-evaluation-scale-tie-standing"> Permitir empates en clasificación </label>
                  </div>
                  <p class="helperText helperText--switch">Múltiples docentes pueden tener el mismo puntaje y clasificación.</p>
                </AppFormField>
              </div>
            </div>
          </template>
        </AppCard>

        <AppCard v-if="isEdit">
          <template #title>
            <div class="cardTitleRow">
              <div>
                <div class="cardTitle">Constructor de Rangos</div>
                <p class="cardSubtitle">Define los rangos de clasificación y sus características</p>
              </div>

              <AppButton type="button" class="btnPrimary" @click="openDialog()">
                <AppIcon icon="plus" />
                Agregar Rango
              </AppButton>
            </div>
          </template>

          <template #body>
            <AppDatatable
              name="teacher-evaluation-scale-ranges"
              :service="getRangeBuildersService"
              :params="rangeBuilderTableParams"
              :enable-search-filter="false"
              :show-filter-steps="false"
              :default-per-page="10"
            >
              <AppDatatableColumn field="from" label="Desde" v-slot="props">
                <span class="fw600">{{ props.row.from }}</span>
              </AppDatatableColumn>

              <AppDatatableColumn field="to" label="Hasta" v-slot="props">
                <span class="fw600">{{ props.row.to }}</span>
              </AppDatatableColumn>

              <AppDatatableColumn field="classificationName" label="Clasificación" v-slot="props">
                {{ props.row.classificationName }}
              </AppDatatableColumn>

              <AppDatatableColumn field="color" label="Color" v-slot="props">
                <div class="colorCell">
                  <span class="colorPreview" :style="{ backgroundColor: props.row.color }"></span>
                  <span>{{ props.row.color }}</span>
                </div>
              </AppDatatableColumn>

              <AppDatatableColumn field="hierarchyLevel" label="Nivel" v-slot="props">
                {{ props.row.hierarchyLevel }}
              </AppDatatableColumn>

              <AppDatatableColumn label="Acciones" position="centered" v-slot="props">
                <div class="actionsCell">
                  <AppButton type="button" outlined icon="pencil-alt" @click="openDialog(props.row)" />

                  <AppButton type="button" outlined icon="trash" class="btnAction--danger" @click="openDeleteRangoModal(String(props.row.id))" />
                </div>
              </AppDatatableColumn>
            </AppDatatable>
          </template>
        </AppCard>

        <AppCard v-else>
          <template #body>
            <div class="pendingSection">
              <AppIcon icon="info-circle" class="pendingSection__icon" />
              <div>
                <h4 class="pendingSection__title">Constructor de Rangos</h4>
                <p class="pendingSection__text">Guarda primero la escala de evaluacion para habilitar la configuracion de rangos en el modo de edicion.</p>
              </div>
            </div>
          </template>
        </AppCard>

        <AppCard v-if="isEdit">
          <template #title>
            <div class="cardTitle">Vista Previa de Rangos</div>
          </template>

          <template #body>
            <template v-if="sortedRanges.length">
              <p class="previewText">Distribución visual proporcional de los rangos configurados</p>

              <div class="previewBar">
                <div
                  v-for="rango in sortedRanges"
                  :key="rango.id"
                  class="previewBar__item"
                  :style="{
                    width: `${calcularPorcentaje(rango)}%`,
                    backgroundColor: rango.color,
                  }"
                  :title="`${rango.nombre}: ${rango.desde} - ${rango.hasta}`"
                >
                  <span>{{ rango.nombre }}</span>
                </div>
              </div>

              <div class="legendGrid">
                <div v-for="rango in rangesByLevel" :key="rango.id" class="legendItem">
                  <span class="legendItem__color" :style="{ backgroundColor: rango.color }"></span>
                  <div>
                    <div class="legendItem__title">{{ rango.nombre }}</div>
                    <div class="legendItem__subtitle">{{ rango.desde }} - {{ rango.hasta }} pts</div>
                  </div>
                </div>
              </div>
            </template>

            <div v-else class="pendingSection">
              <AppIcon icon="info-circle" class="pendingSection__icon" />
              <div>
                <h4 class="pendingSection__title">Vista Previa de Rangos</h4>
                <p class="pendingSection__text">Aún no hay rangos configurados para esta escala de evaluación docente.</p>
              </div>
            </div>
          </template>
        </AppCard>
      </div>

      <AppModal v-model="dialogOpen">
        <TeacherEvaluationScaleFormModal v-if="dialogOpen" :data="currentRango" :teacher-evaluation-scale-id="teacherEvaluationScaleId" @close="handleCloseDialog" />
      </AppModal>

      <AppModal v-model="deleteModalOpen">
        <AppConfirmDeleteModal v-if="deleteModalOpen" entity="rango" @confirmDelete="confirmDeleteRango" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, reactive, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useRoute, useRouter } from 'vue-router';

import AppBaseList from '../../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../../shared/components/AppLoading.vue';
import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../../shared/components/AppIcon.vue';
import AppCard from '../../../../shared/components/Card/AppCard.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppDatatable from '../../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppModal from '../../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import TeacherEvaluationScaleFormModal from './TeacherEvaluationScaleFormModal.vue';

import { useHeaderStore } from '../../../../stores/header.store';
import { useCheckDataTableStore } from '../../../../stores/checkDataTable.store';
import { RangeBuilderDto } from '../../dtos/rangeBuilder.dto';
import { TeacherEvaluationScaleDto } from '../../dtos/teacherEvaluationScale.dto';
import { CreateOrUpdateTeacherEvaluationScalePayload, CreateOrUpdateTeacherEvaluationScaleService } from '../../services/createOrUpdateTeacherEvaluationScale.service';
import { DeleteRangeBuilderService } from '../../services/deleteRangeBuilder.service';
import { GetRangeBuildersService } from '../../services/getRangeBuilders.service';
import { UpdateDatatableService } from '../../../../shared/services/updateDatatable.service';

interface Rango {
  id: string;
  desde: number;
  hasta: number;
  nombre: string;
  color: string;
  nivel: number;
}

interface RangeBuilderFormData {
  id?: number | string;
  teacherEvaluationScaleId: number;
  from: number;
  to: number;
  classificationName: string;
  color: string;
  hierarchyLevel: number;
}

const createOrUpdateTeacherEvaluationScaleService = new CreateOrUpdateTeacherEvaluationScaleService();
const deleteRangeBuilderService = new DeleteRangeBuilderService();
const getRangeBuildersService = new GetRangeBuildersService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'TeacherEvaluationScaleForm',
  components: {
    AppBaseList,
    AppLoading,
    AppButton,
    AppIcon,
    AppCard,
    AppFormField,
    AppDatatable,
    AppDatatableColumn,
    AppModal,
    AppConfirmDeleteModal,
    TeacherEvaluationScaleFormModal,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    routes: {
      type: Array,
      required: true,
    },
    data: {
      type: Object as PropType<TeacherEvaluationScaleDto | null>,
      default: null,
    },
  },
  setup(props) {
    const router = useRouter();
    const checkStore = useCheckDataTableStore();
    useMeta({ title: props.title });
    const route = useRoute();
    const teacherEvaluationScaleId = ref(Number(route.params.teacherEvaluationScaleId ?? 0));

    const loading = ref(true);
    const dialogOpen = ref(false);
    const deleteModalOpen = ref(false);
    const currentRango = ref<RangeBuilderFormData | null>(null);
    const currentRangeIdToDelete = ref<string | null>(null);

    const initialData = computed(() => props.data ?? null);
    const isEdit = computed(() => !!initialData.value?.id);

    const formData = reactive<CreateOrUpdateTeacherEvaluationScalePayload>({
      isActive: initialData.value?.isActive ?? false,
      name: initialData.value?.name ?? '',
      description: initialData.value?.description ?? '',
      minimumOverallScore: initialData.value?.minimumOverallScore ?? 0,
      maximumOverallScore: initialData.value?.maximumOverallScore ?? 100,
      tieStanding: initialData.value?.tieStanding ?? true,
    });

    const generalErrors = computed(() => {
      const result: string[] = [];
      const min = Number(formData.minimumOverallScore);
      const max = Number(formData.maximumOverallScore);

      if (!formData.name.trim()) {
        result.push('El nombre de la escala es obligatorio');
      }

      if (min >= max) {
        result.push('El puntaje mínimo debe ser menor que el máximo');
      }

      if (min < 0 || max < 0) {
        result.push('No se permiten valores negativos');
      }

      return result;
    });

    const canSaveScale = computed(() => generalErrors.value.length === 0);

    const mapRangeBuilderToRango = (rangeBuilder: RangeBuilderDto): Rango => ({
      id: String(rangeBuilder.id),
      desde: Number(rangeBuilder.from),
      hasta: Number(rangeBuilder.to),
      nombre: rangeBuilder.classificationName,
      color: rangeBuilder.color || '#3b82f6',
      nivel: Number(rangeBuilder.hierarchyLevel) || 1,
    });

    const rangeBuilderTableParams = computed(() => ({
      teacherEvaluationScaleId: teacherEvaluationScaleId.value,
    }));

    const rangeBuilderRows = computed<RangeBuilderDto[]>(() => {
      const data = checkStore.isCheckData?.dataTable?.data;
      return Array.isArray(data) ? data : [];
    });

    const ranges = computed(() => rangeBuilderRows.value.map(mapRangeBuilderToRango));

    const sortedRanges = computed(() => [...ranges.value].sort((a, b) => a.desde - b.desde));

    const rangesByLevel = computed(() => [...ranges.value].sort((a, b) => a.nivel - b.nivel));

    const calcularPorcentaje = (rango: Rango) => {
      const min = Number(formData.minimumOverallScore);
      const max = Number(formData.maximumOverallScore);
      const totalRango = max - min + 1;
      const rangoSize = rango.hasta - rango.desde + 1;
      return (rangoSize / totalRango) * 100;
    };

    const openDialog = (rango?: Partial<RangeBuilderFormData>) => {
      if (rango) {
        currentRango.value = {
          id: rango.id,
          teacherEvaluationScaleId: Number(rango.teacherEvaluationScaleId ?? teacherEvaluationScaleId.value),
          from: Number(rango.from ?? 0),
          to: Number(rango.to ?? 0),
          classificationName: String(rango.classificationName ?? ''),
          color: String(rango.color ?? '#3b82f6'),
          hierarchyLevel: Number(rango.hierarchyLevel ?? 1),
        };
      } else {
        currentRango.value = {
          teacherEvaluationScaleId: teacherEvaluationScaleId.value,
          from: 0,
          to: 0,
          classificationName: '',
          color: '',
          hierarchyLevel: 0,
        };
      }

      dialogOpen.value = true;
    };

    const closeDialog = () => {
      dialogOpen.value = false;
      currentRango.value = null;
    };

    const openDeleteRangoModal = (id: string) => {
      currentRangeIdToDelete.value = id;
      deleteModalOpen.value = true;
    };

    const closeDeleteRangoModal = () => {
      deleteModalOpen.value = false;
      currentRangeIdToDelete.value = null;
    };

    const confirmDeleteRango = async () => {
      if (!currentRangeIdToDelete.value) return;

      try {
        await deleteRangeBuilderService.run(Number(currentRangeIdToDelete.value));
        closeDeleteRangoModal();
        updateDatatableService.run();
      } catch (error) {
        console.log('error', error);
      }
    };

    const handleCloseDialog = async (shouldRefresh = false) => {
      closeDialog();

      if (shouldRefresh) {
        updateDatatableService.run();
      }
    };

    const buildPayload = (): CreateOrUpdateTeacherEvaluationScalePayload => {
      return {
        isActive: formData.isActive,
        name: formData.name.trim(),
        description: formData.description.trim(),
        minimumOverallScore: Number(formData.minimumOverallScore),
        maximumOverallScore: Number(formData.maximumOverallScore),
        tieStanding: formData.tieStanding,
      };
    };

    const persistScale = async () => {
      if (!canSaveScale.value) return;

      try {
        const payload = buildPayload();
        const response = await createOrUpdateTeacherEvaluationScaleService.run(payload, initialData.value?.id);

        const responseId = response?.data?.id ?? response?.id;

        if (!initialData.value?.id && responseId) {
          await router.push({
            name: 'resume.teacherEvaluationScaleEdit',
            params: {
              teacherEvaluationScaleId: responseId,
            },
          });
          return;
        }
      } catch (error) {
        console.log('error', error);
      }
    };

    const handleSave = async () => {
      await persistScale();
    };

    onMounted(async () => {
      try {
        checkStore.isCheckData.dataTable = { data: [] };

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Configuración General', url: '' };
        headerStorage.moduleItem = {
          name: 'Escala de Evaluación Docente',
          url: 'teacherEvaluationScale',
        };
        headerStorage.moduleSubItem = {
          name: props.title,
          url: '',
        };
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    return {
      loading,
      isEdit,
      formData,
      sortedRanges,
      rangesByLevel,
      dialogOpen,
      deleteModalOpen,
      currentRango,
      teacherEvaluationScaleId,
      canSaveScale,
      getRangeBuildersService,
      rangeBuilderTableParams,
      openDialog,
      closeDialog,
      openDeleteRangoModal,
      initialData,
      handleCloseDialog,
      confirmDeleteRango,
      calcularPorcentaje,
      handleSave,
    };
  },
});
</script>

<style scoped>
.scaleFormPage {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sectionHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.contentIconTitle {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sectionHead__icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.14), rgba(var(--color-primary-rgb), 0.05));
  color: var(--color-primary);
}

.sectionHead__title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-dark, #1f2937);
}

.sectionHead__subtitle {
  margin: 0.25rem 0 0 0;
  color: var(--color-gray-600, #6b7280);
  font-size: 0.95rem;
}

.cardTitle {
  font-size: 1.05rem;
  font-weight: 800;
  color: #111827;
}

.cardTitleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.cardSubtitle {
  margin: 0.3rem 0 0 0;
  color: #6b7280;
  font-size: 0.88rem;
}

.noteBox,
.pendingSection {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.noteBox__icon {
  color: #2563eb;
  margin-top: 2px;
}

.pendingSection__icon {
  color: #2563eb;
  margin-top: 2px;
}

.noteBox__title,
.pendingSection__title {
  margin: 0 0 0.25rem 0;
  font-weight: 800;
  color: #111827;
}

.noteBox__text,
.previewText,
.pendingSection__text {
  margin: 0;
  color: #4b5563;
  font-size: 0.92rem;
}

.formGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 900px) {
  .formGrid {
    grid-template-columns: 1fr 1fr;
  }
}

.field--full {
  grid-column: 1 / -1;
}

.settingsSwitchGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.colorCell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.colorPreview,
.legendItem__color {
  width: 16px;
  height: 16px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

.fw600 {
  font-weight: 700;
}

.actionsCell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.previewBar {
  margin-top: 1rem;
  width: 100%;
  min-height: 68px;
  display: flex;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #d1d5db;
}

.previewBar__item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  min-width: 60px;
  color: #fff;
  font-weight: 700;
  font-size: 0.8rem;
  text-align: center;
}

.legendGrid {
  margin-top: 1.25rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.9rem;
}

.legendItem {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.legendItem__title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #111827;
}

.legendItem__subtitle {
  font-size: 0.78rem;
  color: #6b7280;
}

.settingSwitch {
  margin-bottom: 0;
}

.helperText {
  margin: -0.45rem 0 0 1.8rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.helperText--switch {
  margin-top: 0.35rem;
}

:deep(.form-control) {
  width: 100%;
  min-height: 44px;
}

.textarea-control {
  min-height: 100px;
  resize: vertical;
}

.btnPrimary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btnSecondary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.btnSuccess {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #16a34a;
  color: #fff;
}

.btnAction--danger {
  border-color: #fecaca;
  color: #dc2626;
}

@media (max-width: 768px) {
  .sectionHead__title {
    font-size: 1.4rem;
  }

  .settingsSwitchGrid {
    grid-template-columns: 1fr;
  }
}
</style>
