<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="lg">
    <!-- HEAD -->
    <template #head>
      <div class="std-head-layout">
        <div class="std-head-icon">
          <AppIcon icon="graduation-cap" />
        </div>
        <div>
          <h6 class="std-head-title">
            {{ mode === 'edit' ? 'Editar Tipo de Beca' : 'Nuevo Tipo de Beca' }}
          </h6>
          <p class="std-head-subtitle">
            {{ mode === 'edit' ? 'Actualiza la configuración del tipo de beca' : 'Completa la información del nuevo tipo de beca' }}
          </p>
        </div>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <form class="std-body-form" id="scholarship-type-form" @submit.prevent="handleSave">
        <!-- Sección: Información General -->
        <div class="std-section">
          <p class="std-section__title">Información General</p>

          <AppFormField :form-control="v$.form.name" label="Nombre *">
            <input type="text" class="form-control" v-model="v$.form.name.$model" placeholder="Ej. Beca de Mérito Académico" />
          </AppFormField>

          <AppFormField :form-control="v$.form.abbreviation" label="Abreviatura *">
            <input type="text" class="form-control" v-model="v$.form.abbreviation.$model" placeholder="Ej. BMA" maxlength="10" @input="form.abbreviation = form.abbreviation.toUpperCase()" />
          </AppFormField>

          <AppFormField :form-control="v$.form.description" label="Descripción *">
            <textarea class="form-control" v-model="v$.form.description.$model" rows="3" placeholder="Describe el propósito de este tipo de beca" />
          </AppFormField>

          <div class="std-toggle-row">
            <div>
              <label class="std-toggle-label">Estado</label>
              <p class="std-toggle-hint">
                {{ form.isActive ? 'Activo' : 'Inactivo' }}
              </p>
            </div>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" role="switch" id="stIsActive" :checked="form.isActive" @change="form.isActive = !form.isActive" />
            </div>
          </div>
        </div>

        <!-- Sección: Parámetros de Permanencia -->
        <div class="std-section">
          <p class="std-section__title">Parámetros de Permanencia</p>

          <div class="std-fields-row">
            <AppFormField :form-control="v$.form.minimumSemesterAverage" label="Promedio mín. semestral *">
              <input type="number" class="form-control" v-model.number="v$.form.minimumSemesterAverage.$model" placeholder="Ej. 4.5" step="0.1" min="0" max="5" />
            </AppFormField>

            <AppFormField :form-control="v$.form.minimumSemesterCredits" label="Créditos mín. semestral *">
              <input type="number" class="form-control" v-model.number="v$.form.minimumSemesterCredits.$model" placeholder="Ej. 3" min="0" />
            </AppFormField>
          </div>

          <div class="std-fields-row">
            <AppFormField :form-control="v$.form.maximumRenewals" label="Máx. renovaciones *">
              <input type="number" class="form-control" v-model.number="v$.form.maximumRenewals.$model" placeholder="Ej. 4" min="0" />
            </AppFormField>
          </div>

          <div class="std-checks-row">
            <label class="std-check-item">
              <input type="checkbox" v-model="form.automaticRenewal" class="std-check-input" />
              <span class="std-check-label">Renovación automática</span>
            </label>
            <label class="std-check-item">
              <input type="checkbox" v-model="form.compatibleOtherScholarship" class="std-check-input" />
              <span class="std-check-label">Compatible con otras becas</span>
            </label>
          </div>
        </div>

        <!-- Sección: Requisitos por Defecto -->
        <div class="std-section">
          <p class="std-section__title">Requisitos por Defecto</p>
          <p class="std-section__sub">Configure los requisitos mínimos que deben cumplir los postulantes</p>

          <table v-if="localRequirements.length" class="std-table">
            <thead>
              <tr>
                <th class="std-th">Tipo</th>
                <th class="std-th">Op</th>
                <th class="std-th">Valor</th>
                <th class="std-th std-th--center">Oblig</th>
                <th class="std-th"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(req, idx) in localRequirements" :key="idx" class="std-row">
                <td class="std-td std-td--type">{{ req.requirementType }}</td>
                <td class="std-td std-td--op">{{ req.operator }}</td>
                <td class="std-td">{{ req.value }}</td>
                <td class="std-td std-th--center">
                  <span class="std-badge">{{ req.isRequired ? 'Sí' : 'No' }}</span>
                </td>
                <td class="std-td std-td--action">
                  <AppCheckPermission permission="studentWeldare.typeScholarship.delete">
                    <AppButtonDelete nativeType="button" @click.stop="removeRequirement(idx)" />
                  </AppCheckPermission>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="std-inline-action">
            <AppCheckPermission permission="studentWeldare.typeScholarship.edit">
              <AppButton outlined nativeType="button" @click="showReqModal = true">
                <AppIcon icon="plus" class="std-btn-icon" />
                Agregar requisito
              </AppButton>
            </AppCheckPermission>
          </div>
        </div>

        <!-- Sección: Documentos Requeridos -->
        <div class="std-section">
          <p class="std-section__title">Documentos Requeridos</p>
          <p class="std-section__sub">Especifique los documentos que los estudiantes deben adjuntar</p>

          <div v-if="isLoadingDocs" class="std-loading">
            <AppIcon icon="circle-notch" class="std-loading__icon" />
            Cargando documentos...
          </div>

          <template v-else>
            <table v-if="selectedDocuments.length" class="std-table">
              <thead>
                <tr>
                  <th class="std-th">Documento</th>
                  <th class="std-th std-th--center">Obligatorio</th>
                  <th class="std-th"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in selectedDocuments" :key="doc.id" class="std-row">
                  <td class="std-td">{{ doc.name }}</td>
                  <td class="std-td std-th--center">
                    <span class="std-badge">Sí</span>
                  </td>
                  <td class="std-td std-td--action">
                    <AppCheckPermission permission="studentWeldare.typeScholarship.delete">
                      <AppButtonDelete nativeType="button" @click.stop="removeDocument(doc.id)" />
                    </AppCheckPermission>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="std-doc-add-row">
              <select v-model="pendingDocId" class="form-select std-doc-select">
                <option value="">Seleccione un documento</option>
                <option v-for="doc in unselectedDocuments" :key="doc.id" :value="doc.id">
                  {{ doc.name }}
                </option>
              </select>
              <AppCheckPermission permission="studentWeldare.typeScholarship.edit">
                <AppButton :outlined="false" nativeType="button" :disabled="!pendingDocId" @click="addDocument">
                  <AppIcon icon="plus" class="std-btn-icon" />
                  Agregar
                </AppButton>
              </AppCheckPermission>
            </div>
          </template>
        </div>
      </form>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="std-footer-actions">
        <AppButton outlined variant="secondary" nativeType="button" @click="$emit('update:isVisible', false)"> Cancelar </AppButton>
        <AppButton variant="primary" :outlined="false" nativeType="submit" form="scholarship-type-form" :disabled="isSaving">
          {{ mode === 'edit' ? 'Guardar Cambios' : 'Crear Tipo de Beca' }}
        </AppButton>
      </div>
    </template>
  </AppDrawer>

  <!-- Modal: Agregar Requisito -->
  <AppModal v-model="showReqModal" size="sm">
    <ScholarshipRequirementForm v-if="showReqModal" @save="onRequirementSaved" @cancel="showReqModal = false" />
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, watch, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minValue } from '../../../shared/plugins/vuelidate.plugin';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import ScholarshipRequirementForm from './ScholarshipRequirementForm.vue';

import type { ScholarshipTypeDto, RequiredDocumentDto, ScholarshipDocumentBasicDto, DefaultRequirementDto, LocalRequirementItemDto } from '../dtos/scholarshipType.dto';
import { GetScholarshipDocumentsService } from '../services/getScholarshipDocuments.service';
import { GetRequiredDocumentsService } from '../services/getRequiredDocuments.service';
import { GetDefaultRequirementsService } from '../services/getDefaultRequirements.service';

type DrawerMode = 'create' | 'edit';

const getDocumentsService = new GetScholarshipDocumentsService();
const getRequiredDocumentsService = new GetRequiredDocumentsService();
const getDefaultRequirementsService = new GetDefaultRequirementsService();

export default defineComponent({
  name: 'ScholarshipTypeDrawer',
  components: {
    AppDrawer,
    AppIcon,
    AppButton,
    AppButtonDelete,
    AppFormField,
    AppModal,
    AppCheckPermission,
    ScholarshipRequirementForm,
  },
  emits: ['update:isVisible', 'save'],

  props: {
    isVisible: { type: Boolean, required: true },
    mode: { type: String as PropType<DrawerMode>, default: 'create' },
    formData: {
      type: Object as PropType<ScholarshipTypeDto | null>,
      default: null,
    },
  },

  setup(props, { emit }) {
    const isSaving = ref(false);
    const isLoadingDocs = ref(false);

    // ── Documents ──────────────────────────────────────────────────────────────
    const availableDocuments = ref<ScholarshipDocumentBasicDto[]>([]);
    const selectedDocumentIds = ref<number[]>([]);
    const existingRequiredDocs = ref<RequiredDocumentDto[]>([]);

    const selectedDocuments = computed(() => availableDocuments.value.filter((d) => selectedDocumentIds.value.includes(d.id)));
    const unselectedDocuments = computed(() => availableDocuments.value.filter((d) => !selectedDocumentIds.value.includes(d.id)));

    const pendingDocId = ref<number | ''>('');

    const addDocument = () => {
      if (!pendingDocId.value) return;
      selectedDocumentIds.value.push(Number(pendingDocId.value));
      pendingDocId.value = '';
    };

    const removeDocument = (docId: number) => {
      const idx = selectedDocumentIds.value.indexOf(docId);
      if (idx > -1) selectedDocumentIds.value.splice(idx, 1);
    };

    // ── Requirements ──────────────────────────────────────────────────────────
    const localRequirements = ref<LocalRequirementItemDto[]>([]);
    const existingDefaultRequirements = ref<DefaultRequirementDto[]>([]);
    const showReqModal = ref(false);

    const removeRequirement = (idx: number) => {
      localRequirements.value.splice(idx, 1);
    };

    const onRequirementSaved = (payload: LocalRequirementItemDto) => {
      localRequirements.value.push({ ...payload });
      showReqModal.value = false;
    };

    // ── Form ──────────────────────────────────────────────────────────────────
    const buildForm = (data: ScholarshipTypeDto | null) => ({
      id: data?.id ?? undefined,
      name: data?.name ?? '',
      description: data?.description ?? '',
      abbreviation: data?.abbreviation ?? '',
      isActive: data ? !!data.isActive : true,
      minimumSemesterAverage: data?.minimumSemesterAverage ?? null,
      minimumSemesterCredits: data?.minimumSemesterCredits ?? null,
      automaticRenewal: !!data?.automaticRenewal,
      compatibleOtherScholarship: !!data?.compatibleOtherScholarship,
      maximumRenewals: data?.maximumRenewals ?? null,
    });

    const form = reactive(buildForm(props.formData));

    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          abbreviation: { required },
          description: { required },
          minimumSemesterAverage: { required, minValue: minValue(0.1) },
          minimumSemesterCredits: { required, minValue: minValue(1) },
          maximumRenewals: { required, minValue: minValue(1) },
        },
      },
      { form },
      { $scope: false }
    );

    // ── Data loading ──────────────────────────────────────────────────────────
    const extractList = (response: any): any[] => {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.items)) return response.items;
      return [];
    };

    const loadData = async () => {
      isLoadingDocs.value = true;
      try {
        const docsResponse = await getDocumentsService.run({ noPag: 'true' });
        availableDocuments.value = extractList(docsResponse).filter((d: any) => d.isActive);

        if (props.mode === 'edit' && props.formData?.id) {
          const [reqDocsRes, defReqRes] = await Promise.all([
            getRequiredDocumentsService.run({
              typeScholarshipId: props.formData.id,
              noPag: 'true',
            }),
            getDefaultRequirementsService.run({
              typeScholarshipId: props.formData.id,
              noPag: 'true',
            }),
          ]);

          const reqDocs: RequiredDocumentDto[] = extractList(reqDocsRes);
          existingRequiredDocs.value = reqDocs;
          selectedDocumentIds.value = reqDocs.map((d: any) => Number(d.scholarshipDocumentId ?? d.scholarshipDocument?.id)).filter((id) => !isNaN(id) && id > 0);

          const defReqs: DefaultRequirementDto[] = extractList(defReqRes);
          existingDefaultRequirements.value = defReqs;
          localRequirements.value = defReqs.map((dr: any) => {
            const sr = dr.scholarshipRequirement ?? {};
            return {
              defReqId: dr.id,
              requirementType: sr.requirementType ?? '',
              operator: sr.operator ?? '>=',
              value: sr.value ?? 0,
              isRequired: !!sr.isRequired,
            };
          });
        } else {
          existingRequiredDocs.value = [];
          selectedDocumentIds.value = [];
          existingDefaultRequirements.value = [];
          localRequirements.value = [];
        }
      } catch (e) {
        console.error('Error cargando datos del drawer:', e);
        availableDocuments.value = [];
      } finally {
        isLoadingDocs.value = false;
      }
    };

    const resetForm = (data: ScholarshipTypeDto | null) => {
      Object.assign(form, buildForm(data));
      v$.value.$reset();
      localRequirements.value = [];
      existingDefaultRequirements.value = [];
    };

    watch(
      () => props.isVisible,
      (visible) => {
        if (visible) {
          resetForm(props.formData);
          loadData();
        }
      },
      { immediate: true }
    );

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      isSaving.value = true;
      try {
        emit('save', {
          id: form.id,
          name: form.name.trim(),
          description: form.description.trim(),
          abbreviation: form.abbreviation.trim(),
          isActive: form.isActive,
          minimumSemesterAverage: Number(form.minimumSemesterAverage),
          minimumSemesterCredits: Number(form.minimumSemesterCredits),
          automaticRenewal: !!form.automaticRenewal,
          compatibleOtherScholarship: !!form.compatibleOtherScholarship,
          maximumRenewals: Number(form.maximumRenewals),
          selectedDocumentIds: [...selectedDocumentIds.value],
          existingRequiredDocs: [...existingRequiredDocs.value],
          localRequirements: [...localRequirements.value],
          existingDefaultRequirements: [...existingDefaultRequirements.value],
        });
      } finally {
        isSaving.value = false;
      }
    };

    return {
      form,
      v$,
      isSaving,
      isLoadingDocs,
      selectedDocuments,
      unselectedDocuments,
      pendingDocId,
      addDocument,
      removeDocument,
      localRequirements,
      showReqModal,
      removeRequirement,
      onRequirementSaved,
      handleSave,
    };
  },
});
</script>

<style scoped>
/* ── Head ── */
.std-head-layout {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.std-head-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1rem;
  flex-shrink: 0;
}

.std-head-title {
  margin: 0;
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
}

.std-head-subtitle {
  margin: 0.15rem 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

/* ── Body ── */
.std-body-form {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Section ── */
.std-section {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem 1.125rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.std-section__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.std-section__sub {
  font-size: 0.8rem;
  color: #6b7280;
  margin: -0.25rem 0 0;
}

/* ── Toggle row ── */
.std-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
}

.std-toggle-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.std-toggle-hint {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0.15rem 0 0;
}

.form-check-input {
  width: 2.5em;
  height: 1.25em;
  cursor: pointer;
}

.form-check-input:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* ── Fields row (2 columns) ── */
.std-fields-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

/* ── Checkboxes ── */
.std-checks-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.std-check-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.std-check-input {
  width: 15px;
  height: 15px;
  cursor: pointer;
  accent-color: #3b82f6;
  flex-shrink: 0;
}

.std-check-label {
  font-size: 0.875rem;
  color: #374151;
}

/* ── Loading ── */
.std-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  padding: 0.5rem 0;
}

.std-loading__icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ── Tables (requirements & documents) ── */
.std-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0.5rem;
}

.std-th {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.std-th--center {
  text-align: center;
}

.std-row:not(:last-child) td {
  border-bottom: 1px solid #f1f5f9;
}

.std-td {
  padding: 7px 8px;
  font-size: 0.8125rem;
  color: #1e293b;
}

.std-td--type {
  font-weight: 600;
  color: #2563eb;
}

.std-td--op {
  font-weight: 700;
  color: #64748b;
}

.std-td--action {
  text-align: right;
  width: 42px;
}

.std-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 4px;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

/* ── Document add row ── */
.std-doc-add-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.std-doc-select {
  flex: 1;
  font-size: 0.8125rem;
}

/* ── Button icon spacing ── */
.std-btn-icon {
  margin-right: 4px;
  font-size: 0.75rem;
}

/* ── Inline action (button that should not stretch) ── */
.std-inline-action {
  align-self: flex-start;
}

/* ── Footer ── */
.std-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  width: 100%;
}
</style>
