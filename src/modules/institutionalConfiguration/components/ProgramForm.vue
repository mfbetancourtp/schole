<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('close')" size="lg">
    <template #head>
      <AppDrawerHeader
        class="ms-3 pt-3 pb-2"
        :variant="isEditing ? 'edit' : 'create'"
        :icon="isEditing ? 'edit' : 'graduation-cap'"
        :title="`${isEditing ? 'Editar' : 'Configurar'} Programa Académico`"
        :subtitle="`Complete la información requerida para registrar ${isEditing ? 'un cambio en el' : 'un nuevo'} programa académico en el sistema`"
      />
    </template>

    <template #body>
      <form @submit.prevent="save" id="program-form" class="px-4 py-3">
        <!-- Sección 1: Información General del Programa -->
        <div class="form-section mb-5">
          <div class="section-header d-flex align-items-center mb-1">
            <AppIcon icon="building" class="me-2 text-primary fs-5" />
            <h6 class="fw-bold mb-0 text-dark" style="font-size: 16px">Información General del Programa</h6>
          </div>
          <hr class="mt-2 mb-4 text-muted" style="opacity: 0.15" />

          <div class="row g-3">
            <div class="col-md-12">
              <AppFormField :formControl="v$.form.id" label="Programa Académico *">
                <v-select v-model="v$.form.id.$model" :options="programsData || []" :reduce="(opt: any) => opt.id" label="name" placeholder="Buscar programa en catálogo..." :disabled="isEditing" />
                <small class="text-muted mt-1 d-block" style="font-size: 12px">Busca y selecciona un programa del catálogo institucional</small>
              </AppFormField>
            </div>

            <div class="col-md-12">
              <AppFormField :formControl="v$.form.programTypeId" label="Tipo de Programa">
                <v-select
                  v-model="v$.form.programTypeId.$model"
                  :options="programsTypesData"
                  label="name"
                  :reduce="(opt: any) => opt.id"
                  placeholder="Seleccionar tipo"
                  @update:modelValue="onProgramTypeChange"
                />
              </AppFormField>
            </div>

            <div class="col-md-12">
              <AppFormField :formControl="v$.form.operationalSchemeId" label="Versión de Esquema Operativo *">
                <AppAutocompleteRemote
                  :key="operationalSchemeAutocompleteKey"
                  input-id="certificateTemplateId"
                  :service="getAllOperationalSchemesService"
                  :paramsService="{
                    programTypeId: v$.form.programTypeId.$model,
                  }"
                  :init="v$.form.operationalSchemeId.$model ?? null"
                  :modelValue="v$.form.operationalSchemeId.$model"
                  @update:modelValue="onOperationalSchemeChange"
                  label="name"
                  :reduce="(o: any) => o.id"
                />
              </AppFormField>
            </div>

            <div class="col-md-12">
              <AppFormField :formControl="v$.form.programTitle" label="Título que otorga">
                <input type="text" class="form-control" v-model="v$.form.programTitle.$model" placeholder="Ej: Ingeniero de Sistemas" />
              </AppFormField>
            </div>

            <div class="col-md-12">
              <AppFormField :formControl="v$.form.description" label="Descripción">
                <textarea class="form-control bg-light" v-model="v$.form.description.$model" rows="3" placeholder="Descripción general del programa académico"></textarea>
              </AppFormField>
            </div>

            <div class="col-md-6">
              <AppFormField label="Estado inicial">
                <v-select v-model="form.state" placeholder="Seleccionar estado" :options="['Activo', 'En diseño', 'Inactivo']" />
              </AppFormField>
            </div>

            <div class="col-md-6">
              <AppFormField label="Fecha de inicio de vigencia">
                <input type="date" class="form-control bg-light date-input-icon" v-model="form.effectiveDate" />
              </AppFormField>
            </div>
          </div>
        </div>

        <!-- Sección 2: Información Normativa -->
        <div class="form-section mb-5">
          <div class="section-header d-flex align-items-center mb-1">
            <AppIcon icon="graduation-cap" class="me-2 text-success fs-5" />
            <h6 class="fw-bold mb-0 text-dark" style="font-size: 16px">Información Normativa</h6>
          </div>
          <hr class="mt-2 mb-4 text-muted" style="opacity: 0.15" />

          <div class="row g-3">
            <div class="col-md-6">
              <AppFormField label="Resolución de aprobación">
                <input type="text" class="form-control bg-light" placeholder="Ej: Resolución 12345 de 2024" v-model="form.approvalResolution" />
              </AppFormField>
            </div>
            <div class="col-md-6">
              <AppFormField label="Fecha de aprobación">
                <input type="date" class="form-control bg-light date-input-icon" v-model="form.approvalDate" />
              </AppFormField>
            </div>

            <div class="col-md-12">
              <AppFormField :formControl="v$.form.qualifiedRegistration" label="Registro calificado">
                <input type="text" class="form-control bg-light" v-model="v$.form.qualifiedRegistration.$model" placeholder="Ej: RC-2024-001" />
              </AppFormField>
            </div>

            <div class="col-md-6">
              <AppFormField :formControl="v$.form.sniesCode" label="Código SNIES">
                <input type="text" class="form-control bg-light" v-model="v$.form.sniesCode.$model" placeholder="Ej: 123456" />
              </AppFormField>
            </div>

            <div class="col-md-6">
              <AppFormField :formControl="v$.form.internalRecord" label="Registro Interno">
                <input type="text" class="form-control bg-light" v-model="v$.form.internalRecord.$model" placeholder="Ej: RI-2024-001" />
              </AppFormField>
            </div>

            <div class="col-md-6">
              <AppFormField label="Fecha de vencimiento del registro">
                <input type="date" class="form-control bg-light date-input-icon" v-model="form.expirationDate" />
              </AppFormField>
            </div>

            <div class="col-md-12 mt-3">
              <label class="form-label d-block text-dark fw-medium mb-1" style="font-size: 13px">¿Tiene acreditación de alta calidad?</label>
              <div class="d-flex gap-4 mt-1">
                <div class="form-check d-flex align-items-center">
                  <input class="form-check-input mt-0 me-2" type="radio" name="accreditation" id="accrYes" :value="true" v-model="form.hasHighQualityAccreditation" />
                  <label class="form-check-label" for="accrYes">Sí</label>
                </div>
                <div class="form-check d-flex align-items-center">
                  <input class="form-check-input mt-0 me-2" type="radio" name="accreditation" id="accrNo" :value="false" v-model="form.hasHighQualityAccreditation" />
                  <label class="form-check-label" for="accrNo">No</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección 3: Configuración Académica -->
        <div class="form-section mb-5">
          <div class="section-header d-flex align-items-center mb-1">
            <AppIcon icon="user" class="me-2 fs-5" style="color: #9333ea" />
            <h6 class="fw-bold mb-0 text-dark" style="font-size: 16px">Configuración Académica</h6>
          </div>
          <hr class="mt-2 mb-4 text-muted" style="opacity: 0.15" />

          <div class="row g-3">
            <div class="col-md-12">
              <AppFormField :formControl="v$.form.entryProfile" label="Perfil de Ingreso">
                <textarea
                  class="form-control bg-light"
                  v-model="v$.form.entryProfile.$model"
                  rows="3"
                  placeholder="Describe las características, habilidades y conocimientos previos requeridos para el aspirante..."
                ></textarea>
                <div class="text-end text-muted mt-1" style="font-size: 11px">0 / 1000 caracteres</div>
              </AppFormField>
            </div>

            <div class="col-md-12">
              <AppFormField label="Perfil de Egreso" :formControl="v$.form.graduateProfile">
                <textarea
                  class="form-control bg-light"
                  v-model="v$.form.graduateProfile.$model"
                  rows="3"
                  placeholder="Describe las competencias, conocimientos y habilidades que tendrá el egresado..."
                ></textarea>
                <div class="text-end text-muted mt-1" style="font-size: 11px">0 / 1000 caracteres</div>
              </AppFormField>
            </div>

            <div class="col-md-12 mt-4">
              <div class="competenciesSectionHeader">
                <h6 class="competenciesSectionTitle">Competencias del Programa</h6>
              </div>

              <div class="competenciesPanel">
                <div v-if="competencies.length === 0" class="emptyMini">No hay competencias agregadas. Haz clic en "Agregar competencia" para comenzar.</div>

                <div v-else class="d-flex flex-column gap-3 mt-2">
                  <div v-for="(comp, index) in competencies" :key="comp.id || index" class="dynamicCard">
                    <div class="dynamicCard__head">
                      <strong>Competencia {{ index + 1 }}</strong>
                      <AppButton type="button" variant="danger" outlined @click="openConfirmDeleteCompetency(index)">
                        <AppIcon icon="trash" />
                      </AppButton>
                    </div>

                    <div class="form-row">
                      <AppFormField>
                        <label>Código</label>
                        <AppInput :modelValue="comp.code" type="text" placeholder="Ej: PC" @update:modelValue="comp.code = $event" />
                      </AppFormField>

                      <AppFormField>
                        <label>Tipo</label>
                        <AppAutocomplete
                          :input-id="`competency-type-${index}`"
                          :modelValue="comp.competencyType"
                          :options="competencyTypeOptions"
                          label="name"
                          :reduce="(option: any) => option.id"
                          :clearable="false"
                          :multiple="false"
                          @update:modelValue="comp.competencyType = $event"
                        />
                      </AppFormField>
                    </div>

                    <div>
                      <label>Descripción</label>
                      <textarea v-model="comp.name" class="nativeTextarea" placeholder="Describe la competencia del programa..." />
                    </div>
                  </div>
                </div>
              </div>

              <AppButton type="button" variant="secondary" outlined class="mt-2 w-100" @click="addCompetency">
                <AppIcon icon="plus" class="me-2" />
                Agregar competencia
              </AppButton>

              <!-- <div v-if="competencies.length > 0" class="sectionActions">
                <AppButton
                  type="button"
                  variant="primary"
                  :disabled="!canSaveCompetencies || savingProgram"
                  @click="saveCompetencies"
                  >Guardar competencias</AppButton
                >
              </div> -->
            </div>

            <div class="col-md-12 mt-4">
              <AppFormField :formControl="v$.form.ratingScaleId" label="Escala de Valoración">
                <v-select v-model="v$.form.ratingScaleId.$model" :options="ratingScalesData" :reduce="(opt: any) => opt.id" label="title" placeholder="Seleccionar escala" class="bg-light" />
              </AppFormField>
            </div>

            <div class="col-md-12">
              <AppFormField label="Líneas de Investigación">
                <div class="d-flex gap-2 mb-2">
                  <input type="text" class="form-control bg-light" placeholder="Agregar línea de investigación" v-model="currentResearchLine" @keyup.enter.prevent="addResearchLine" />
                  <button type="button" class="btn btn-dark px-3 rounded-2" style="background-color: #0b0f19" @click="addResearchLine">
                    <AppIcon icon="plus" class="text-white" />
                  </button>
                </div>
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <div v-for="(line, index) in researchLines" :key="index" class="badge rounded-pill d-flex align-items-center bg-light border text-dark fw-normal px-3 py-2" style="font-size: 13px">
                    <span class="me-2" style="color: #3b82f6">{{ line }}</span>
                    <button type="button" class="btn-close ms-1" style="font-size: 9px" aria-label="Close" @click="removeResearchLine(index)"></button>
                  </div>
                </div>
              </AppFormField>
            </div>

            <div class="col-md-12">
              <AppFormField label="Campos Ocupacionales">
                <div class="d-flex gap-2 mb-2">
                  <input type="text" class="form-control bg-light" placeholder="Agregar campo ocupacional" v-model="currentOccupationalField" @keyup.enter.prevent="addOccupationalField" />
                  <button type="button" class="btn btn-dark px-3 rounded-2" style="background-color: #0b0f19" @click="addOccupationalField">
                    <AppIcon icon="plus" class="text-white" />
                  </button>
                </div>
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <div
                    v-for="(field, index) in occupationalFields"
                    :key="index"
                    class="badge rounded-pill d-flex align-items-center bg-light border text-dark fw-normal px-3 py-2"
                    style="font-size: 13px"
                  >
                    <span class="me-2" style="color: #3b82f6">{{ field }}</span>
                    <button type="button" class="btn-close ms-1" style="font-size: 9px" aria-label="Close" @click="removeOccupationalField(index)"></button>
                  </div>
                </div>
              </AppFormField>
            </div>
          </div>
        </div>

        <!-- Sección 4: Configuración de Cupos -->
        <div class="form-section mb-3">
          <div class="section-header d-flex align-items-center mb-1">
            <AppIcon icon="users" class="me-2 fs-5" style="color: #ea580c" />
            <h6 class="fw-bold mb-0 text-dark" style="font-size: 16px">Configuración de Cupos</h6>
          </div>
          <hr class="mt-2 mb-4 text-muted" style="opacity: 0.15" />

          <div class="row g-3">
            <div class="col-md-6">
              <AppFormField label="Cupo máximo por cohorte">
                <input type="number" min="0" class="form-control bg-light" placeholder="Ej: 40" v-model.number="form.maximumCapacity" />
              </AppFormField>
            </div>

            <div class="col-md-6">
              <AppFormField label="Cupo mínimo para apertura">
                <input type="number" min="0" class="form-control bg-light" placeholder="Ej: 15" v-model.number="form.minimumCapacity" />
              </AppFormField>
            </div>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="d-flex justify-content-end gap-2 px-2 py-1">
        <AppButton variant="ghost" label="core.cancel" @click="$emit('close')"></AppButton>
        <AppButton variant="primary" :disabled="savingProgram" @click="save">
          {{ isEditing ? 'Guardar cambios' : 'Crear programa' }}
        </AppButton>
      </div>
    </template>
  </AppDrawer>

  <AppModal v-model="deleteCompetencyModalVisible">
    <AppConfirmDeleteModal v-if="deleteCompetencyModalVisible && pendingDeleteCompetency" :entity="pendingDeleteCompetency.entity" @confirmDelete="confirmDeleteCompetency" />
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, computed, watch, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import { GetAllOperationalSchemesService } from '../../curriculumDesign/services/getAllOperationalSchemes.service';
import AppAutocompleteRemote from '../../../shared/components/Forms/AppAutocompleteRemote.vue';
import { CreateOrUpdateProgramsService } from '../services/createOrUpdatePrograms.service';
import { ProgramDto } from '../dtos/programs.dto';

const getAllOperationalSchemesService = new GetAllOperationalSchemesService();
const createOrUpdateProgramsService = new CreateOrUpdateProgramsService();

interface ProgramCompetencyFormItem {
  id?: number | null;
  name: string;
  code: string;
  competencyType: string;
}

interface PendingDeleteCompetency {
  entity: string;
  index: number;
}

export default defineComponent({
  name: 'ProgramForm',
  components: {
    AppDrawer,
    AppDrawerHeader,
    AppFormField,
    AppInput,
    AppAutocomplete,
    AppIcon,
    AppAutocompleteRemote,
    AppButton,
    AppModal,
    AppConfirmDeleteModal,
  },
  props: {
    data: {
      type: Object as PropType<any | null>,
      default: null,
    },
    programsData: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    programsTypesData: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    ratingScalesData: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'saved', 'competencies-saved'],
  setup(props, { emit }) {
    const savingProgram = ref(false);
    const persistedProgramId = ref<number | null>(props.data?.id ?? null);
    const operationalSchemeAutocompleteKey = ref(0);
    const educationTypes = ref<any[]>([]);
    const operationalSchemes = ref<any[]>([]);
    const modalityTypes = ref([]);
    const periodTypes = ref([]);
    const ratingScales = ref<any[]>([]);
    const deleteCompetencyModalVisible = ref(false);
    const pendingDeleteCompetency = ref<PendingDeleteCompetency | null>(null);

    const programsDataList = props.programsData ?? [];

    const competencyTypeOptions = [
      { id: 'General', name: 'General' },
      { id: 'Específica', name: 'Específica' },
    ];

    const competencies = ref<ProgramCompetencyFormItem[]>([]);

    const mapProgramCompetencies = (program?: ProgramDto | null) => {
      competencies.value = (program?.competencies ?? []).map((competency) => ({
        id: competency.id,
        name: competency.name || '',
        code: competency.code || '',
        competencyType: competency.competencyType || 'General',
      }));
    };

    const addCompetency = () => {
      competencies.value.push({
        name: '',
        code: '',
        competencyType: 'General',
      });
    };

    const removeCompetency = (index: number) => {
      competencies.value.splice(index, 1);
    };

    const openConfirmDeleteCompetency = (index: number) => {
      pendingDeleteCompetency.value = {
        index,
        entity: 'Competencia',
      };
      deleteCompetencyModalVisible.value = true;
    };

    const closeDeleteCompetencyModal = () => {
      deleteCompetencyModalVisible.value = false;
      pendingDeleteCompetency.value = null;
    };

    const confirmDeleteCompetency = () => {
      if (pendingDeleteCompetency.value?.index === undefined) return;

      removeCompetency(pendingDeleteCompetency.value.index);
      closeDeleteCompetencyModal();
    };

    // Tags Management
    const currentResearchLine = ref('');
    const currentOccupationalField = ref('');

    const researchLines = computed(() =>
      typeof form.researchLines === 'string' && form.researchLines.trim()
        ? form.researchLines
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : []
    );

    const occupationalFields = computed(() =>
      typeof form.occupationalFields === 'string' && form.occupationalFields.trim()
        ? form.occupationalFields
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : []
    );

    const addResearchLine = () => {
      const val = currentResearchLine.value.trim();
      if (!val) return;

      const currentItems =
        typeof form.researchLines === 'string' && form.researchLines.trim()
          ? form.researchLines
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : [];

      if (!currentItems.includes(val)) {
        currentItems.push(val);
        form.researchLines = currentItems.join(', ');
      }

      currentResearchLine.value = '';
    };

    const removeResearchLine = (index: number) => {
      const currentItems =
        typeof form.researchLines === 'string' && form.researchLines.trim()
          ? form.researchLines
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : [];

      currentItems.splice(index, 1);
      form.researchLines = currentItems.join(', ');
    };

    const addOccupationalField = () => {
      const val = currentOccupationalField.value.trim();
      if (!val) return;

      const currentItems =
        typeof form.occupationalFields === 'string' && form.occupationalFields.trim()
          ? form.occupationalFields
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : [];

      if (!currentItems.includes(val)) {
        currentItems.push(val);
        form.occupationalFields = currentItems.join(', ');
      }

      currentOccupationalField.value = '';
    };

    const removeOccupationalField = (index: number) => {
      const currentItems =
        typeof form.occupationalFields === 'string' && form.occupationalFields.trim()
          ? form.occupationalFields
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : [];

      currentItems.splice(index, 1);
      form.occupationalFields = currentItems.join(', ');
    };

    // Organizations logic (Lazy Loading)
    const sedesList = ref<any[]>([]);
    const facultiesList = ref<any[]>([]);
    const departmentsList = ref<any[]>([]);

    // Flag to prevent watchers from interfering during hierarchy restoration
    const isRestoringHierarchy = ref(false);

    const journeyOptions = ['Diurna', 'Nocturna', 'Mixta', 'Fin de semana'];
    const selectedJourneys = ref<string[]>([]);

    const toggleJourney = (option: string) => {
      const index = selectedJourneys.value.indexOf(option);
      if (index === -1) {
        selectedJourneys.value.push(option);
      } else {
        selectedJourneys.value.splice(index, 1);
      }
    };

    const form = reactive({
      id: null as number | null,
      code: '',
      name: '',
      programTypeId: null as number | null,
      operationalSchemeId: null as number | null,
      modalityTypeId: null as number | null,
      periodTypeId: null as number | null,
      programDuration: '',
      programValue: '',
      qualifiedRegistration: '',
      sniesCode: '',
      internalRecord: '',
      programTitle: '',
      description: '',
      ratingScaleId: null as number | null,
      departmentId: null as number | null,
      directorUserId: null as number | null,
      entryProfile: '',
      graduateProfile: '',
      requirements: '',
      additionalInfo: '',
      selectedSedeId: null as number | null,
      selectedFacultyId: null as number | null,
      state: null as string | null,
      effectiveDate: '',
      approvalResolution: '',
      approvalDate: '',
      expirationDate: '',
      hasHighQualityAccreditation: false,

      // nuevos campos
      researchLines: '',
      occupationalFields: '',
      maximumCapacity: null as number | null,
      minimumCapacity: null as number | null,
    });

    const title = computed(() => (props.isEditing ? 'Editar Programa Académico' : 'Crear Programa Académico'));
    const currentProgramRequestId = computed<number | undefined>(() => {
      if (props.isEditing) {
        return form.id ?? undefined;
      }

      return persistedProgramId.value ?? undefined;
    });

    const hasValidCompetencies = computed(() => {
      return competencies.value.every((comp) => !!String(comp.name || '').trim() && !!String(comp.code || '').trim() && !!String(comp.competencyType || '').trim());
    });

    const canSaveCompetencies = computed(() => {
      return !!String(form.programTitle || '').trim() && !!form.operationalSchemeId && competencies.value.length > 0 && hasValidCompetencies.value;
    });

    watch(deleteCompetencyModalVisible, (value) => {
      if (!value) {
        pendingDeleteCompetency.value = null;
      }
    });

    // 1. Sedes are the root items
    const sedes = computed(() => sedesList.value);

    // 2. Faculties are loaded via API when Sede is selected
    const faculties = computed(() => facultiesList.value);

    // 3. Departments are loaded via API when Faculty is selected
    const departments = computed(() => departmentsList.value);

    const fetchSedeChildren = async (sedeId: number) => {
      console.log('Mocking fetch faculties for sede:', sedeId);
      if (sedeId) {
        facultiesList.value = [
          { id: 201, name: 'Facultad de Ingeniería' },
          { id: 202, name: 'Facultad de Ciencias de la Salud' },
          { id: 203, name: 'Facultad de Ciencias Económicas' },
        ];
      } else {
        facultiesList.value = [];
      }
    };

    const fetchFacultyChildren = async (facultyId: number) => {
      console.log('Mocking fetch departments for faculty:', facultyId);
      if (facultyId) {
        departmentsList.value = [
          { id: 301, name: 'Departamento de Sistemas' },
          { id: 302, name: 'Departamento de Redes' },
          { id: 303, name: 'Departamento de Ciencias Básicas' },
        ];
      } else {
        departmentsList.value = [];
      }
    };

    // Reset children when Sede changes
    watch(
      () => form.selectedSedeId,
      async (newVal, oldVal) => {
        // Skip if we're restoring hierarchy from edit mode
        if (isRestoringHierarchy.value) {
          console.log('⏭️ Watcher de Sede omitido (restaurando jerarquía)');
          return;
        }

        if (newVal && newVal !== oldVal) {
          await fetchSedeChildren(newVal);
          // Clear faculty and departments when sede changes
          form.selectedFacultyId = null;
          departmentsList.value = [];
        } else if (!newVal) {
          facultiesList.value = [];
          departmentsList.value = [];
        }
      }
    );

    // Fetch departments when Faculty changes
    watch(
      () => form.selectedFacultyId,
      async (newVal, oldVal) => {
        // Skip if we're restoring hierarchy from edit mode
        if (isRestoringHierarchy.value) {
          console.log('⏭️ Watcher de Facultad omitido (restaurando jerarquía)');
          return;
        }

        if (newVal && newVal !== oldVal) {
          await fetchFacultyChildren(newVal);
          // Clear department selection when faculty changes
          form.departmentId = null;
        } else if (!newVal) {
          departmentsList.value = [];
        }
      }
    );

    // Helper to find parent hierarchy for Edit Mode
    const restoreHierarchy = async (organizationData: any) => {
      try {
        // Activar flag para desactivar watchers temporalmente
        isRestoringHierarchy.value = true;

        console.log('🔍 Iniciando restauración de jerarquía...');
        console.log('📦 Organization data recibida:', organizationData);

        // El backend envía el objeto organization que es el DEPARTAMENTO
        const department = organizationData;

        if (!department || !department.id) {
          console.warn('⚠️ No se encontró información del departamento');
          return;
        }

        console.log('📋 Departamento:', {
          id: department.id,
          name: department.name,
          parentId: department.parentId,
        });

        // Mock hierarchy data
        console.log('Mocking restoreHierarchy for department:', department.id);
        const facultyId = 201; // Mock faculty ID
        const sedeId = 101; // Mock sede ID

        const faculty = {
          id: facultyId,
          name: 'Facultad de Ingeniería',
          parentId: sedeId,
          children: [{ id: department.id, name: department.name }],
        };
        const sede = {
          id: sedeId,
          name: 'Sede Principal',
          children: [faculty],
        };

        // PASO 3: Precargar los selectores con la jerarquía completa

        // 3.1 Cargar las facultades de esta sede PRIMERO
        if (sede.children && Array.isArray(sede.children) && sede.children.length > 0) {
          console.log('📚 Cargando facultades desde sede.children');
          facultiesList.value = sede.children;
        } else {
          console.log('📚 Consultando facultades de la sede...');
          await fetchSedeChildren(sedeId);
        }

        // 3.2 Cargar los departamentos de esta facultad SEGUNDO
        if (faculty.children && Array.isArray(faculty.children) && faculty.children.length > 0) {
          console.log('📋 Cargando departamentos desde faculty.children');
          departmentsList.value = faculty.children;
        } else {
          console.log('📋 Consultando departamentos de la facultad...');
          await fetchFacultyChildren(facultyId);
        }

        // 3.3 Establecer la sede seleccionada TERCERO
        form.selectedSedeId = sedeId;

        // 3.4 Establecer la facultad seleccionada CUARTO
        form.selectedFacultyId = facultyId;

        // 3.5 El departamento ya está establecido en form.organizationId (línea 486)

        console.log('✅ Jerarquía restaurada exitosamente');
        console.log('📊 Estado final de los selectores:', {
          'Sede seleccionada': form.selectedSedeId,
          'Facultad seleccionada': form.selectedFacultyId,
          'Departamento seleccionado': form.departmentId,
          'Total facultades cargadas': facultiesList.value.length,
          'Total departamentos cargados': departmentsList.value.length,
        });
      } catch (e) {
        console.error('❌ Error al restaurar la jerarquía:', e);
      } finally {
        // Desactivar flag después de completar la restauración
        // Usar nextTick para asegurar que Vue haya procesado todos los cambios
        setTimeout(() => {
          isRestoringHierarchy.value = false;
          console.log('🔓 Watchers reactivados');
        }, 100);
      }
    };

    watch(
      () => props.data,
      async (newData) => {
        console.log(' props.data', props.data);

        if (newData) {
          persistedProgramId.value = newData?.id ?? null;
          mapProgramCompetencies(newData as ProgramDto);

          form.id = newData?.id ? newData.id : null;
          form.code = newData.code;
          form.name = newData.name;
          form.programTypeId = newData.operationalScheme?.programTypeId;
          form.operationalSchemeId = newData.operationalScheme?.id;
          form.modalityTypeId = newData.modalityTypeId;
          form.periodTypeId = newData.periodTypeId;
          form.programDuration = newData.programDuration || '';
          form.programValue = newData.programValue || '';
          form.qualifiedRegistration = newData.qualifiedRegistration || '';
          form.sniesCode = newData.sniesCode || '';
          form.internalRecord = newData.internalRecord || newData.internalStandard || '';
          form.programTitle = newData.programTitle || '';
          form.description = newData.description || '';
          form.ratingScaleId = newData.ratingScaleId ?? null;
          form.departmentId = newData.departmentId ?? newData.organizationId ?? null;
          form.directorUserId = newData.directorUserId ?? null;

          form.entryProfile = newData.entryProfile || '';
          form.graduateProfile = newData.graduateProfile || '';
          form.requirements = newData.requirements || '';
          form.additionalInfo = newData.additionalInfo || '';

          form.state = newData.state || null;
          form.effectiveDate = newData.effectiveDate ? newData.effectiveDate.split('T')[0] : '';
          form.approvalResolution = newData.approvalResolution || '';
          form.approvalDate = newData.approvalDate ? newData.approvalDate.split('T')[0] : '';
          form.expirationDate = newData.expirationDate ? newData.expirationDate.split('T')[0] : '';
          form.hasHighQualityAccreditation = newData.hasHighQualityAccreditation === 1 ? true : false || false;

          // Parse journeys (dayTrip)
          if (newData.dayTrip) {
            selectedJourneys.value = newData.dayTrip.split(' / ').map((s: any) => s.trim());
          } else {
            selectedJourneys.value = [];
          }

          // Restore Organization Hierarchy from organization object
          if (newData.organization) {
            console.log('📦 Organization object received:', newData.organization);
            // Set the departmentId from the organization object
            form.departmentId = newData.organization.id;
            // Restore the hierarchy using the organization object
            await restoreHierarchy(newData.organization);
          } else if (newData.departmentId ?? newData.organizationId) {
            // Fallback: si solo viene el ID, usarlo directamente
            const deptId = newData.departmentId ?? newData.organizationId;
            console.log('🔢 Only departmentId received:', deptId);
            form.departmentId = deptId;
          }

          form.researchLines = Array.isArray(newData.researchLines) ? newData.researchLines.join(', ') : newData.researchLines || '';

          form.occupationalFields = Array.isArray(newData.occupationalFields) ? newData.occupationalFields.join(', ') : newData.occupationalFields || '';

          form.maximumCapacity = newData.maximumCapacity !== undefined && newData.maximumCapacity !== null ? Number(newData.maximumCapacity) : null;

          form.minimumCapacity = newData.minimumCapacity !== undefined && newData.minimumCapacity !== null ? Number(newData.minimumCapacity) : null;
        } else {
          persistedProgramId.value = null;
          // Reset
          Object.assign(form, {
            id: null,
            code: '',
            name: '',
            programTypeId: null,
            operationalSchemeId: null,
            modalityTypeId: null,
            periodTypeId: null,
            programDuration: '',
            programValue: '',
            qualifiedRegistration: '',
            sniesCode: '',
            internalRecord: '',
            programTitle: '',
            description: '',
            ratingScaleId: null,
            departmentId: null,
            directorUserId: null,
            selectedSedeId: null,
            selectedFacultyId: null,
            entryProfile: '',
            graduateProfile: '',
            requirements: '',
            additionalInfo: '',
            state: null,
            effectiveDate: '',
            approvalResolution: '',
            approvalDate: '',
            expirationDate: '',
            hasHighQualityAccreditation: false,
            researchLines: '',
            occupationalFields: '',
            maximumCapacity: null,
            minimumCapacity: null,
          });
          selectedJourneys.value = [];

          // Clear lists
          // sedesList should stay loaded
          facultiesList.value = [];
          departmentsList.value = [];
          competencies.value = [];
        }
      },
      { immediate: true }
    );

    // Cuando el usuario selecciona un programa del catálogo en modo creación,
    // auto-poblamos los campos del form con la data de ese programa
    watch(
      () => form.id,
      async (newId) => {
        if (!newId || props.isEditing) return;

        const selectedProgram = (props.programsData as any[]).find((p: any) => p.id === newId);
        if (!selectedProgram) return;

        form.code = selectedProgram.code || '';
        form.name = selectedProgram.name || '';
        form.programTypeId = selectedProgram.operationalScheme?.programTypeId ?? null;
        form.operationalSchemeId = selectedProgram.operationalScheme?.id ?? null;
        form.modalityTypeId = selectedProgram.modalityTypeId ?? null;
        form.periodTypeId = selectedProgram.periodTypeId ?? null;
        form.programDuration = selectedProgram.programDuration || '';
        form.programValue = selectedProgram.programValue || '';
        form.qualifiedRegistration = selectedProgram.qualifiedRegistration || '';
        form.sniesCode = selectedProgram.sniesCode || '';
        form.internalRecord = selectedProgram.internalRecord || selectedProgram.internalStandard || '';
        form.programTitle = selectedProgram.programTitle || '';
        form.description = selectedProgram.description || '';
        form.ratingScaleId = selectedProgram.ratingScaleId ?? null;
        form.departmentId = selectedProgram.departmentId ?? selectedProgram.organizationId ?? null;
        form.directorUserId = selectedProgram.directorUserId ?? null;
        form.entryProfile = selectedProgram.entryProfile || '';
        form.graduateProfile = selectedProgram.graduateProfile || '';
        form.state = selectedProgram.state || null;
        form.approvalResolution = selectedProgram.approvalResolution || '';
        form.approvalDate = selectedProgram.approvalDate ? selectedProgram.approvalDate.split('T')[0] : '';
        form.effectiveDate = selectedProgram.effectiveDate ? selectedProgram.effectiveDate.split('T')[0] : '';
        form.expirationDate = selectedProgram.expirationDate ? selectedProgram.expirationDate.split('T')[0] : '';
        form.hasHighQualityAccreditation = selectedProgram.hasHighQualityAccreditation === 1 ? true : false;
        form.researchLines = Array.isArray(selectedProgram.researchLines) ? selectedProgram.researchLines.join(', ') : selectedProgram.researchLines || '';
        form.occupationalFields = Array.isArray(selectedProgram.occupationalFields) ? selectedProgram.occupationalFields.join(', ') : selectedProgram.occupationalFields || '';
        form.maximumCapacity = selectedProgram.maximumCapacity ?? null;
        form.minimumCapacity = selectedProgram.minimumCapacity ?? null;
        mapProgramCompetencies(selectedProgram as ProgramDto);

        if (selectedProgram.organization) {
          form.departmentId = selectedProgram.organization.id;
          await restoreHierarchy(selectedProgram.organization);
        }
      }
    );

    const rules = {
      form: {
        id: { required },
        operationalSchemeId: { required },
        programTitle: { required },
        code: {},
        name: {},
        programTypeId: {},
        modalityTypeId: {},
        periodTypeId: {},
        programDuration: {},
        programValue: {},
        qualifiedRegistration: {},
        sniesCode: {},
        internalRecord: {},
        ratingScaleId: {},
        description: {},
        selectedSedeId: {},
        selectedFacultyId: {},
        departmentId: {},
        entryProfile: {},
        graduateProfile: {},
        requirements: {},
        additionalInfo: {},
      },
    };

    const v$ = useVuelidate(rules, { form });

    const onOperationalSchemeChange = (value: any) => {
      v$.value.form.operationalSchemeId.$model = value && typeof value === 'object' ? value.id ?? null : value ?? null;
    };

    const onProgramTypeChange = async () => {
      form.operationalSchemeId = null;

      operationalSchemes.value = [];
      if (form.programTypeId) {
        operationalSchemes.value = [
          { id: 1, name: 'Versión 1.0' },
          { id: 2, name: 'Versión 2.0' },
          { id: 3, name: 'Versión 3.0' },
          { id: 4, name: 'Versión 4.0 (Actual)' },
        ];
      }
    };

    const formatDateForApi = (dateStr: string): string => {
      if (!dateStr) return '';
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year} 00:00:00`;
    };

    const refreshOperationalSchemesAutocomplete = () => {
      operationalSchemeAutocompleteKey.value += 1;
    };

    const buildPayload = () => {
      return {
        departmentId: form.departmentId ?? undefined,
        ratingScaleId: form.ratingScaleId ?? undefined,
        operationalSchemeId: form.operationalSchemeId ?? undefined,
        name: form.name || undefined,
        code: form.code || undefined,
        qualifiedRegistration: form.qualifiedRegistration || undefined,
        sniesCode: form.sniesCode || undefined,
        internalRecord: form.internalRecord || undefined,
        approvalResolution: form.approvalResolution || undefined,
        programTitle: form.programTitle || undefined,
        description: form.description || undefined,
        state: form.state || undefined,
        effectiveDate: formatDateForApi(form.effectiveDate),
        approvalDate: formatDateForApi(form.approvalDate),
        expirationDate: formatDateForApi(form.expirationDate),
        hasHighQualityAccreditation: form.hasHighQualityAccreditation ? 1 : 0,
        entryProfile: form.entryProfile || undefined,
        graduateProfile: form.graduateProfile || undefined,
        researchLines: form.researchLines || undefined,
        occupationalFields: form.occupationalFields || undefined,
        maximumCapacity: form.maximumCapacity ?? undefined,
        minimumCapacity: form.minimumCapacity ?? undefined,
        directorUserId: form.directorUserId ?? undefined,
        competencies: competencies.value.map((comp) => ({
          ...(comp.id !== null && comp.id !== undefined && !Number.isNaN(Number(comp.id)) ? { id: Number(comp.id) } : {}),
          name: String(comp.name || '').trim() || undefined,
          code: String(comp.code || '').trim() || undefined,
          competencyType: String(comp.competencyType || '').trim() || undefined,
        })),
      };
    };

    const getProgramIdFromResponse = (response: any): number | null => {
      if (!response) return null;
      if (typeof response?.id === 'number') return response.id;
      if (typeof response?.data?.id === 'number') return response.data.id;
      if (typeof response?.program?.id === 'number') return response.program.id;
      if (typeof response?.data?.program?.id === 'number') return response.data.program.id;
      return null;
    };

    const getProgramFromResponse = (response: any): ProgramDto | null => {
      if (!response) return null;
      if (Array.isArray(response?.competencies)) return response as ProgramDto;
      if (Array.isArray(response?.data?.competencies)) return response.data as ProgramDto;
      if (Array.isArray(response?.program?.competencies)) return response.program as ProgramDto;
      if (Array.isArray(response?.data?.program?.competencies)) return response.data.program as ProgramDto;
      return null;
    };

    const applySavedProgramResponse = (response: any) => {
      const responseProgramId = getProgramIdFromResponse(response);

      if (responseProgramId) {
        persistedProgramId.value = responseProgramId;
      }

      const program = getProgramFromResponse(response);

      if (!program) return;

      if (program.id) {
        form.id = program.id;
      }

      mapProgramCompetencies(program);
    };

    const persistProgram = async (closeOnSuccess = true, refreshOperationalSchemes = false) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      if (competencies.value.length > 0 && !hasValidCompetencies.value) {
        return;
      }

      if (savingProgram.value) return;

      try {
        savingProgram.value = true;
        const payload = buildPayload();
        const response = await createOrUpdateProgramsService.run(payload, currentProgramRequestId.value);

        applySavedProgramResponse(response);

        if (refreshOperationalSchemes) {
          refreshOperationalSchemesAutocomplete();
          emit('competencies-saved');
        }

        if (closeOnSuccess) {
          emit('saved');
          emit('close');
        }
      } catch (error) {
        console.error('Error al guardar programa:', error);
      } finally {
        savingProgram.value = false;
      }
    };

    const saveCompetencies = async () => {
      if (!canSaveCompetencies.value) return;

      await persistProgram(false, true);
    };

    const save = async () => {
      await persistProgram(true);
    };

    return {
      title,
      form,
      v$,
      save,
      savingProgram,
      operationalSchemeAutocompleteKey,
      onOperationalSchemeChange,
      operationalSchemes,
      educationTypes,
      modalityTypes,
      periodTypes,
      ratingScales,
      journeyOptions,
      selectedJourneys,
      toggleJourney,
      sedes,
      faculties,
      departments,
      onProgramTypeChange,
      competencies,
      competencyTypeOptions,
      addCompetency,
      removeCompetency,
      openConfirmDeleteCompetency,
      deleteCompetencyModalVisible,
      pendingDeleteCompetency,
      confirmDeleteCompetency,
      saveCompetencies,
      canSaveCompetencies,
      researchLines,
      currentResearchLine,
      addResearchLine,
      removeResearchLine,
      occupationalFields,
      currentOccupationalField,
      addOccupationalField,
      removeOccupationalField,
      programsDataList,
      getAllOperationalSchemesService,
    };
  },
});
</script>

<style scoped>
.journey-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.journey-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #fff;
}

.journey-card:hover {
  border-color: var(--color-primary);
  background-color: #f9fafb;
}

.journey-card.active {
  border-color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary), transparent 95%);
}

.journey-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.journey-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

.journey-card.active .journey-name {
  color: var(--color-primary);
  font-weight: 600;
}

.custom-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: white;
}

.custom-checkbox.checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.check-icon {
  color: white !important;
  font-size: 14px;
}

.competenciesPanel {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.competenciesSectionHeader {
  margin-bottom: 0.75rem;
}

.competenciesSectionTitle {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #172033;
}

.emptyMini {
  padding: 1rem;
  border: 1px dashed #d0d5dd;
  border-radius: 14px;
  background: #fcfcfd;
  color: #667085;
  text-align: center;
}

.dynamicCard {
  padding: 1rem;
  border: 1px solid #e4e7ec;
  border-radius: 14px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dynamicCard__head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.nativeTextarea {
  min-height: 110px;
  width: 100%;
  border: 1px solid #d0d5dd;
  border-radius: 12px;
  padding: 0.9rem;
  resize: vertical;
  outline: none;
  font-family: inherit;
}

.nativeTextarea:focus {
  border-color: var(--color-primary);
}

.sectionActions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

/* Color para el ícono de calendario en inputs date */
.date-input-icon::-webkit-calendar-picker-indicator {
  filter: invert(27%) sepia(51%) saturate(2878%) hue-rotate(202deg) brightness(104%) contrast(97%);
  cursor: pointer;
  opacity: 0.8;
}
.date-input-icon::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

/* Custom Footer Buttons */
.custom-cancel-btn {
  color: #38bdf8;
  border-color: #38bdf8;
  background-color: transparent;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
}
.custom-cancel-btn:hover {
  background-color: #f0f9ff;
  border-color: #0284c7;
  color: #0284c7;
}

.custom-submit-btn {
  color: #1e40af;
  border-color: #1e40af;
  background-color: transparent;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
}
.custom-submit-btn:hover {
  background-color: #eff6ff;
  border-color: #1d4ed8;
  color: #1d4ed8;
}

@media (max-width: 768px) {
  .dynamicCard__head,
  .sectionActions {
    flex-direction: column;
    align-items: stretch;
  }

  .journey-grid {
    grid-template-columns: 1fr;
  }
}
</style>
