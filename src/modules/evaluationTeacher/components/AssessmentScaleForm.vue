<template>
  <AppBaseList :title="isEdit ? 'Editar Escala' : 'Crear Escala'">
    <template #content>
      <!-- Detalles de la Escala -->
      <h6 class="fw-bold mb-3">Detalles de la Escala</h6>
      <AppCard>
        <template #body>
          <div class="row g-0">
            <div class="col-12 border-bottom">
              <AppFormField label="Nombre de la Escala" :form-control="v$.name">
                <input v-model="v$.name.$model" type="text" class="form-control" placeholder="Ingrese un nombre descriptivo para la escala" />
              </AppFormField>
            </div>

            <div class="col-12 border-bottom">
              <AppFormField label="Descripción">
                <textarea v-model="form.description" class="form-control" rows="3" placeholder="Describa el propósito y uso de esta escala"></textarea>
              </AppFormField>
            </div>

            <div class="col-md-6 border-end">
              <AppFormField label="Tipo de Escala" :form-control="v$.type">
                <select v-model="v$.type.$model" class="form-select">
                  <option value="">Seleccione un tipo</option>
                  <option v-for="opt in scaleTypeOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </AppFormField>
            </div>

            <div class="col-md-6">
              <AppFormField label="Valor Máximo">
                <input v-model.number="form.maxValue" type="number" class="form-control" placeholder="5" min="0" />
              </AppFormField>
            </div>
          </div>
        </template>
      </AppCard>

      <!-- Niveles de Evaluación -->
      <div class="d-flex align-items-center justify-content-between mt-4 mb-3">
        <h6 class="fw-bold mb-0">Niveles de Evaluación</h6>
        <AppButton variant="primary" :outlined="false" @click="openAddLevelModal">
          <AppIcon icon="plus" />
          Agregar Nivel
        </AppButton>
      </div>

      <div class="border rounded overflow-hidden">
        <div v-if="levels.length === 0" class="p-4 text-center text-muted">No hay niveles agregados. Haz clic en "Agregar Nivel" para comenzar.</div>
        <table v-else class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Valor</th>
              <th>Etiqueta</th>
              <th>Descripción</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(level, index) in levels" :key="index">
              <td>{{ level.value }}</td>
              <td>{{ level.label }}</td>
              <td class="text-muted">{{ level.description || '—' }}</td>
              <td class="text-end">
                <AppButtonDelete @click="removeLevel(index)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <small v-if="levelsError" class="text-danger">Debe agregar al menos un nivel de evaluación</small>

      <!-- Footer -->
      <div class="d-flex justify-content-end gap-2 mt-4">
        <AppButton variant="ghost" @click="handleCancel" :disabled="isSaving"> Cancelar </AppButton>
        <AppButton variant="primary" :outlined="false" :disabled="isSaving" @click="handleSave">
          <template v-if="isSaving">
            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Guardando...
          </template>
          <span v-else>{{ isEdit ? 'Guardar Cambios' : 'Crear Escala' }}</span>
        </AppButton>
      </div>
    </template>
  </AppBaseList>

  <!-- Modal: Agregar Nivel -->
  <AppModal v-model="showAddLevelModal">
    <form @submit.prevent="addLevel">
      <AppFormModal title="Agregar Nivel">
        <template #content>
          <AppFormField label="Valor">
            <input v-model.number="newLevel.value" type="number" class="form-control" placeholder="Valor numérico del nivel" min="1" step="1" />
          </AppFormField>

          <AppFormField label="Etiqueta">
            <input v-model="newLevel.label" type="text" class="form-control" placeholder="Nombre del nivel (ej: Excelente, Bueno...)" />
          </AppFormField>

          <AppFormField label="Descripción">
            <textarea v-model="newLevel.description" class="form-control" rows="2" placeholder="Describa qué representa este nivel (opcional)"></textarea>
          </AppFormField>

          <div v-if="newLevelError" class="text-danger small mt-1">
            {{ newLevelError }}
          </div>
        </template>
        <template #actions>
          <AppButton variant="primary" :disabled="!canAddLevel"> Agregar </AppButton>
        </template>
      </AppFormModal>
    </form>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

import { GetAssessmentScaleByIdService } from '../services/getAssessmentScaleById.service';
import { CreateAssessmentScaleService } from '../services/createAssessmentScale.service';
import { UpdateAssessmentScaleService } from '../services/updateAssessmentScale.service';
import { GetEvaluationScaleRelatedDataService } from '../services/getEvaluationScaleRelatedData.service';
import type { AssessmentScaleLevel, CreateAssessmentScaleDto } from '../dtos/assessmentScale.dto';
import { useHeaderStore } from '../../../stores/header.store';
import { ToastService } from '../../../shared/services/toast.service';

const getByIdService = new GetAssessmentScaleByIdService();
const createService = new CreateAssessmentScaleService();
const updateService = new UpdateAssessmentScaleService();
const relatedDataService = new GetEvaluationScaleRelatedDataService();
const toastService = new ToastService();

interface LevelForm {
  value: number | null;
  label: string;
  description: string;
}

interface ScaleForm {
  name: string;
  description: string;
  type: string;
  maxValue: number | undefined;
}

export default defineComponent({
  name: 'AssessmentScaleForm',
  components: {
    AppBaseList,
    AppButton,
    AppButtonDelete,
    AppIcon,
    AppCard,
    AppFormField,
    AppModal,
    AppFormModal,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const scaleId = computed(() => (route.params.id ? Number(route.params.id) : null));
    const isEdit = computed(() => !!scaleId.value);

    useMeta({ title: isEdit.value ? 'Editar Escala' : 'Nueva Escala' });

    const isSaving = ref(false);
    const levelsError = ref(false);
    const scaleTypeOptions = ref<{ value: string; label: string }[]>([]);

    const form = reactive<ScaleForm>({
      name: '',
      description: '',
      type: '',
      maxValue: 5,
    });

    const v$ = useVuelidate({ name: { required }, type: { required } }, form);

    const levels = ref<AssessmentScaleLevel[]>([]);

    const showAddLevelModal = ref(false);
    const newLevel = ref<LevelForm>({
      value: null,
      label: '',
      description: '',
    });
    const newLevelError = ref('');

    const canAddLevel = computed(() => {
      const v = newLevel.value.value;
      if (v === null || v === undefined) return false;
      if (!newLevel.value.label?.trim()) return false;
      if (form.maxValue !== undefined && form.maxValue !== null) {
        if (isNaN(Number(v)) || Number(v) < 1 || Number(v) > form.maxValue) return false;
      }
      if (levels.value.some((l) => l.value === v)) return false;
      return true;
    });

    const openAddLevelModal = () => {
      newLevel.value = { value: null, label: '', description: '' };
      newLevelError.value = '';
      showAddLevelModal.value = true;
    };

    const addLevel = () => {
      newLevelError.value = '';
      const v = newLevel.value.value;
      if (v === null || !newLevel.value.label?.trim()) {
        newLevelError.value = 'Valor y etiqueta son requeridos';
        return;
      }
      if (form.maxValue !== undefined && form.maxValue !== null) {
        if (isNaN(Number(v)) || Number(v) < 1 || Number(v) > form.maxValue) {
          newLevelError.value = `El valor debe estar entre 1 y ${form.maxValue}`;
          return;
        }
      }
      if (levels.value.some((l) => l.value === v)) {
        newLevelError.value = 'Ya existe un nivel con ese valor';
        return;
      }
      levels.value = [
        ...levels.value,
        {
          value: v,
          label: newLevel.value.label.trim(),
          description: newLevel.value.description?.trim() || undefined,
        },
      ];
      levelsError.value = false;
      showAddLevelModal.value = false;
    };

    const removeLevel = (index: number) => {
      const arr = [...levels.value];
      arr.splice(index, 1);
      levels.value = arr;
    };

    const handleCancel = () => {
      router.push({ name: 'evaluation-teacher.AssessmentScales' });
    };

    const handleSave = async () => {
      const isValid = await v$.value.$validate();
      levelsError.value = levels.value.length === 0;
      if (!isValid || levelsError.value) return;

      isSaving.value = true;
      try {
        const institutionId = localStorage.getItem('institutionId') || '2';
        const payload: CreateAssessmentScaleDto = {
          name: form.name.trim(),
          description: form.description?.trim() || undefined,
          type: form.type || undefined,
          maxValue: form.maxValue,
          options: levels.value.map(({ id, ...rest }) => rest),
        };

        if (isEdit.value && scaleId.value) {
          await updateService.run(scaleId.value, payload, institutionId);
        } else {
          await createService.run(payload, institutionId);
        }
        router.push({ name: 'evaluation-teacher.AssessmentScales' });
      } catch {
        toastService.show('Error al guardar la escala', 'error');
      } finally {
        isSaving.value = false;
      }
    };

    const loadScale = async () => {
      if (!scaleId.value) return;
      try {
        const institutionId = localStorage.getItem('institutionId') || '2';
        const response = await getByIdService.run(scaleId.value, institutionId);
        const scale = response.data;
        Object.assign(form, {
          name: scale.name || '',
          description: scale.description || '',
          type: scale.type || '',
          maxValue: scale.maxValue ?? 5,
        });
        levels.value = [...(scale.options || [])];
      } catch {
        toastService.show('Error al cargar la escala', 'error');
      }
    };

    const loadRelatedData = async () => {
      try {
        const response = await relatedDataService.run();
        scaleTypeOptions.value = response.data?.scaleTypes || [];
      } catch {
        scaleTypeOptions.value = [];
      }
    };

    onMounted(() => {
      const headerStore = useHeaderStore();
      headerStore.module = { name: 'Evaluación Docente', url: '' };
      headerStore.moduleItem = {
        name: 'Escalas de Evaluación',
        url: '/evaluation-teacher/assessment-scales',
      };
      headerStore.moduleSubItem = {
        name: isEdit.value ? 'Editar Escala' : 'Nueva Escala',
        url: '',
      };
      loadRelatedData();
      loadScale();
    });

    return {
      isEdit,
      isSaving,
      levelsError,
      form,
      v$,
      levels,
      showAddLevelModal,
      newLevel,
      newLevelError,
      canAddLevel,
      scaleTypeOptions,
      openAddLevelModal,
      addLevel,
      removeLevel,
      handleCancel,
      handleSave,
    };
  },
});
</script>
