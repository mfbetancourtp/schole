<template>
  <AppFormModal title="Agregar programas">
    <template v-slot:content>
      <div class="add-programs-container">
        <!-- Subtitle -->
        <div class="tw-mb-4">
          <p class="tw-text-sm tw-text-gray-600 tw-mb-0">
            Selecciona los programas que deseas agregar al período:
            <strong>{{ academicPeriodName }}</strong>
          </p>
        </div>

        <!-- Search and Filters Section -->
        <div class="tw-mb-4">
          <h6 class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">Buscar y filtrar programas</h6>

          <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3 tw-mb-3">
            <!-- Search -->
            <div>
              <label class="tw-text-xs tw-text-gray-600 tw-mb-1 tw-block">Buscar por nombre, sede o facultad</label>
              <input v-model="searchTerm" type="text" class="form-control form-control-sm" placeholder="Buscar..." />
            </div>

            <!-- Campus Filter -->
            <div>
              <label class="tw-text-xs tw-text-gray-600 tw-mb-1 tw-block">Sede</label>
              <select v-model="filters.campusId" class="form-select form-select-sm">
                <option value="">Todas las sedes</option>
                <option v-for="campus in campuses" :key="campus.campusId" :value="campus.campusId">
                  {{ campus.campusName }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Selection Controls -->
        <div class="tw-flex tw-justify-between tw-items-center tw-mb-3 tw-pb-3 tw-border-b">
          <div class="tw-flex tw-items-center tw-gap-2">
            <input type="checkbox" v-model="selectAllFiltered" @change="toggleSelectAll" class="form-check-input tw-m-0" id="selectAll" />
            <label for="selectAll" class="tw-text-sm tw-text-gray-700 tw-mb-0 tw-cursor-pointer">Seleccionar todos los filtrados</label>
          </div>

          <div class="tw-flex tw-gap-4 tw-text-xs tw-text-gray-600">
            <span>
              <strong class="tw-text-primary">{{ availablePrograms.length }}</strong>
              programas disponibles
            </span>
            <span class="tw-text-gray-400">|</span>
            <span>
              <strong class="tw-text-success">{{ filteredPrograms.length }}</strong>
              Programas para agregar
            </span>
          </div>
        </div>

        <!-- Programs List -->
        <div class="programs-list tw-mb-3" v-if="loading">
          <div class="tw-text-center tw-py-8">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
        </div>

        <div class="programs-list tw-mb-3" v-else-if="filteredPrograms.length === 0">
          <div class="tw-text-center tw-py-8 tw-text-gray-500">
            <AppIcon icon="search" class="tw-text-3xl tw-mb-2" />
            <p class="tw-mb-0">No se encontraron programas con los filtros aplicados</p>
          </div>
        </div>

        <div class="programs-list tw-mb-3" v-else>
          <div v-for="program in filteredPrograms" :key="program.id" class="program-item" :class="{ 'program-item-disabled': program.isAssociated }">
            <div class="tw-flex tw-items-center tw-gap-3">
              <input type="checkbox" :id="`program-${program.id}`" :value="program.id" v-model="selectedProgramIds" :disabled="program.isAssociated" class="form-check-input tw-m-0" />
              <label :for="`program-${program.id}`" class="tw-flex-1 tw-cursor-pointer tw-mb-0">
                <div class="tw-flex tw-items-start tw-justify-between tw-gap-2">
                  <div class="tw-flex-1">
                    <div class="tw-font-medium tw-text-gray-800">
                      {{ program.name }}
                    </div>
                    <div class="tw-flex tw-flex-wrap tw-gap-2 tw-mt-1">
                      <span class="tw-text-xs tw-text-gray-600">
                        <AppIcon icon="map-marker-alt" class="tw-text-xs" />
                        {{ program.campusName }}
                      </span>
                      <span v-if="program.facultieName" class="tw-text-xs tw-text-gray-600">
                        <AppIcon icon="building" class="tw-text-xs" />
                        {{ program.facultieName }}
                      </span>
                    </div>
                  </div>
                  <span v-if="program.isAssociated" class="badge bg-secondary tw-text-xs">Ya asociado</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Footer Summary -->
        <div class="tw-bg-gray-50 tw-px-3 tw-py-2 tw-rounded tw-border tw-border-gray-200">
          <div class="tw-flex tw-justify-between tw-items-center tw-text-xs">
            <span class="tw-text-gray-600"> {{ associatedProgramsCount }} programas ya están asociados a este periodo </span>
            <span class="tw-font-semibold tw-text-gray-800">
              <strong class="tw-text-primary">{{ selectedProgramIds.length }}</strong>
              programas seleccionados
            </span>
          </div>
        </div>
      </div>
    </template>

    <template v-slot:actions>
      <AppButton variant="secondary" outlined @click="$emit('close')"> Cancelar </AppButton>
      <AppButton variant="success" :loading="saving" :disabled="selectedProgramIds.length === 0" @click="save"> Agregar </AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import { GetProgramsByCampusService, ProgramByCampusDto, CampusProgramsDto } from '../services/getProgramsByCampus.service';
import { AddProgramsToAcademicPeriodService } from '../services/addProgramsToAcademicPeriod.service';
import { ToastService } from '../../../shared/services/toast.service';

const getProgramsByCampusService = new GetProgramsByCampusService();
const addProgramsToAcademicPeriodService = new AddProgramsToAcademicPeriodService();
const toastService = new ToastService();

export default defineComponent({
  name: 'AddProgramsModal',
  components: {
    AppFormModal,
    AppButton,
    AppIcon,
  },
  props: {
    academicPeriodId: {
      type: Number,
      required: true,
    },
    academicPeriodName: {
      type: String,
      required: true,
    },
    existingProgramIds: {
      type: Array as () => number[],
      default: () => [],
    },
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const loading = ref(false);
    const saving = ref(false);
    const searchTerm = ref('');
    const selectAllFiltered = ref(false);
    const selectedProgramIds = ref<number[]>([]);

    const campuses = ref<CampusProgramsDto[]>([]);
    const allPrograms = ref<ProgramByCampusDto[]>([]);

    const filters = ref({
      campusId: '' as string | number,
    });

    const loadData = async () => {
      try {
        loading.value = true;
        const campusPrograms = await getProgramsByCampusService.run();

        console.log('Campus Programs Response:', campusPrograms);

        // Ensure campusPrograms is an array
        const campusArray = Array.isArray(campusPrograms) ? campusPrograms : [];
        campuses.value = campusArray;

        // Flatten all programs and mark which ones are already associated
        allPrograms.value = campusArray.flatMap((campus) => {
          const programs = Array.isArray(campus.programs) ? campus.programs : [];
          return programs.map((program) => ({
            ...program,
            isAssociated: props.existingProgramIds.includes(program.id),
          }));
        });

        console.log('All Programs:', allPrograms.value);
      } catch (error) {
        console.error('Error loading programs:', error);
        toastService.show('Error al cargar los programas', 'error');
      } finally {
        loading.value = false;
      }
    };

    const availablePrograms = computed(() => {
      return allPrograms.value.filter((program) => !program.isAssociated);
    });

    const filteredPrograms = computed(() => {
      let programs = availablePrograms.value;

      // Apply search filter
      if (searchTerm.value.trim()) {
        const search = searchTerm.value.toLowerCase();
        programs = programs.filter(
          (program) => program.name.toLowerCase().includes(search) || program.campusName.toLowerCase().includes(search) || (program.facultieName && program.facultieName.toLowerCase().includes(search))
        );
      }

      // Apply campus filter
      if (filters.value.campusId !== '') {
        const campusId = Number(filters.value.campusId);
        programs = programs.filter((program) => program.campusId === campusId);
      }

      return programs;
    });

    const associatedProgramsCount = computed(() => {
      return allPrograms.value.filter((program) => program.isAssociated).length;
    });

    const toggleSelectAll = () => {
      if (selectAllFiltered.value) {
        // Select all filtered programs
        const filteredIds = filteredPrograms.value.map((p) => p.id);
        selectedProgramIds.value = Array.from(new Set([...selectedProgramIds.value, ...filteredIds]));
      } else {
        // Deselect all filtered programs
        const filteredIds = filteredPrograms.value.map((p) => p.id);
        selectedProgramIds.value = selectedProgramIds.value.filter((id) => !filteredIds.includes(id));
      }
    };

    const save = async () => {
      if (selectedProgramIds.value.length === 0) {
        toastService.show('Debe seleccionar al menos un programa para continuar', 'warning');
        return;
      }

      try {
        saving.value = true;

        // Build the payload: one object per program
        const selectedPrograms = allPrograms.value.filter((p) => selectedProgramIds.value.includes(p.id));

        const programsCampus = selectedPrograms.map((program) => ({
          campusId: program.campusId,
          programId: program.id,
        }));

        await addProgramsToAcademicPeriodService.run(props.academicPeriodId, {
          programsCampus,
        });

        toastService.show(`Se agregaron ${selectedProgramIds.value.length} programa${selectedProgramIds.value.length > 1 ? 's' : ''} exitosamente`, 'success');
        emit('saved');
        emit('close');
      } catch (error: any) {
        console.error('Error adding programs:', error);
        const message = error?.response?.data?.message || 'Error al agregar los programas';
        toastService.show(message, 'error');
      } finally {
        saving.value = false;
      }
    };

    onMounted(() => {
      loadData();
    });

    return {
      loading,
      saving,
      searchTerm,
      selectAllFiltered,
      selectedProgramIds,
      campuses,
      allPrograms,
      filters,
      availablePrograms,
      filteredPrograms,
      associatedProgramsCount,
      toggleSelectAll,
      save,
    };
  },
});
</script>

<style scoped>
.add-programs-container {
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.programs-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background-color: #fff;
}

.program-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s;
}

.program-item:last-child {
  border-bottom: none;
}

.program-item:hover:not(.program-item-disabled) {
  background-color: #f8f9fa;
}

.program-item-disabled {
  opacity: 0.6;
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.program-item-disabled label {
  cursor: not-allowed;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
