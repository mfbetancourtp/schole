<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('close')" size="lg">
    <template #head>
      <AppDrawerHeader
        class="ms-2 pt-2"
        variant="create"
        icon="book-open"
        title="Agregar Asignaturas al Plan de Estudios"
        subtitle="Selecciona una o varias asignaturas disponibles para agregar al plan."
      >
        <template #meta>
          <div class="drawerHeaderMetaStack">
            <div>
              <strong class="text-white">Programa:</strong>
              {{ programName || '-' }}
            </div>
            <div><strong class="text-white">Plan:</strong> {{ gridTitle || '-' }}</div>
          </div>
        </template>
      </AppDrawerHeader>
    </template>

    <template #body>
      <div class="px-4 py-3 bg-white">
        <div v-if="loadError" class="alert alert-danger mb-4" role="alert">
          {{ loadError }}
        </div>

        <div v-if="loadingSubjects" class="d-flex align-items-center justify-content-center py-5">
          <div class="spinner-border text-primary" role="status" aria-label="Cargando asignaturas"></div>
        </div>

        <template v-else>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label text-dark fw-bold mb-0" style="font-size: 14px">Buscar y seleccionar asignaturas</label>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-light text-muted border rounded-pill px-3 py-1"> {{ filteredSubjects.length }} disponibles </span>
              <span v-if="selectedSubjectIds.length" class="badge rounded-pill px-3 py-1 fw-medium" style="background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe">
                {{ selectedSubjectIds.length }} seleccionada(s)
              </span>
            </div>
          </div>

          <div class="input-group mb-4">
            <span class="input-group-text bg-white border-end-0">
              <AppIcon icon="search" class="text-muted" />
            </span>
            <input v-model="searchQuery" type="text" class="form-control border-start-0 ps-0 shadow-none" placeholder="Buscar por código o nombre de asignatura..." />
          </div>

          <div class="d-flex flex-column gap-3">
            <div
              v-for="subject in filteredSubjects"
              :key="subject.id"
              class="subject-card-wrapper"
              :class="{
                'subject-card-wrapper--disabled': subject.isAssociated,
              }"
            >
              <AppSelectableCard :selected="selectedSubjectIds.includes(subject.id)" @toggle="toggleSubjectSelection(subject)">
                <div class="d-flex justify-content-between align-items-start gap-3">
                  <div class="flex-grow-1">
                    <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
                      <span class="fw-bold text-primary" style="font-size: 14px">
                        {{ subject.code }}
                      </span>
                      <span class="badge border bg-white text-dark rounded-pill fw-normal" style="font-size: 11px">
                        {{ subject.type }}
                      </span>
                      <span
                        v-if="subject.isAssociated"
                        class="badge bg-light border text-primary rounded-pill fw-normal"
                        style="font-size: 11px; background-color: #eff6ff !important; border-color: #bfdbfe !important"
                      >
                        Ya asociada
                      </span>
                    </div>

                    <h6 class="fw-bold text-dark mb-1" style="font-size: 14px">
                      {{ subject.name }}
                    </h6>
                    <p class="text-muted mb-2" style="font-size: 12px">
                      {{ subject.description }}
                    </p>

                    <div class="d-inline-flex d-flex align-items-center mt-2 flex-wrap gap-2">
                      <span class="badge bg-light border text-muted rounded-pill fw-normal px-3 py-1" style="font-size: 11px">
                        {{ subject.area }}
                      </span>
                      <span v-if="subject.requirement" class="badge bg-white border border-success text-success rounded-pill fw-normal px-3 py-1" style="font-size: 11px"> Requisito de grado </span>
                      <span v-if="subject.spaceType" class="badge bg-white border text-muted rounded-pill fw-normal px-3 py-1" style="font-size: 11px">
                        {{ subject.spaceType }}
                      </span>
                    </div>
                  </div>

                  <div class="d-flex gap-3 text-muted flex-shrink-0" style="font-size: 13px">
                    <div class="d-flex align-items-center gap-1">
                      <AppIcon icon="graduation-cap" style="font-size: 14px" />
                      {{ subject.credits }}
                    </div>
                    <div class="d-flex align-items-center gap-1">
                      <AppIcon icon="clock" style="font-size: 14px" />
                      {{ subject.hours }}h
                    </div>
                  </div>
                </div>
              </AppSelectableCard>
            </div>

            <div v-if="!filteredSubjects.length" class="text-center py-5 text-muted">
              <AppIcon icon="search" class="fs-1 mb-3 opacity-25" />
              <p class="mb-0">No se encontraron asignaturas para tu búsqueda</p>
            </div>
          </div>
        </template>
      </div>
    </template>

    <template #footer>
      <span class="text-muted" style="font-size: 13px">
        {{ selectedSubjectIds.length ? `${selectedSubjectIds.length} asignatura(s) seleccionada(s) listas para asociar` : 'Selecciona una o varias asignaturas para asociarlas al plan' }}
      </span>
      <div class="d-flex justify-content-end gap-2 px-2 py-1">
        <AppButton variant="ghost" label="core.cancel" @click="$emit('close')"></AppButton>
        <AppButton variant="primary" :disabled="!selectedSubjectIds.length || loadingSubjects" @click="associateSubjects">
          Asociar
          {{ selectedSubjectIds.length > 1 ? `${selectedSubjectIds.length} asignaturas` : 'asignatura' }}
        </AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppSelectableCard from '../../../shared/components/Card/AppSelectableCard.vue';
import { GetSubjectsByProgramService } from '../services/getSubjectsByProgram.service';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

type SubjectApiItem = {
  id: number;
  institutionId: number;
  areaId: number | null;
  name: string;
  code: string | null;
  description: string | null;
  shortName: string | null;
  credits: number | null;
  theoricalHours: number | null;
  practicalHours: number | null;
  maximumHours: number | null;
  subjectCategoryId: number | null;
  spaceTypeId: number | null;
  isDegreeRequirement: number | boolean;
  allPrograms: number | boolean;
  competencies?: any[];
  programIds?: number[];
  subjectCategory?: {
    id: number;
    name: string;
    code?: string | null;
  } | null;
  spaceType?: {
    id: number;
    name: string;
    code?: string | null;
  } | null;
};

type SubjectOption = {
  id: number;
  code: string;
  name: string;
  shortName: string;
  description: string;
  type: string;
  area: string;
  spaceType: string;
  credits: number;
  hours: number;
  weeklyHours: number;
  theoreticalHours: number;
  practicalHours: number;
  requirement: boolean;
  isAssociated: boolean;
};

const getSubjectsByProgramService = new GetSubjectsByProgramService();

const toNumber = (value: unknown) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const normalizeSubject = (subject: SubjectApiItem, associatedSubjectIds: number[]): SubjectOption => {
  const theoreticalHours = toNumber(subject.theoricalHours);
  const practicalHours = toNumber(subject.practicalHours);
  const totalHours = theoreticalHours + practicalHours;
  const weeklyHours = toNumber(subject.maximumHours) || totalHours;

  return {
    id: subject.id,
    code: subject.code || `SUB-${subject.id}`,
    name: subject.name || 'Asignatura sin nombre',
    shortName: subject.shortName || subject.name || 'Asignatura sin nombre',
    description: subject.description || subject.name || 'Sin descripción',
    type: subject.subjectCategory?.name || 'Asignatura',
    area: subject.subjectCategory?.name || 'Sin categoría',
    spaceType: subject.spaceType?.name || '',
    credits: toNumber(subject.credits),
    hours: totalHours,
    weeklyHours,
    theoreticalHours,
    practicalHours,
    requirement: subject.isDegreeRequirement === 1 || subject.isDegreeRequirement === true,
    isAssociated: associatedSubjectIds.includes(subject.id),
  };
};

export default defineComponent({
  name: 'SubjectSelectDrawer',
  components: {
    AppDrawer,
    AppDrawerHeader,
    AppIcon,
    AppSelectableCard,
    AppButton,
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    semesterId: {
      type: Number,
      default: null,
    },
    programId: {
      type: Number,
      default: null,
    },
    programName: {
      type: String,
      default: '',
    },
    gridTitle: {
      type: String,
      default: '',
    },
    associatedSubjectIds: {
      type: Array as () => number[],
      default: () => [],
    },
  },
  emits: ['close', 'add'],
  setup(props, { emit }) {
    const loadingSubjects = ref(false);
    const loadError = ref('');
    const searchQuery = ref('');
    const selectedSubjectIds = ref<number[]>([]);
    const allSubjects = ref<SubjectOption[]>([]);

    const resetSelectionState = () => {
      searchQuery.value = '';
      selectedSubjectIds.value = [];
    };

    const loadSubjects = async () => {
      if (!props.programId) {
        allSubjects.value = [];
        loadError.value = 'No fue posible identificar el programa de esta malla.';
        return;
      }

      loadingSubjects.value = true;
      loadError.value = '';

      try {
        const response = await getSubjectsByProgramService.run({
          noPag: true,
          programId: props.programId,
        });

        const subjects = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];

        allSubjects.value = subjects.map((subject: any) => normalizeSubject(subject, props.associatedSubjectIds));
      } catch (error) {
        console.error('Error al cargar las asignaturas del programa:', error);
        allSubjects.value = [];
        loadError.value = 'No fue posible cargar las asignaturas del programa.';
      } finally {
        loadingSubjects.value = false;
      }
    };

    watch(
      () => [props.isVisible, props.programId, props.associatedSubjectIds],
      ([isVisible]) => {
        if (isVisible) {
          resetSelectionState();
          void loadSubjects();
          return;
        }

        resetSelectionState();
      },
      { immediate: true, deep: true }
    );

    const filteredSubjects = computed(() => {
      const query = searchQuery.value.trim().toLowerCase();

      return allSubjects.value.filter((subject) => {
        return !query || subject.code.toLowerCase().includes(query) || subject.name.toLowerCase().includes(query) || subject.shortName.toLowerCase().includes(query);
      });
    });

    const toggleSubjectSelection = (subject: SubjectOption) => {
      if (subject.isAssociated) return;

      if (selectedSubjectIds.value.includes(subject.id)) {
        selectedSubjectIds.value = selectedSubjectIds.value.filter((id) => id !== subject.id);
      } else {
        selectedSubjectIds.value = [...selectedSubjectIds.value, subject.id];
      }
    };

    const associateSubjects = () => {
      const selectedSubjects = allSubjects.value.filter((subject) => selectedSubjectIds.value.includes(subject.id));

      const subjects = selectedSubjects.map((subjectDetails) => ({
        subjectId: subjectDetails.id,
        code: subjectDetails.code,
        name: subjectDetails.shortName || subjectDetails.name,
        type: 'Obligatoria',
        credits: subjectDetails.credits,
        hours: subjectDetails.weeklyHours,
        prerequisites: [],
        prerequisiteIds: [],
      }));

      emit('add', {
        semesterId: props.semesterId,
        subjects,
      });

      resetSelectionState();
      emit('close');
    };

    return {
      loadingSubjects,
      loadError,
      searchQuery,
      selectedSubjectIds,
      filteredSubjects,
      toggleSubjectSelection,
      associateSubjects,
    };
  },
});
</script>

<style scoped>
.drawerHeaderMetaStack {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.85rem;
}

.subject-card-wrapper--disabled {
  opacity: 0.7;
}
</style>
