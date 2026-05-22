<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButton style="color: white" type="button" class="btnPrimary btnAdd" @click="openCreate">
        <AppIcon icon="plus" class="iconSm" />
        Crear Modelo
      </AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else class="assessmentModelsPage">
        <!-- Header -->
        <div class="sectionHead">
          <div class="contentIconTitle">
            <div class="sectionHead__icon">
              <AppIcon icon="poll" class="iconBig" />
            </div>
            <div>
              <h2 class="hTitle">Modelos de Evaluación</h2>
              <p class="hSub">Administre los modelos de evaluación configurables para el sistema</p>
            </div>
          </div>
        </div>
        <AppDatatable name="assessment-models" :service="getEvaluationModelsService" :enable-search-filter="true" :show-filter-steps="true" :default-per-page="10">
          <AppDatatableColumn field="name" label="Nombre del Modelo" sortable v-slot="props">
            <div class="modelCell">
              <div class="modelCell__title">{{ props.row.name }}</div>
              <div class="modelCell__description">
                {{ props.row.description || 'Sin descripción registrada' }}
              </div>
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn field="version" label="Versión" sortable v-slot="props">
            <div class="versionBadge">v{{ props.row.version }}</div>
          </AppDatatableColumn>

          <AppDatatableColumn field="teacherEvaluationScale.name" label="Escala docente" v-slot="props">
            <span>{{ props.row.teacherEvaluationScale?.name || 'Sin asignar' }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn field="isActive" label="Estado" sortable v-slot="props">
            <AppBadge :label="props.row.isActive ? 'Activo' : 'Inactivo'" :variant="props.row.isActive ? 'success' : 'secondary'" />
          </AppDatatableColumn>

          <AppDatatableColumn field="createdAt" label="Fecha de Creación" sortable v-slot="props">
            <div class="dateCell">
              <AppIcon icon="calendar" class="metaIcon" />
              <span>{{ formatDate(props.row.createdAt) }}</span>
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn label="Acciones" position="centered" v-slot="props">
            <div class="actionsCell">
              <AppButton
                :to="{
                  name: 'resume.assessmentCriterial',
                  query: {
                    modelId: props.row.id,
                  },
                }"
                v-tooltip="'Configurar criterios'"
                icon="tasks"
                outlined
              >
              </AppButton>

              <AppButton
                :to="{
                  name: 'resume.assessmentResults',
                  query: {
                    modelId: props.row.id,
                  },
                }"
                v-tooltip="'Ver resultados'"
                icon="chart-bar"
                outlined
              >
              </AppButton>

              <AppButtonEdit @click="editModel(props.row)"> </AppButtonEdit>

              <AppButton
                outlined
                :class="props.row.isActive ? 'btnAction--danger' : 'btnAction--success'"
                :disabled="pendingModelId === props.row.id"
                @click="toggleStatus(props.row)"
                :icon="props.row.isActive ? 'ban' : 'check'"
              >
              </AppButton>
            </div>
          </AppDatatableColumn>
        </AppDatatable>

        <!-- Drawer -->
        <AppDrawer :isVisible="drawerOpen" size="lg" @update:isVisible="drawerOpen = $event">
          <template #head>
            <div class="drawerHead">
              <div>
                <h2 class="drawerHead__title">{{ drawerTitle }}</h2>
                <p class="drawerHead__subtitle">Configure los parámetros del modelo de evaluación</p>
              </div>
            </div>
          </template>

          <template #body>
            <div class="drawerBody">
              <form @submit.prevent="saveModel">
                <div class="form-row">
                  <AppFormField :label="'Nombre del modelo'">
                    <input v-model="form.name" type="text" class="form-control" placeholder="Ej: Evaluación Docente 2026" required />
                  </AppFormField>
                </div>

                <div class="form-row">
                  <AppFormField :label="'Descripción'">
                    <textarea v-model="form.description" class="form-control textarea-control" placeholder="Descripción del modelo"></textarea>
                  </AppFormField>
                </div>

                <div class="form-row">
                  <AppFormField :label="'Versión'">
                    <input v-model="form.version" type="text" class="form-control" placeholder="Ej: 3.0" required />
                  </AppFormField>

                  <AppFormField :label="'Escala de evaluación docente'">
                    <AppAutocomplete
                      input-id="teacher-evaluation-scale-id"
                      :options="teacherEvaluationScaleOptions"
                      label="name"
                      :reduce="(option: any) => option.id"
                      v-model="form.teacherEvaluationScaleId"
                    />
                  </AppFormField>
                </div>

                <div class="form-row">
                  <AppFormField :label="'Estado'">
                    <div class="form-check form-switch settingSwitch">
                      <input id="assessment-model-status" v-model="form.isActive" class="form-check-input" type="checkbox" />
                      <label class="form-check-label" for="assessment-model-status">
                        {{ form.isActive ? 'Activo' : 'Inactivo' }}
                      </label>
                    </div>
                  </AppFormField>
                </div>
              </form>
            </div>
          </template>

          <template #footer>
            <div class="drawerFooterActions">
              <AppButton type="button" class="btnSecondary" @click="closeDrawer"> Cancelar </AppButton>

              <AppButton type="button" class="btnPrimary" :disabled="isSavingModel" @click="saveModel">
                <AppIcon icon="save" />
                {{ editingId ? 'Guardar cambios' : 'Crear modelo' }}
              </AppButton>
            </div>
          </template>
        </AppDrawer>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';
import dayjs from 'dayjs';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { useHeaderStore } from '../../../stores/header.store';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { EvaluationModelDto } from '../dtos/evaluationModel.dto';
import { CreateOrUpdateEvaluationModelPayload, CreateOrUpdateEvaluationModelService } from '../services/createOrUpdateEvaluationModel.service';
import { GetEvaluationModelsService } from '../services/getEvaluationModels.service';
import { GetTeacherEvaluationScalesService } from '../services/getTeacherEvaluationScales.service';
import { TeacherEvaluationScaleDto } from '../dtos/teacherEvaluationScale.dto';

interface FormDto extends CreateOrUpdateEvaluationModelPayload {
  version: string;
}

const getEvaluationModelsService = new GetEvaluationModelsService();
const createOrUpdateEvaluationModelService = new CreateOrUpdateEvaluationModelService();
const getTeacherEvaluationScalesService = new GetTeacherEvaluationScalesService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'AssessmentModelsPage',
  components: {
    AppBaseList,
    AppLoading,
    AppButton,
    AppIcon,
    // AppCardDashboard,
    AppDatatable,
    AppDatatableColumn,
    AppBadge,
    AppDrawer,
    AppAutocomplete,
    AppFormField,
    AppButtonEdit,
  },
  setup() {
    const title = 'Modelos de Evaluación';
    useMeta({ title });

    const loading = ref(true);
    const drawerOpen = ref(false);
    const editingId = ref<number | null>(null);
    const pendingModelId = ref<number | null>(null);
    const isSavingModel = ref(false);

    const teacherEvaluationScaleOptions = ref<TeacherEvaluationScaleDto[]>([]);

    const form = ref<FormDto>({
      name: '',
      description: '',
      version: '',
      isActive: true,
      teacherEvaluationScaleId: null,
    });

    const drawerTitle = computed(() => (editingId.value ? 'Editar Modelo de Evaluación' : 'Crear Modelo de Evaluación'));

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Configuración General', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };

        const teacherEvaluationScaleResponse: any = await getTeacherEvaluationScalesService.run({
          noPag: true,
        });
        teacherEvaluationScaleOptions.value = teacherEvaluationScaleResponse;
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const resetForm = () => {
      form.value = {
        name: '',
        description: '',
        version: '',
        isActive: true,
        teacherEvaluationScaleId: null,
      };
      editingId.value = null;
    };

    const openCreate = () => {
      resetForm();
      drawerOpen.value = true;
    };

    const closeDrawer = () => {
      drawerOpen.value = false;
      resetForm();
    };

    const saveModel = async () => {
      try {
        isSavingModel.value = true;

        const payload: CreateOrUpdateEvaluationModelPayload = {
          name: form.value.name.trim(),
          description: form.value.description.trim(),
          version: form.value.version.trim(),
          isActive: form.value.isActive,
          teacherEvaluationScaleId: form.value.teacherEvaluationScaleId,
        };

        await createOrUpdateEvaluationModelService.run(payload, editingId.value ?? undefined);
        closeDrawer();
        updateDatatableService.run();
      } catch (error) {
        console.log('error', error);
      } finally {
        isSavingModel.value = false;
      }
    };

    const editModel = (row: EvaluationModelDto) => {
      editingId.value = row.id;
      form.value = {
        name: row.name,
        description: row.description || '',
        version: row.version,
        isActive: !!row.isActive,
        teacherEvaluationScaleId: row.teacherEvaluationScaleId,
      };
      drawerOpen.value = true;
    };

    const toggleStatus = async (row: EvaluationModelDto) => {
      try {
        pendingModelId.value = row.id;

        const payload: CreateOrUpdateEvaluationModelPayload = {
          name: row.name,
          description: row.description || '',
          version: row.version,
          isActive: !row.isActive,
          teacherEvaluationScaleId: row.teacherEvaluationScaleId,
        };

        await createOrUpdateEvaluationModelService.run(payload, row.id);
        updateDatatableService.run();
      } catch (error) {
        console.log('error', error);
      } finally {
        pendingModelId.value = null;
      }
    };

    const formatDate = (dateValue?: string | null) => (dateValue && dayjs(dateValue).isValid() ? dayjs(dateValue).format('DD/MMM/YYYY') : '-');

    return {
      title,
      loading,
      drawerOpen,
      drawerTitle,
      editingId,
      pendingModelId,
      isSavingModel,
      form,
      teacherEvaluationScaleOptions,
      getEvaluationModelsService,
      formatDate,
      openCreate,
      closeDrawer,
      saveModel,
      editModel,
      toggleStatus,
    };
  },
});
</script>

<style scoped>
.assessmentModelsPage {
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

.iconBig {
  font-size: 1.5rem;
}

.iconSm {
  font-size: 0.875rem;
}

.hTitle {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-dark, #1f2937);
}

.hSub {
  margin: 0.25rem 0 0 0;
  color: var(--color-gray-600, #6b7280);
  font-size: 0.95rem;
}

.btnAdd {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.statValue {
  font-size: 1.9rem;
  font-weight: 800;
  color: var(--color-primary);
}

.statHint {
  margin-top: 0.3rem;
  color: var(--color-gray-600, #6b7280);
  font-size: 0.85rem;
}

.modelCell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modelCell__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
}

.modelCell__description {
  font-size: 0.82rem;
  color: #6b7280;
  line-height: 1.35;
}

.versionBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 58px;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.1);
}

.dateCell {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #4b5563;
  font-size: 0.88rem;
}

.metaIcon {
  color: var(--color-primary);
}

.actionsCell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.btnAction {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 36px;
}

.btnAction--info {
  border-color: #c7d2fe;
}

.btnAction--results {
  border-color: #bfdbfe;
}

.btnAction--edit {
  min-width: 38px;
  justify-content: center;
}

.btnAction--danger {
  justify-content: center;
  border-color: #fecaca;
  color: #dc2626;
}

.btnAction--success {
  justify-content: center;
  border-color: #bbf7d0;
  color: #16a34a;
}

.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 999;
}

.modalCard {
  width: 100%;
  max-width: 700px;
  background: #ffffff;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.2);
}

.modalHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 1rem 1.25rem;
  border-bottom: 1px solid #edf2f7;
}

.modalHeader__left {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.modalIconWrap {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.14), rgba(var(--color-primary-rgb), 0.06));
  color: var(--color-primary);
}

.modalTitle {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #111827;
}

.modalSubtitle {
  margin: 0.2rem 0 0 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.modalClose {
  border: none;
  background: transparent;
  font-size: 1.8rem;
  line-height: 1;
  color: #6b7280;
  cursor: pointer;
}

.modalBody {
  padding: 1.25rem;
}

.formGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field--full {
  grid-column: 1 / -1;
}

.fieldLabel {
  font-size: 0.9rem;
  font-weight: 700;
  color: #374151;
}

.fieldControl {
  width: 100%;
  min-height: 44px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 0.7rem 0.85rem;
  font-size: 0.92rem;
  outline: none;
  transition: 0.2s ease;
}

.fieldControl:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.12);
}

.fieldControl--textarea {
  min-height: 100px;
  resize: vertical;
}

.modalActions {
  margin-top: 1.25rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btnSave,
.btnCancel {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

@media (max-width: 992px) {
  .statsGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .formGrid {
    grid-template-columns: 1fr;
  }

  .statsGrid {
    grid-template-columns: 1fr;
  }

  .hTitle {
    font-size: 1.45rem;
  }

  .actionsCell {
    justify-content: flex-start;
  }
}
.drawerHead__title {
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 900;
}

.drawerHead__subtitle {
  margin: 4px 0 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
}

.drawerBody {
  padding: 16px;
}

.drawerFooterActions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field--full {
  grid-column: 1 / -1;
}

.fieldControl:focus {
  border-color: var(--color-primary, #1b2e83);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 27, 46, 131), 0.15);
}

.fieldControl--textarea {
  min-height: 100px;
  resize: vertical;
}
.drawerHead__title {
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 900;
}

.drawerHead__subtitle {
  margin: 4px 0 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
}

.drawerBody {
  padding: 16px;
}

.drawerFooterActions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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

.textarea-control {
  min-height: 100px;
  resize: vertical;
}

:deep(.form-control) {
  width: 100%;
  min-height: 44px;
}

.btnPrimary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btnSecondary {
  padding: 10px 14px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}
</style>
