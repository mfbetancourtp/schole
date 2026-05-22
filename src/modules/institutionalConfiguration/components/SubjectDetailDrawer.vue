<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('close')" size="lg">
    <template #head>
      <AppDrawerHeader
        class="ms-2 pt-2"
        variant="edit"
        icon="sliders-h"
        title="Configurar Prerrequisitos"
        subtitle="Selecciona las asignaturas que el estudiante debe cursar antes de matricular esta asignatura."
      >
        <template #meta>
          <div class="drawerHeaderMetaRow">
            <strong class="text-white">{{ subject?.code }}</strong>
            <span class="drawerHeaderMetaSeparator">•</span>
            <span>{{ subject?.name }}</span>
          </div>
        </template>
      </AppDrawerHeader>
    </template>

    <template #body>
      <div class="px-4 py-3 bg-white">
        <div v-if="loadingSubjects" class="d-flex align-items-center justify-content-center py-5">
          <div class="spinner-border text-primary" role="status" aria-label="Cargando asignaturas"></div>
        </div>

        <template v-else>
          <div class="alert alert-primary d-flex align-items-start gap-2 bg-primary-subtle border-primary-subtle text-primary-emphasis mb-4 p-3" role="alert" style="font-size: 13px">
            <AppIcon icon="info-circle" class="mt-1" />
            <div>Selecciona las asignaturas que el estudiante debe cursar antes de matricular esta asignatura. Si no hay prerrequisitos, puedes dejar esta sección vacía.</div>
          </div>

          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <label class="form-label fw-bold text-dark mb-0" style="font-size: 13px">Buscar asignaturas</label>
              <div class="d-flex align-items-center gap-2">
                <div class="border rounded-pill px-3 py-1 d-flex align-items-center gap-2" style="background-color: #f0fdf4; border-color: #bbf7d0 !important">
                  <AppIcon icon="check-circle" class="text-success" style="font-size: 12px" />
                  <span class="fw-bold text-success" style="font-size: 12px">{{ selectedPrerequisiteIds.length }} seleccionado(s)</span>
                </div>
                <button v-if="selectedPrerequisiteIds.length" type="button" class="btn btn-link text-muted fw-normal text-decoration-none p-0" style="font-size: 11px" @click="clearPrerequisites">
                  Limpiar todos
                </button>
              </div>
            </div>
            <div class="input-group border rounded d-flex align-items-center bg-white" style="overflow: hidden; border-color: #e5e7eb !important">
              <span class="input-group-text bg-transparent border-0 px-3 py-2">
                <AppIcon icon="search" class="text-secondary" style="font-size: 18px" />
              </span>
              <input type="text" class="form-control border-0 bg-transparent shadow-none px-0 py-2" placeholder="Buscar por código o nombre..." v-model="searchQuery" />
            </div>
          </div>

          <div v-if="filteredSubjects.length" class="d-flex flex-column gap-3">
            <AppSelectableCard v-for="sub in filteredSubjects" :key="`prereq-${sub.id}`" :selected="selectedPrerequisiteIds.includes(sub.id)" @toggle="togglePrerequisite(sub.id)">
              <div class="d-flex justify-content-between align-items-start gap-3">
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <span class="fw-bold text-primary" style="font-size: 14px">{{ sub.code }}</span>
                    <span class="badge border bg-white text-dark rounded-pill fw-normal" style="font-size: 11px">{{ sub.type }}</span>
                  </div>
                  <h6 class="fw-bold text-dark mb-1" style="font-size: 14px">
                    {{ sub.name }}
                  </h6>
                  <p class="text-muted mb-0" style="font-size: 12px">
                    {{ sub.description }}
                  </p>
                </div>
                <div class="d-flex gap-3 text-muted flex-shrink-0" style="font-size: 13px">
                  <div class="d-flex align-items-center gap-1">
                    <AppIcon icon="graduation-cap" style="font-size: 14px" />
                    {{ sub.credits }}
                  </div>
                  <div class="d-flex align-items-center gap-1">
                    <AppIcon icon="clock" style="font-size: 14px" />
                    {{ sub.hours }}h
                  </div>
                </div>
              </div>
            </AppSelectableCard>
          </div>

          <div
            v-else
            class="border rounded-3 d-flex flex-column align-items-center justify-content-center p-5 text-center text-muted"
            style="border-style: dashed !important; border-color: #e5e7eb !important"
          >
            <AppIcon icon="book-open" class="fs-1 mb-3" style="color: #6b7280" />
            <h6 class="fw-bold text-dark mb-1">No hay asignaturas disponibles</h6>
            <p class="mb-0" style="font-size: 12px">Ajusta la búsqueda para encontrar asignaturas.</p>
          </div>
        </template>
      </div>
    </template>

    <template #footer>
      <span class="text-muted" style="font-size: 13px">{{ selectedPrerequisiteIds.length }} prerrequisito(s) configurado(s)</span>
      <div class="d-flex gap-2">
        <AppButton variant="ghost" label="core.cancel" @click="$emit('close')"></AppButton>
        <AppButton variant="primary" :disabled="loadingSubjects" @click="savePrerequisites">Guardar prerrequisitos</AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppSelectableCard from '../../../shared/components/Card/AppSelectableCard.vue';
import { GetSubjectsByProgramService } from '../services/getSubjectsByProgram.service';

type SubjectApiItem = {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  shortName: string | null;
  credits: number | null;
  theoricalHours: number | null;
  practicalHours: number | null;
  maximumHours: number | null;
  isDegreeRequirement: number | boolean;
  subjectCategory?: { id: number; name: string } | null;
  spaceType?: { id: number; name: string } | null;
};

type SubjectOption = {
  id: number;
  code: string;
  name: string;
  shortName: string;
  description: string;
  type: string;
  credits: number;
  hours: number;
};

const getSubjectsByProgramService = new GetSubjectsByProgramService();

const toNumber = (value: unknown) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const normalizeSubject = (subject: SubjectApiItem): SubjectOption => {
  const theoreticalHours = toNumber(subject.theoricalHours);
  const practicalHours = toNumber(subject.practicalHours);
  const totalHours = theoreticalHours + practicalHours;

  return {
    id: subject.id,
    code: subject.code || `SUB-${subject.id}`,
    name: subject.name || 'Asignatura sin nombre',
    shortName: subject.shortName || subject.name || 'Asignatura sin nombre',
    description: subject.description || subject.name || 'Sin descripción',
    type: subject.subjectCategory?.name || 'Asignatura',
    credits: toNumber(subject.credits),
    hours: totalHours,
  };
};

export default defineComponent({
  name: 'SubjectDetailDrawer',
  components: {
    AppDrawer,
    AppDrawerHeader,
    AppIcon,
    AppButton,
    AppSelectableCard,
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    subject: {
      type: Object as PropType<any>,
      default: null,
    },
    semesterNumber: {
      type: Number,
      default: 0,
    },
    periodLabel: {
      type: String,
      default: 'Semestre',
    },
    programId: {
      type: Number,
      default: null,
    },
    associatedSubjectIds: {
      type: Array as () => number[],
      default: () => [],
    },
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const searchQuery = ref('');
    const loadingSubjects = ref(false);
    const allSubjects = ref<SubjectOption[]>([]);
    const selectedPrerequisiteIds = ref<number[]>([]);

    const loadSubjects = async () => {
      if (!props.programId) {
        allSubjects.value = [];
        return;
      }

      loadingSubjects.value = true;

      try {
        const response = await getSubjectsByProgramService.run({
          noPag: true,
          programId: props.programId,
        });

        const subjects = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];

        allSubjects.value = subjects.map((subject: any) => normalizeSubject(subject));
      } catch (error) {
        console.error('Error al cargar asignaturas para prerrequisitos:', error);
        allSubjects.value = [];
      } finally {
        loadingSubjects.value = false;
      }
    };

    const initPrerequisites = () => {
      selectedPrerequisiteIds.value = Array.isArray(props.subject?.prerequisiteIds) ? [...props.subject.prerequisiteIds] : [];
    };

    watch(
      () => props.isVisible,
      (isVisible) => {
        if (isVisible) {
          searchQuery.value = '';
          initPrerequisites();
          void loadSubjects();
        }
      },
      { immediate: true }
    );

    const filteredSubjects = computed(() => {
      const query = searchQuery.value.trim().toLowerCase();
      const currentSubjectId = props.subject?.subjectId;

      return allSubjects.value.filter((sub) => {
        if (currentSubjectId && sub.id === currentSubjectId) return false;

        return !query || sub.code.toLowerCase().includes(query) || sub.name.toLowerCase().includes(query) || sub.shortName.toLowerCase().includes(query);
      });
    });

    const togglePrerequisite = (subjectId: number) => {
      if (selectedPrerequisiteIds.value.includes(subjectId)) {
        selectedPrerequisiteIds.value = selectedPrerequisiteIds.value.filter((id) => id !== subjectId);
      } else {
        selectedPrerequisiteIds.value = [...selectedPrerequisiteIds.value, subjectId];
      }
    };

    const clearPrerequisites = () => {
      selectedPrerequisiteIds.value = [];
    };

    const savePrerequisites = () => {
      const prerequisiteSubjects = allSubjects.value.filter((sub) => selectedPrerequisiteIds.value.includes(sub.id));

      emit('save', {
        ...props.subject,
        prerequisiteIds: [...selectedPrerequisiteIds.value],
        prerequisites: prerequisiteSubjects.map((sub) => sub.shortName || sub.name),
      });
    };

    return {
      searchQuery,
      loadingSubjects,
      filteredSubjects,
      selectedPrerequisiteIds,
      togglePrerequisite,
      clearPrerequisites,
      savePrerequisites,
    };
  },
});
</script>

<style scoped>
.drawerHeaderMetaRow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.85rem;
}

.drawerHeaderMetaSeparator {
  opacity: 0.75;
}
</style>
