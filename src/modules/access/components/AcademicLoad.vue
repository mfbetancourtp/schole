<template>
  <div>
    <h5 class="fw-bold mb-1">Áreas y asignaturas</h5>
    <p class="text-muted mb-4">Selecciona las áreas completas o asignaturas específicas que puedas dictar.</p>

    <!-- Buscador -->
    <div class="mb-4">
      <input v-model="searchQuery" type="text" class="form-control" placeholder="Buscar por área, asignatura o código" />
    </div>

    <div class="row g-4">
      <!-- Columna izquierda: áreas y asignaturas -->
      <div class="col-12 col-lg-8">
        <div class="areas-scroll-container">
          <div v-if="filteredAreas.length === 0" class="text-muted text-center py-4">No se encontraron resultados.</div>

          <div v-for="area in filteredAreas" :key="area.id" class="area-block mb-3">
            <!-- Cabecera del área -->
            <div class="area-header d-flex align-items-center gap-3 p-3" @click="toggleExpand(area.id)">
              <input
                type="checkbox"
                class="form-check-input flex-shrink-0 mt-0"
                :checked="getAreaState(area.id) === 'all'"
                :indeterminate.prop="getAreaState(area.id) === 'some'"
                @click.stop="toggleArea(area)"
              />
              <div class="flex-fill">
                <span class="fw-semibold">{{ area.name }}</span>
                <span v-if="area.code" class="text-muted small ms-2">{{ area.code }}</span>
              </div>
              <span class="badge bg-light text-secondary border"> {{ getSelectedCount(area.id) }}/{{ area.subjects.length }} </span>
              <AppIcon :icon="expandedAreas[area.id] ? 'chevron-up' : 'chevron-down'" class="text-muted" />
            </div>

            <!-- Lista de asignaturas -->
            <div v-if="expandedAreas[area.id]" class="subjects-list">
              <div v-for="subject in getFilteredSubjects(area)" :key="subject.id" class="subject-row d-flex align-items-center gap-3 px-3 py-2" @click="toggleSubject(area, subject)">
                <input type="checkbox" class="form-check-input flex-shrink-0 mt-0" :checked="subjectStates[area.id]?.[subject.id]?.selected ?? false" @click.stop="toggleSubject(area, subject)" />
                <span class="small">{{ subject.name }}</span>
                <span v-if="subject.code" class="text-muted small ms-auto">{{ subject.code }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna derecha: resumen -->
      <div class="col-12 col-lg-4">
        <div class="summary-sticky">
          <AppCard>
            <template #title>Resumen de selección</template>
            <template #body>
              <p class="fw-semibold mb-3">
                {{ selectedSubjects.length }}
                {{ selectedSubjects.length === 1 ? 'asignatura seleccionada' : 'asignaturas seleccionadas' }}
              </p>
              <div v-if="selectedSubjects.length === 0" class="text-muted small">Ninguna asignatura seleccionada aún.</div>
              <ul v-else class="summary-list list-unstyled mb-0">
                <li v-for="item in selectedSubjects" :key="`${item.areaId}-${item.subjectId}`" class="summary-item d-flex align-items-center gap-2 py-1">
                  <span class="summary-dot flex-shrink-0"></span>
                  <span class="small">{{ item.subjectName }}</span>
                </li>
              </ul>
            </template>
          </AppCard>
        </div>
      </div>
    </div>

    <!-- Continuar -->
    <div class="d-flex justify-content-end mt-4">
      <AppButton variant="primary" :outlined="false" @click="handleContinue"> Continuar </AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, reactive } from 'vue';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import { GetAreasWithSubjectsService } from '../services/getAreasWithSubjects.service';
import { GetAreasSubjectsSelectionService } from '../services/getAreasSubjectsSelection.service';
import { CreateAreasSubjectsSelectionService } from '../services/createAreasSubjectsSelection.service';
import { DeleteAreasSubjectsSelectionService } from '../services/deleteAreasSubjectsSelection.service';
import type { AreaWithSubjectsDto, SubjectDto } from '../dtos/academicLoad.dto';

const getAreasService = new GetAreasWithSubjectsService();
const getSelectionsService = new GetAreasSubjectsSelectionService();
const createSelectionService = new CreateAreasSubjectsSelectionService();
const deleteSelectionService = new DeleteAreasSubjectsSelectionService();

export default defineComponent({
  name: 'AcademicLoad',
  components: { AppButton, AppCard, AppIcon },
  emits: ['saved'],
  props: {
    userId: { type: Number, required: true },
  },
  setup(props, { emit }) {
    const areas = ref<AreaWithSubjectsDto[]>([]);
    const searchQuery = ref('');
    // subjectStates[areaId][subjectId] = { selected, selectionId }
    const subjectStates = reactive<Record<number, Record<number, { selected: boolean; selectionId: number | null }>>>({});
    const expandedAreas = reactive<Record<number, boolean>>({});

    // --- Computed ---

    const filteredAreas = computed(() => {
      const q = searchQuery.value.toLowerCase().trim();
      if (!q) return areas.value.filter((a) => a.subjects.length > 0);

      return areas.value
        .map((area) => {
          const areaMatches = area.name.toLowerCase().includes(q) || area.code?.toLowerCase().includes(q);
          const matchingSubjects = area.subjects.filter((s) => s.name.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q));
          if (!areaMatches && matchingSubjects.length === 0) return null;
          return {
            ...area,
            subjects: areaMatches ? area.subjects : matchingSubjects,
          };
        })
        .filter(Boolean) as AreaWithSubjectsDto[];
    });

    const getFilteredSubjects = (area: AreaWithSubjectsDto): SubjectDto[] => {
      const q = searchQuery.value.toLowerCase().trim();
      if (!q) return area.subjects;
      const areaMatches = area.name.toLowerCase().includes(q) || area.code?.toLowerCase().includes(q);
      if (areaMatches) return area.subjects;
      return area.subjects.filter((s) => s.name.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q));
    };

    const getAreaState = (areaId: number): 'all' | 'some' | 'none' => {
      const area = areas.value.find((a) => a.id === areaId);
      if (!area || area.subjects.length === 0) return 'none';
      const selectedCount = area.subjects.filter((s) => subjectStates[areaId]?.[s.id]?.selected).length;
      if (selectedCount === 0) return 'none';
      if (selectedCount === area.subjects.length) return 'all';
      return 'some';
    };

    const getSelectedCount = (areaId: number): number => {
      const area = areas.value.find((a) => a.id === areaId);
      if (!area) return 0;
      return area.subjects.filter((s) => subjectStates[areaId]?.[s.id]?.selected).length;
    };

    const selectedSubjects = computed(() => {
      const result: {
        areaId: number;
        subjectId: number;
        subjectName: string;
      }[] = [];
      for (const area of areas.value) {
        for (const subject of area.subjects) {
          if (subjectStates[area.id]?.[subject.id]?.selected) {
            result.push({
              areaId: area.id,
              subjectId: subject.id,
              subjectName: subject.name,
            });
          }
        }
      }
      return result;
    });

    // --- Helpers ---

    const ensureSubjectState = (areaId: number, subjectId: number) => {
      if (!subjectStates[areaId]) subjectStates[areaId] = {};
      if (!subjectStates[areaId][subjectId]) {
        subjectStates[areaId][subjectId] = {
          selected: false,
          selectionId: null,
        };
      }
    };

    // --- Acciones ---

    const toggleExpand = (areaId: number) => {
      expandedAreas[areaId] = !expandedAreas[areaId];
    };

    const toggleSubject = async (area: AreaWithSubjectsDto, subject: SubjectDto) => {
      ensureSubjectState(area.id, subject.id);
      const state = subjectStates[area.id][subject.id];

      if (!state.selected) {
        state.selected = true;
        const created = await createSelectionService.run({
          areaId: area.id,
          subjectId: subject.id,
        });
        state.selectionId = (created as any)?.data?.id ?? (created as any)?.id ?? null;
      } else {
        state.selected = false;
        if (state.selectionId) {
          await deleteSelectionService.run(state.selectionId);
          state.selectionId = null;
        }
      }
    };

    const toggleArea = async (area: AreaWithSubjectsDto) => {
      const currentState = getAreaState(area.id);

      if (currentState !== 'all') {
        // Seleccionar todas las que no estén seleccionadas
        await Promise.all(area.subjects.filter((s) => !subjectStates[area.id]?.[s.id]?.selected).map((s) => toggleSubject(area, s)));
      } else {
        // Deseleccionar todas
        await Promise.all(area.subjects.filter((s) => subjectStates[area.id]?.[s.id]?.selected).map((s) => toggleSubject(area, s)));
      }
    };

    // --- Continuar / handleSave ---

    const handleContinue = () => {
      emit('saved');
    };

    const handleSave = async (): Promise<boolean> => {
      return true;
    };

    // --- Carga inicial ---

    const loadAreas = async () => {
      try {
        const result = await getAreasService.run();
        const data: AreaWithSubjectsDto[] = (result as any)?.data ?? (Array.isArray(result) ? result : []);
        areas.value = data.filter((a) => a.subjects && a.subjects.length > 0);
        // Inicializar estados
        for (const area of areas.value) {
          if (!subjectStates[area.id]) subjectStates[area.id] = {};
          for (const subject of area.subjects) {
            subjectStates[area.id][subject.id] = {
              selected: false,
              selectionId: null,
            };
          }
        }
      } catch {
        areas.value = [];
      }
    };

    const loadSelections = async () => {
      try {
        const result = await getSelectionsService.run(props.userId);
        const selections = Array.isArray(result) ? result : (result as any)?.data ?? [];
        for (const sel of selections) {
          const areaId = sel.area?.id;
          const subjectId = sel.subject?.id;
          if (!areaId || !subjectId) continue;
          if (!subjectStates[areaId]) subjectStates[areaId] = {};
          subjectStates[areaId][subjectId] = {
            selected: true,
            selectionId: sel.id,
          };
          // Expandir automáticamente las áreas que tienen selecciones
          expandedAreas[areaId] = true;
        }
      } catch {
        // sin selecciones previas
      }
    };

    onMounted(async () => {
      await loadAreas();
      await loadSelections();
    });

    return {
      searchQuery,
      filteredAreas,
      expandedAreas,
      subjectStates,
      selectedSubjects,
      getAreaState,
      getSelectedCount,
      getFilteredSubjects,
      toggleExpand,
      toggleArea,
      toggleSubject,
      handleContinue,
      handleSave,
    };
  },
});
</script>

<style scoped>
.areas-scroll-container {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 4px;
}

.area-block {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.area-header {
  background-color: #f9fafb;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s;
}
.area-header:hover {
  background-color: #f3f4f6;
}

.subjects-list {
  border-top: 1px solid #e5e7eb;
}

.subject-row {
  cursor: pointer;
  transition: background-color 0.15s;
  border-bottom: 1px solid #f3f4f6;
}
.subject-row:last-child {
  border-bottom: none;
}
.subject-row:hover {
  background-color: rgba(var(--color-secondary-rgb), 0.04);
}

.summary-sticky {
  position: sticky;
  top: 20px;
}

.summary-list {
  max-height: 400px;
  overflow-y: auto;
}

.summary-item {
  border-bottom: 1px solid #f3f4f6;
}
.summary-item:last-child {
  border-bottom: none;
}

.summary-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-secondary);
}
</style>
