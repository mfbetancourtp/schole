<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="md">
    <!-- HEAD -->
    <template #head>
      <div class="drawer-head-content">
        <div class="drawer-head-content__icon">
          <AppIcon icon="layer-group" />
        </div>
        <div class="drawer-head-content__texts">
          <span class="drawer-head-content__title">Agregar Programas</span>
          <span class="drawer-head-content__sub"
            >Selecciona los programas a agregar: <strong>{{ academicPeriodName }}</strong></span
          >
        </div>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <div class="drawerBody--form">
        <div class="addProgramsBody">
          <!-- Search and Filters Section -->
          <div class="formSection">
            <h5 class="formSection__title">Buscar y filtrar programas</h5>

            <div class="filterGrid">
              <!-- Search -->
              <div class="filterItem">
                <label class="filterLabel">Buscar por nombre, sede o facultad</label>
                <input v-model="searchTerm" type="text" class="nativeInput" placeholder="Buscar..." />
              </div>

              <!-- Campus Filter -->
              <div class="filterItem">
                <label class="filterLabel">Sede</label>
                <select v-model="filters.campusId" class="nativeInput nativeSelect">
                  <option value="">Todas las sedes</option>
                  <option v-for="campus in campuses" :key="campus.campusId" :value="campus.campusId">
                    {{ campus.campusName }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Selection Controls -->
          <div class="selectionControls">
            <div class="selectionCheckbox">
              <input type="checkbox" v-model="selectAllFiltered" @change="toggleSelectAll" class="nativeCheckbox" id="selectAll" />
              <label for="selectAll" class="selectAllLabel">Seleccionar todos los filtrados</label>
            </div>

            <div class="selectionStats">
              <span class="statItem">
                <strong class="statNumber statNumber--primary">{{ availablePrograms.length }}</strong>
                disponibles
              </span>
              <span class="statSeparator">|</span>
              <span class="statItem">
                <strong class="statNumber statNumber--success">{{ selectedProgramIds.length }}</strong>
                seleccionados
              </span>
            </div>
          </div>

          <!-- Programs List -->
          <div class="programsList" v-if="loading">
            <div class="listMessage listLoading">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
            </div>
          </div>

          <div class="programsList" v-else-if="filteredPrograms.length === 0">
            <div class="listMessage listEmpty">
              <AppIcon icon="search" class="emptyIcon" />
              <p class="emptyText">No se encontraron programas con los filtros aplicados</p>
            </div>
          </div>

          <div class="programsList" v-else>
            <div v-for="program in filteredPrograms" :key="`${program.id}_${program.campusId}`" class="programItem" :class="{ 'programItem--disabled': program.isAssociated }">
              <div class="programItemContent">
                <input
                  type="checkbox"
                  :id="`program-${program.id}-${program.campusId}`"
                  :value="`${program.id}_${program.campusId}`"
                  v-model="selectedProgramIds"
                  :disabled="program.isAssociated"
                  class="programCheckbox"
                />
                <label :for="`program-${program.id}-${program.campusId}`" class="programLabel">
                  <div class="programLabelContent">
                    <div class="programLabelMain">
                      <div class="programName">
                        {{ program.name }}
                      </div>
                      <div class="programMeta">
                        <span class="metaItem">
                          <AppIcon icon="map-marker-alt" class="metaIcon" />
                          {{ program.campusName }}
                        </span>
                        <span v-if="program.facultieName" class="metaItem">
                          <AppIcon icon="building" class="metaIcon" />
                          {{ program.facultieName }}
                        </span>
                      </div>
                    </div>
                    <span v-if="program.isAssociated" class="associatedBadge">Ya asociado</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Footer Summary -->
          <div class="summaryBox">
            <div class="summaryContent">
              <span class="summaryText"> {{ associatedProgramsCount }} programas ya están asociados </span>
              <span class="summaryCount">
                <strong class="summaryNumber">{{ selectedProgramIds.length }}</strong>
                para agregar
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="d-flex justify-content-end gap-2">
        <AppButton outlined @click="$emit('update:isVisible', false)" :disabled="saving">Cancelar</AppButton>
        <AppButton variant="success" :loading="saving" :disabled="selectedProgramIds.length === 0" @click="save">Agregar</AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import { GetProgramsByCampusService, ProgramByCampusDto, CampusProgramsDto } from '../services/getProgramsByCampus.service';
import { AddProgramsToAcademicPeriodService } from '../services/addProgramsToAcademicPeriod.service';
import { ToastService } from '../../../shared/services/toast.service';

const getProgramsByCampusService = new GetProgramsByCampusService();
const addProgramsToAcademicPeriodService = new AddProgramsToAcademicPeriodService();
const toastService = new ToastService();

export default defineComponent({
  name: 'AddProgramsDrawer',
  components: {
    AppDrawer,
    AppButton,
    AppIcon,
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
    academicPeriodName: {
      type: String,
      required: true,
    },
    existingProgramIds: {
      type: Array as () => string[],
      default: () => [],
    },
  },
  emits: ['update:isVisible', 'saved'],
  setup(props, { emit }) {
    const loading = ref(false);
    const saving = ref(false);
    const searchTerm = ref('');
    const selectAllFiltered = ref(false);
    const selectedProgramIds = ref<string[]>([]);

    const campuses = ref<CampusProgramsDto[]>([]);
    const allPrograms = ref<ProgramByCampusDto[]>([]);

    const filters = ref({
      campusId: '' as string | number,
    });

    const loadData = async () => {
      try {
        loading.value = true;
        const campusPrograms = await getProgramsByCampusService.run();

        const campusArray = Array.isArray(campusPrograms) ? campusPrograms : [];
        campuses.value = campusArray;

        allPrograms.value = campusArray.flatMap((campus) => {
          const programs = Array.isArray(campus.programs) ? campus.programs : [];
          return programs.map((program) => ({
            ...program,
            isAssociated: props.existingProgramIds.includes(`${program.id}_${program.campusId}`),
          }));
        });
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

      if (searchTerm.value.trim()) {
        const search = searchTerm.value.toLowerCase();
        programs = programs.filter(
          (program) => program.name.toLowerCase().includes(search) || program.campusName.toLowerCase().includes(search) || (program.facultieName && program.facultieName.toLowerCase().includes(search))
        );
      }

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
        const filteredKeys = filteredPrograms.value.map((p) => `${p.id}_${p.campusId}`);
        selectedProgramIds.value = Array.from(new Set([...selectedProgramIds.value, ...filteredKeys]));
      } else {
        const filteredKeys = filteredPrograms.value.map((p) => `${p.id}_${p.campusId}`);
        selectedProgramIds.value = selectedProgramIds.value.filter((key) => !filteredKeys.includes(key));
      }
    };

    const save = async () => {
      if (selectedProgramIds.value.length === 0) {
        toastService.show('Debe seleccionar al menos un programa', 'warning');
        return;
      }

      try {
        saving.value = true;

        const programsCampus = selectedProgramIds.value.map((key) => {
          const [programId, campusId] = key.split('_').map(Number);
          return { campusId, programId };
        });

        const response = await addProgramsToAcademicPeriodService.run(props.academicPeriodId, {
          programsCampus,
        });

        console.log('=== ADD PROGRAMS RESPONSE ===');
        console.log('Response:', response);
        console.log('Response.data:', response?.data);

        toastService.show(`Se agregaron ${selectedProgramIds.value.length} programas exitosamente`, 'success');
        emit('saved', response);
        emit('update:isVisible', false);
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

    // Watch para resetear cuando el drawer se abre
    watch(
      () => props.isVisible,
      (newVal) => {
        if (newVal) {
          selectedProgramIds.value = [];
          selectAllFiltered.value = false;
          searchTerm.value = '';
          filters.value.campusId = '';
          loadData();
        }
      }
    );

    // Watch para resetear cuando cambian los programas existentes
    watch(
      () => props.existingProgramIds,
      () => {
        if (props.isVisible) {
          loadData();
        }
      },
      { deep: true }
    );

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
.drawer-head-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.drawer-head-content__icon {
  flex-shrink: 0;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 2px;
}

.drawer-head-content__texts {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.drawer-head-content__title {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}

.drawer-head-content__sub {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.75);
}

/* BODY SECTIONS */

.drawerBody--form {
  padding: 1.5rem;
}

.addProgramsBody {
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* FILTER SECTION */

.formSection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.formSection__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.filterGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.filterItem {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filterLabel {
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
  display: block;
}

.nativeInput {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: #fff;
  color: #111827;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.nativeInput:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.nativeSelect {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  padding-right: 2.5rem;
}

/* SELECTION CONTROLS */

.selectionControls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #d1d5db;
  gap: 1rem;
}

.selectionCheckbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nativeCheckbox {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  accent-color: var(--color-primary);
  margin: 0;
}

.selectAllLabel {
  font-size: 0.75rem;
  color: #374151;
  margin: 0;
  cursor: pointer;
  font-weight: 500;
}

.selectionStats {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #6b7280;
  align-items: center;
}

.statItem {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.statNumber {
  font-weight: 700;
}

.statNumber--primary {
  color: var(--color-primary);
}

.statNumber--success {
  color: #10b981;
}

.statSeparator {
  color: #d1d5db;
}

/* PROGRAMS LIST */

.programsList {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background-color: #fff;
}

.listMessage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 200px;
}

.listLoading {
  gap: 1rem;
}

.listEmpty {
  gap: 0.5rem;
  color: #6b7280;
}

.emptyIcon {
  font-size: 1.875rem;
}

.emptyText {
  margin: 0;
  font-size: 0.875rem;
}

.programItem {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s;
}

.programItem:last-child {
  border-bottom: none;
}

.programItem:hover:not(.programItem--disabled) {
  background-color: #f8f9fa;
}

.programItem--disabled {
  opacity: 0.6;
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.programItem--disabled label {
  cursor: not-allowed;
}

.programItemContent {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.programCheckbox {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  accent-color: var(--color-primary);
  margin: 0;
}

.programLabel {
  flex: 1;
  cursor: pointer;
  margin: 0;
}

.programLabelContent {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.programLabelMain {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.5rem;
}

.programName {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.programMeta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.375rem;
}

.metaItem {
  font-size: 0.75rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.metaIcon {
  font-size: 0.625rem;
}

.associatedBadge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: #e0e7ff;
  color: #4f46e5;
  white-space: nowrap;
  flex-shrink: 0;
}

/* SUMMARY BOX */

.summaryBox {
  background-color: #f9fafb;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
}

.summaryContent {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #6b7280;
}

.summaryText {
  flex: 1;
}

.summaryCount {
  font-weight: 600;
  color: #111827;
}

.summaryNumber {
  color: var(--color-primary);
  font-weight: 700;
}
</style>
