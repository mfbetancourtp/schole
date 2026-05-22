<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="lg">
    <!-- HEAD -->
    <template #head>
      <AppDrawerHeader
        variant="create"
        icon="calendar-alt"
        :title="data?.id ? 'Editar Período Académico' : 'Crear período académico'"
        :subtitle="data?.id ? 'Actualiza la información del período académico' : 'Completa los datos para crear un nuevo período académico'"
      />
    </template>

    <!-- BODY -->
    <template #body>
      <form class="drawerBody drawerBody--form" @submit.prevent="save" novalidate>
        <AppLoading v-if="loadingData" />

        <template v-else>
          <!-- Section 1: Información Básica -->
          <div class="formSection formSection--basic">
            <div class="formSection__header">
              <div class="formSection__iconBox formSection__iconBox--basic">
                <AppIcon icon="list" />
              </div>
              <div class="formSection__headerContent">
                <h4 class="formSection__title">Información básica</h4>
                <p class="formSection__subtitle">Identificación del período académico</p>
              </div>
            </div>
            <div class="formSection__body">
              <div class="formGrid">
                <div class="formGrid__item">
                  <AppFormField :form-control="v$.form.code" label="Código">
                    <AppInput v-model="v$.form.code.$model" type="text" placeholder="Ej: 2024-1" maxlength="20" />
                  </AppFormField>
                </div>
                <div class="formGrid__item">
                  <AppFormField :form-control="v$.form.name" label="Nombre">
                    <AppInput v-model="v$.form.name.$model" type="text" placeholder="Ej: Primer Semestre 2024" maxlength="100" />
                  </AppFormField>
                </div>
                <div class="formGrid__item">
                  <AppFormField :form-control="v$.form.programTypeId" label="Tipo de programa">
                    <AppAutocomplete v-model="v$.form.programTypeId.$model" :options="programTypes" input-id="programType" @update:modelValue="onProgramTypeChange" />
                  </AppFormField>
                </div>
                <div class="formGrid__item">
                  <AppFormField :form-control="v$.form.active" label="Estado">
                    <div class="formCheckSwitch">
                      <input class="formCheckSwitch__input" type="checkbox" id="activeForm" v-model="v$.form.active.$model" />
                      <label class="formCheckSwitch__label" for="activeForm">
                        {{ v$.form.active.$model ? 'Activo' : 'Inactivo' }}
                      </label>
                    </div>
                  </AppFormField>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Vigencia -->
          <div class="formSection formSection--vigencia">
            <div class="formSection__header">
              <div class="formSection__iconBox formSection__iconBox--vigencia">
                <AppIcon icon="calendar" />
              </div>
              <div class="formSection__headerContent">
                <h4 class="formSection__title">Vigencia</h4>
                <p class="formSection__subtitle">Período de validez del período académico</p>
              </div>
            </div>
            <div class="formSection__body">
              <div class="formGrid">
                <div class="formGrid__item">
                  <AppFormField :form-control="v$.form.startDate" label="Fecha de inicio">
                    <input class="nativeInput" type="date" v-model="v$.form.startDate.$model" />
                  </AppFormField>
                </div>
                <div class="formGrid__item">
                  <AppFormField :form-control="v$.form.endDate" label="Fecha de fin">
                    <input class="nativeInput" type="date" v-model="v$.form.endDate.$model" />
                  </AppFormField>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Programas Académicos -->
          <div class="formSection formSection--programs">
            <div class="formSection__header">
              <div class="formSection__iconBox formSection__iconBox--programs">
                <AppIcon icon="graduation-cap" />
              </div>
              <div class="formSection__headerContent">
                <h4 class="formSection__title">Programas académicos</h4>
                <p class="formSection__subtitle">Selecciona los programas asociados a este período</p>
              </div>
            </div>
            <div class="formSection__body">
              <template v-if="!form.programTypeId">
                <div class="infoBox infoBox--warning">
                  <div class="infoBox__icon">
                    <AppIcon icon="info-circle" />
                  </div>
                  <div class="infoBox__content">
                    <p>Primero seleccione un tipo de programa en la sección "Información Básica" para ver los programas disponibles.</p>
                  </div>
                </div>
              </template>

              <template v-else>
                <AppFormField label="Programas Académicos Asociados" :class="{ 'is-invalid': programsError }">
                  <AppAutocomplete v-model="selectedPrograms" :options="programs" input-id="academicPrograms" :multiple="true" :loading="loadingPrograms" :disabled="loadingPrograms" />
                  <div v-if="programsError" class="formError">Debe seleccionar al menos un programa académico.</div>
                </AppFormField>

                <div v-if="selectedPrograms.length > 0" class="selectedPrograms">
                  <h6 class="selectedPrograms__title">Programas Seleccionados ({{ selectedPrograms.length }})</h6>
                  <div class="selectedPrograms__list">
                    <div v-for="programId in selectedPrograms" :key="programId" class="selectedProgramItem">
                      <span>{{ getProgramName(programId) }}</span>
                      <AppButtonDelete @click="removeProgram(programId)" />
                    </div>
                  </div>
                </div>

                <div v-else-if="!loadingPrograms && programs.length === 0" class="infoBox infoBox--warning">
                  <div class="infoBox__icon">
                    <AppIcon icon="exclamation-triangle" />
                  </div>
                  <div class="infoBox__content">
                    <p>No hay programas disponibles para este tipo de programa.</p>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </form>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="d-flex justify-content-end gap-2">
        <AppButton outlined @click="$emit('update:isVisible', false)" :disabled="saving">Cancelar</AppButton>
        <AppButton variant="primary" :loading="saving" :disabled="loadingData || saving" @click="save">{{ data?.id ? 'Actualizar' : 'Guardar' }}</AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, toRaw, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { helpers } from '@vuelidate/validators';
import { required, maxLength, minLength } from '../../../shared/plugins/vuelidate.plugin';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';

import { GetProgramTypesService, ProgramTypeDto } from '../services/getProgramTypes.service';
import { GetProgramsService, ProgramDto } from '../services/getPrograms.service';
import { GetCurriculumOfferingsService } from '../services/getCurriculumOfferings.service';
import { CreateOrUpdateAcademicPeriodService, CreateAcademicPeriodDto } from '../services/createOrUpdateAcademicPeriod.service';
import { ToastService } from '../../../shared/services/toast.service';

const getProgramTypesService = new GetProgramTypesService();
const getProgramsService = new GetProgramsService();
const getCurriculumOfferingsService = new GetCurriculumOfferingsService();
const createOrUpdateAcademicPeriodService = new CreateOrUpdateAcademicPeriodService();
const toastService = new ToastService();

export default defineComponent({
  name: 'AcademicPeriodFormDrawer',
  components: {
    AppDrawer,
    AppDrawerHeader,
    AppFormField,
    AppButton,
    AppButtonDelete,
    AppLoading,
    AppIcon,
    AppAutocomplete,
    AppInput,
  },
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    data: {
      type: Object as () => any,
      default: null,
    },
  },
  emits: ['update:isVisible', 'saved'],
  setup(props, { emit }) {
    const saving = ref(false);
    const loadingData = ref(true);
    const loadingPrograms = ref(false);
    const programsError = ref(false);

    const selectedPrograms = ref<number[]>([]);
    const programTypes = ref<ProgramTypeDto[]>([]);
    const programs = ref<ProgramDto[]>([]);

    const form = reactive({
      code: '',
      name: '',
      programTypeId: null as any,
      startDate: '',
      endDate: '',
      active: false,
    });

    // Validador custom para verificar que endDate sea mayor que startDate
    const endDateGreaterThanStartDate = helpers.withMessage('La fecha de fin debe ser posterior a la fecha de inicio', () => {
      if (!form.startDate || !form.endDate) return true;
      return new Date(form.endDate) > new Date(form.startDate);
    });

    const v$ = useVuelidate(
      {
        form: {
          code: { required, maxLength: maxLength(20), minLength: minLength(1) },
          name: {
            required,
            maxLength: maxLength(100),
            minLength: minLength(3),
          },
          programTypeId: { required },
          startDate: { required },
          endDate: { required, endDateGreaterThanStartDate },
          active: {},
        },
      },
      { form }
    );

    const buildForm = (dataSource: any) => {
      return {
        code: dataSource?.code || '',
        name: dataSource?.name || '',
        programTypeId: dataSource?.programTypeId || null,
        startDate: dataSource?.startDate || '',
        endDate: dataSource?.endDate || '',
        active: dataSource?.active === 1 || dataSource?.active === true,
      };
    };

    const getInitialProgramIds = (dataSource: any): number[] => {
      // Direct array of numeric IDs
      if (dataSource?.programIds && Array.isArray(dataSource.programIds)) {
        return dataSource.programIds.map(Number).filter((id: number) => !isNaN(id) && id > 0);
      }
      // Array of program objects (id or programId)
      if (dataSource?.programs && Array.isArray(dataSource.programs)) {
        return dataSource.programs.map((p: any) => Number(p?.id ?? p?.programId ?? p)).filter((id: number) => !isNaN(id) && id > 0);
      }
      // Junction table: academicPeriodPrograms
      if (dataSource?.academicPeriodPrograms && Array.isArray(dataSource.academicPeriodPrograms)) {
        return dataSource.academicPeriodPrograms.map((p: any) => Number(p?.programId ?? p?.id ?? p)).filter((id: number) => !isNaN(id) && id > 0);
      }
      // curriculumOfferings (deduplicated by programId)
      if (dataSource?.curriculumOfferings && Array.isArray(dataSource.curriculumOfferings)) {
        return [...new Set(dataSource.curriculumOfferings.map((p: any) => Number(p?.programId ?? p?.id ?? p)).filter((id: number) => !isNaN(id) && id > 0))] as number[];
      }
      return [];
    };

    const resetForm = async () => {
      const rawData = props.data ? toRaw(props.data) : {};

      // Reset form data
      const newForm = buildForm(rawData);
      Object.assign(form, newForm);

      selectedPrograms.value = [];
      programsError.value = false;

      await v$.value.$reset();

      try {
        loadingData.value = true;

        const programTypesResponse = await getProgramTypesService.run();
        programTypes.value = programTypesResponse.data || programTypesResponse;

        if (rawData?.programTypeId) {
          await loadProgramsByType(rawData.programTypeId);
        }

        // En modo edición, cargar los programas ya asociados desde curriculum-offerings
        if (rawData?.id) {
          const offeringsResponse = await getCurriculumOfferingsService.run({
            academicPeriodId: rawData.id,
            perPage: 1000,
          });
          const offerings = offeringsResponse.data || [];
          // Extraer IDs únicos de programa (puede haber múltiples ofertas por programa en distintas sedes)
          selectedPrograms.value = [...new Set(offerings.map((o: any) => Number(o.programId)).filter((id: number) => !isNaN(id) && id > 0))] as number[];
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        toastService.show('Error al cargar los datos del formulario', 'error');
      } finally {
        loadingData.value = false;
      }
    };

    const loadProgramsByType = async (programTypeId: number) => {
      try {
        loadingPrograms.value = true;
        const response = await getProgramsService.run({ programTypeId });
        programs.value = response.data || response;
      } catch (error) {
        console.error('Error loading programs:', error);
        programs.value = [];
        toastService.show('Error al cargar los programas', 'error');
      } finally {
        loadingPrograms.value = false;
      }
    };

    const onProgramTypeChange = async (newProgramTypeId: number | null) => {
      selectedPrograms.value = [];
      programs.value = [];

      if (newProgramTypeId) {
        await loadProgramsByType(newProgramTypeId);
      }
    };

    const getProgramName = (programId: number) => {
      const program = programs.value.find((p) => p.id === programId);
      return program?.name || `Programa ${programId}`;
    };

    const removeProgram = (programId: number) => {
      selectedPrograms.value = selectedPrograms.value.filter((id) => id !== programId);
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      programsError.value = selectedPrograms.value.length === 0;

      if (!formIsValid) {
        toastService.show('Por favor complete todos los campos requeridos', 'warning');
        return;
      }

      if (programsError.value) {
        toastService.show('Debe seleccionar al menos un programa académico', 'warning');
        return;
      }

      try {
        saving.value = true;

        const payload: CreateAcademicPeriodDto = {
          code: form.code,
          name: form.name,
          programTypeId: form.programTypeId,
          active: form.active ? 1 : 0,
          startDate: form.startDate,
          endDate: form.endDate,
          programIds: selectedPrograms.value,
        };

        const rawData = props.data ? toRaw(props.data) : {};

        await createOrUpdateAcademicPeriodService.run(payload, rawData?.id);
        toastService.show(rawData?.id ? 'Período académico actualizado exitosamente' : 'Período académico creado exitosamente', 'success');

        emit('saved');
        emit('update:isVisible', false);
      } catch (error: any) {
        console.error('Error saving academic period:', error);
        const message = error?.response?.data?.message || 'Error al guardar el período académico';
        toastService.show(message, 'error');
      } finally {
        saving.value = false;
      }
    };

    // Watch para resetear el formulario cuando el drawer se abre
    watch(
      () => props.isVisible,
      (newVal) => {
        if (newVal) {
          resetForm();
        }
      }
    );

    // Watch para resetear cuando cambian los datos
    watch(
      () => props.data,
      () => {
        if (props.isVisible) {
          resetForm();
        }
      },
      { deep: true }
    );

    onMounted(() => {
      resetForm();
    });

    return {
      form,
      v$,
      save,
      saving,
      loadingData,
      loadingPrograms,
      programsError,
      selectedPrograms,
      programTypes,
      programs,
      getProgramName,
      removeProgram,
      onProgramTypeChange,
    };
  },
});
</script>

<style scoped>
/* DRAWER BODY */
.drawerBody {
  padding: 1.5rem;
  background-color: #f9fafb;
}

.drawerBody--form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* FORM SECTIONS - Card Style */
.formSection {
  background-color: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.formSection__header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.formSection__iconBox {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #fff;
}

.formSection__iconBox--basic {
  background-color: #dbeafe;
  color: #1e40af;
}

.formSection--basic .formSection__iconBox--basic {
  background-color: #3b82f6;
  color: #fff;
}

.formSection__iconBox--vigencia {
  background-color: #e9d5ff;
  color: #6b21a8;
}

.formSection--vigencia .formSection__iconBox--vigencia {
  background-color: #a855f7;
  color: #fff;
}

.formSection__iconBox--programs {
  background-color: #dcfce7;
  color: #15803d;
}

.formSection--programs .formSection__iconBox--programs {
  background-color: #22c55e;
  color: #fff;
}

.formSection__headerContent {
  flex: 1;
}

.formSection__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
  text-transform: capitalize;
}

.formSection__subtitle {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}

.formSection__body {
  padding: 1rem;
}

/* FORM GRID */
.formGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.formGrid__item {
  min-width: 0;
}

.formGrid__item:nth-child(odd):last-child {
  grid-column: 1;
}

@media (max-width: 640px) {
  .formGrid {
    grid-template-columns: 1fr;
  }
}

/* FORM FIELDS */
.formCheckSwitch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.formCheckSwitch__input {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.formCheckSwitch__label {
  margin: 0;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
}

.nativeInput {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: inherit;
  background-color: #ffffff;
  color: #1f2937;
}

.nativeInput::placeholder {
  color: #9ca3af;
}

.nativeInput:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* Date picker specific */
.nativeInput[type='date'],
.nativeInput[type='time'],
.nativeInput[type='datetime-local'] {
  font-family: inherit;
  color-scheme: light;
}

.nativeInput[type='date']::-webkit-calendar-picker-indicator,
.nativeInput[type='time']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.5);
}

.nativeInput[type='date']::-moz-calendar-picker-indicator {
  cursor: pointer;
}

/* INFO BOX */
.infoBox {
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background-color: #eff6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 0.375rem;
  margin-top: 1rem;
}

.infoBox__icon {
  flex-shrink: 0;
  color: #3b82f6;
  margin-top: 0.125rem;
}

.infoBox__content p {
  margin: 0;
  font-size: 0.875rem;
  color: #1f2937;
  line-height: 1.5;
}

.infoBox--warning {
  background-color: #fffbeb;
  border-left-color: #f59e0b;
}

.infoBox--warning .infoBox__icon {
  color: #f59e0b;
}

/* FORM ERROR */
.formError {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* SELECTED PROGRAMS */
.selectedPrograms {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.selectedPrograms__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.selectedPrograms__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.selectedProgramItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.875rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  gap: 0.75rem;
}

.selectedProgramItem span {
  font-weight: 500;
  flex: 1;
  word-break: break-word;
  color: #374151;
  font-size: 0.875rem;
}
</style>
