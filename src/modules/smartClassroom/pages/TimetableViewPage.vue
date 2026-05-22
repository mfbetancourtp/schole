<template>
  <AppBaseList>
    <!-- Header action buttons -->
    <template #actions>
      <AppButtonBack :to="{ name: 'smartClassroom.schedule' }" />
    </template>

    <!-- Main content -->
    <template #content>
      <!-- Loading -->
      <AppLoading v-if="isLoading" />

      <!-- Error -->
      <div v-else-if="error || !timetable" class="d-flex flex-column align-items-center justify-content-center" style="min-height: 400px">
        <AppIcon icon="info-circle" class="text-muted mb-3" style="font-size: 40px; opacity: 0.4" />
        <span class="text-muted mb-3">{{ error || 'Horario no encontrado' }}</span>
        <AppButton variant="primary" icon="arrow-left" label="Volver a Horarios" outlined :to="{ name: 'smartClassroom.schedule' }" />
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Header Info -->
        <div class="d-flex align-items-center gap-2 flex-wrap mb-2">
          <h5 class="mb-0 fw-bold">{{ timetable.name }}</h5>
          <span :class="['badge', statusConfig.className]">{{ statusConfig.label }}</span>
        </div>
        <div class="d-flex align-items-center gap-2 mb-3 flex-wrap text-muted small">
          <span class="d-flex align-items-center gap-1">
            <AppIcon icon="chalkboard-teacher" style="opacity: 0.6" />
            {{ timetable.department || 'Departamento' }}
          </span>
          <span>&middot;</span>
          <span class="d-flex align-items-center gap-1">
            <AppIcon icon="calendar" style="opacity: 0.6" />
            Semestre {{ timetable.semester }}
          </span>
          <span>&middot;</span>
          <span>Año {{ timetable.year }}</span>
        </div>

        <!-- Stats Cards -->
        <div class="container-cards mb-3">
          <AppCardDashboard size="small">
            <template #title><span>Clases</span></template>
            <template #body>
              <div class="card-graph">
                <h3>{{ stats.totalClasses }}</h3>
                <AppIcon icon="book" />
              </div>
            </template>
          </AppCardDashboard>

          <AppCardDashboard size="small">
            <template #title><span>Cursos</span></template>
            <template #body>
              <div class="card-graph">
                <h3>{{ stats.uniqueCourses }}</h3>
                <AppIcon icon="graduation-cap" />
              </div>
            </template>
          </AppCardDashboard>

          <AppCardDashboard size="small">
            <template #title><span>Profesores</span></template>
            <template #body>
              <div class="card-graph">
                <h3>{{ stats.uniqueFaculty }}</h3>
                <AppIcon icon="user-tie" />
              </div>
            </template>
          </AppCardDashboard>

          <AppCardDashboard size="small">
            <template #title><span>Salones</span></template>
            <template #body>
              <div class="card-graph">
                <h3>{{ stats.uniqueRooms }}</h3>
                <AppIcon icon="door-open" />
              </div>
            </template>
          </AppCardDashboard>
        </div>

        <!-- Schedule Calendar -->
        <TimetableSchedule :entries="timetable.schedule" />
      </template>
    </template>
  </AppBaseList>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import TimetableSchedule from '../components/TimetableSchedule/TimetableSchedule.vue';

import { useHeaderStore } from '../../../stores/header.store';
import { GetTimetableByIdService } from '../services/getTimetableById.service';
import type { Timetable } from '../dtos';

const headerStore = useHeaderStore();
const route = useRoute();

const getTimetableByIdService = new GetTimetableByIdService();

// State
const timetable = ref<Timetable | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Status config
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: 'Borrador', className: 'bg-warning text-dark' },
  published: { label: 'Publicado', className: 'bg-success' },
  archived: { label: 'Archivado', className: 'bg-secondary' },
};

const statusConfig = computed(() => {
  if (!timetable.value) return STATUS_CONFIG.draft;
  return STATUS_CONFIG[timetable.value.status] || STATUS_CONFIG.draft;
});

// Computed stats
const stats = computed(() => {
  if (!timetable.value)
    return {
      totalClasses: 0,
      uniqueCourses: 0,
      uniqueFaculty: 0,
      uniqueRooms: 0,
    };
  const entries = timetable.value.schedule || [];
  return {
    totalClasses: entries.length,
    uniqueCourses: new Set(entries.map((e) => e.courseId)).size,
    uniqueFaculty: new Set(entries.map((e) => e.facultyId)).size,
    uniqueRooms: new Set(entries.map((e) => e.roomId)).size,
  };
});

// Fetch data
onMounted(async () => {
  headerStore.module = { name: 'Smart Classroom', url: '' };
  headerStore.moduleItem = {
    name: 'Horarios Generados',
    url: '/smart-classroom/timetables',
  };
  headerStore.moduleSubItem = { name: 'Ver Horario', url: '' };

  const id = route.params.id as string;
  if (!id) return;

  isLoading.value = true;
  error.value = null;

  try {
    const timetableData = await getTimetableByIdService.run(id);

    timetable.value = timetableData;
    headerStore.moduleSubItem = {
      name: timetableData.name || 'Ver Horario',
      url: '',
    };
  } catch (err) {
    console.error('Error loading timetable:', err);
    error.value = 'No se pudo cargar el horario. Intente nuevamente.';
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.container-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.card-graph {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
