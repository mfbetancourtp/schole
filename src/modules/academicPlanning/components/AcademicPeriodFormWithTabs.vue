<template>
  <form @submit.prevent="save" novalidate>
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppLoading v-if="loadingData" />

        <template v-else>
          <!-- Tabs Navigation -->
          <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="basic-info-tab" data-bs-toggle="tab" data-bs-target="#basic-info" type="button" role="tab">
                <i class="fa fa-info-circle me-2"></i>
                Informacion Basica
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="validity-tab" data-bs-toggle="tab" data-bs-target="#validity" type="button" role="tab">
                <i class="fa fa-calendar me-2"></i>
                Vigencia
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="programs-tab" data-bs-toggle="tab" data-bs-target="#programs" type="button" role="tab">
                <i class="fa fa-graduation-cap me-2"></i>
                Programas Academicos
              </button>
            </li>
          </ul>

          <!-- Tabs Content -->
          <div class="tab-content mt-3">
            <!-- Tab 1: Informacion Basica -->
            <div class="tab-pane fade show active" id="basic-info" role="tabpanel">
              <div class="row">
                <div class="col-md-6">
                  <AppFormField :form-control="v$.form.code">
                    <label for="code">Codigo</label>
                    <input class="form-control" type="text" id="code" v-model="v$.form.code.$model" placeholder="Ej: 2024-1" />
                  </AppFormField>
                </div>

                <div class="col-md-6">
                  <AppFormField :form-control="v$.form.name">
                    <label for="name">Nombre del Periodo Academico</label>
                    <input class="form-control" type="text" id="name" v-model="v$.form.name.$model" placeholder="Ej: Primer Semestre 2024" />
                  </AppFormField>
                </div>
              </div>

              <AppFormField :form-control="v$.form.programTypeId">
                <label for="programType">Tipo de Programa</label>
                <v-select
                  v-model="v$.form.programTypeId.$model"
                  :options="programTypes"
                  label="name"
                  :reduce="(pt: any) => pt.id"
                  placeholder="Seleccione un tipo de programa"
                  @update:modelValue="onProgramTypeChange"
                />
              </AppFormField>

              <AppFormField :form-control="v$.form.active">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="activeForm" v-model="v$.form.active.$model" />
                  <label class="form-check-label" for="activeForm">
                    {{ v$.form.active.$model ? 'Activo' : 'Inactivo' }}
                  </label>
                </div>
              </AppFormField>
            </div>

            <!-- Tab 2: Vigencia -->
            <div class="tab-pane fade" id="validity" role="tabpanel">
              <div class="row">
                <div class="col-md-6">
                  <AppFormField :form-control="v$.form.startDate">
                    <label for="startDate">Fecha de Inicio</label>
                    <input class="form-control" type="date" id="startDate" v-model="v$.form.startDate.$model" />
                  </AppFormField>
                </div>

                <div class="col-md-6">
                  <AppFormField :form-control="v$.form.endDate">
                    <label for="endDate">Fecha de Fin</label>
                    <input class="form-control" type="date" id="endDate" v-model="v$.form.endDate.$model" />
                  </AppFormField>
                </div>
              </div>

              <div class="alert alert-info mt-3">
                <i class="fa fa-info-circle me-2"></i>
                Las fechas de vigencia determinan el periodo en el cual este periodo academico estara disponible para inscripciones y gestion academica.
              </div>
            </div>

            <!-- Tab 3: Programas Academicos -->
            <div class="tab-pane fade" id="programs" role="tabpanel">
              <div v-if="!form.programTypeId" class="alert alert-info">
                <i class="fa fa-info-circle me-2"></i>
                Primero seleccione un tipo de programa en la pestana "Informacion Basica" para ver los programas disponibles.
              </div>

              <template v-else>
                <div class="mb-3">
                  <label class="form-label">Programas Academicos Asociados <span class="text-danger">*</span></label>
                  <v-select
                    v-model="selectedPrograms"
                    :options="programs"
                    label="name"
                    :reduce="(program: any) => program.id"
                    :multiple="true"
                    placeholder="Seleccione programas academicos"
                    :loading="loadingPrograms"
                    :disabled="loadingPrograms"
                    :class="{ 'is-invalid': programsError }"
                  />
                  <div v-if="programsError" class="text-danger mt-1">
                    <small>Debe seleccionar al menos un programa academico.</small>
                  </div>
                </div>

                <div v-if="selectedPrograms.length > 0" class="mt-4">
                  <h6>Programas Seleccionados ({{ selectedPrograms.length }})</h6>
                  <div class="selected-programs-list">
                    <div v-for="programId in selectedPrograms" :key="programId" class="selected-program-item">
                      <span>{{ getProgramName(programId) }}</span>
                      <button type="button" class="btn btn-sm btn-outline-danger" @click="removeProgram(programId)">
                        <i class="fa fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div v-else-if="!loadingPrograms && programs.length === 0" class="alert alert-warning mt-3">
                  <i class="fa fa-exclamation-triangle me-2"></i>
                  No hay programas disponibles para este tipo de programa.
                </div>
              </template>
            </div>
          </div>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton :loading="saving" :disabled="loadingData">
          {{ data?.id ? 'Actualizar' : 'Guardar' }}
        </AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, toRaw } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { GetProgramTypesService, ProgramTypeDto } from '../services/getProgramTypes.service';
import { GetProgramsService, ProgramDto } from '../services/getPrograms.service';
import { CreateAcademicPeriodService, UpdateAcademicPeriodService, CreateAcademicPeriodDto } from '../services/academicPeriodsCrud.service';

const getProgramTypesService = new GetProgramTypesService();
const getProgramsService = new GetProgramsService();
const createAcademicPeriodService = new CreateAcademicPeriodService();
const updateAcademicPeriodService = new UpdateAcademicPeriodService();

export default defineComponent({
  name: 'AcademicPeriodFormWithTabs',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    AppLoading,
  },
  props: {
    data: {
      type: Object as () => any,
      default: null,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    // Obtener el objeto real del Proxy de Vue
    const data = props.data ? toRaw(props.data) : {};
    const title = data?.id ? 'Editar Periodo Academico' : 'Nuevo Periodo Academico';

    const saving = ref(false);
    const loadingData = ref(true);
    const loadingPrograms = ref(false);
    const programsError = ref(false);

    // Extraer programIds del data (puede venir como programIds o como programs[].id)
    const getInitialProgramIds = (): number[] => {
      if (data?.programIds && Array.isArray(data.programIds)) {
        return data.programIds;
      }
      if (data?.programs && Array.isArray(data.programs)) {
        return data.programs.map((p: any) => p.id);
      }
      return [];
    };

    const selectedPrograms = ref<number[]>(getInitialProgramIds());
    const programTypes = ref<ProgramTypeDto[]>([]);
    const programs = ref<ProgramDto[]>([]);

    const form = reactive({
      code: data?.code || '',
      name: data?.name || '',
      programTypeId: data?.programTypeId || null,
      startDate: data?.startDate || '',
      endDate: data?.endDate || '',
      active: data?.active === 1 || data?.active === true,
    });

    const v$ = useVuelidate(
      {
        form: {
          code: { required },
          name: { required },
          programTypeId: { required },
          startDate: { required },
          endDate: { required },
          active: {},
        },
      },
      { form }
    );

    const loadInitialData = async () => {
      try {
        loadingData.value = true;

        const programTypesResponse = await getProgramTypesService.run();
        programTypes.value = programTypesResponse.data || programTypesResponse;

        // Si estamos editando y ya hay un programTypeId, cargar los programas de ese tipo
        if (data?.programTypeId) {
          await loadProgramsByType(data.programTypeId);
        }
      } catch (error) {
        console.error('Error loading form data:', error);
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

      // Validar que hay al menos un programa seleccionado
      programsError.value = selectedPrograms.value.length === 0;

      if (!formIsValid || programsError.value) return;

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

        if (data?.id) {
          await updateAcademicPeriodService.run(data.id, payload);
        } else {
          await createAcademicPeriodService.run(payload);
        }

        emit('close');
      } catch (error) {
        console.error('Error saving academic period:', error);
      } finally {
        saving.value = false;
      }
    };

    onMounted(() => {
      loadInitialData();
    });

    return {
      title,
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

.is-invalid :deep(.vs__dropdown-toggle) {
  border-color: #dc3545;
}

.selected-programs-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selected-program-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.selected-program-item span {
  font-weight: 500;
}
</style>
