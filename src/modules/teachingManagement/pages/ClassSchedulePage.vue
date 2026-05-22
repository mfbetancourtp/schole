<template>
  <AppBaseList title="Gestión Docente">
    <template v-slot:content>
      <div class="schedule-page">
        <!-- Header Controls -->
        <div class="schedule-page__header">
          <div class="schedule-page__header-top">
            <div>
              <h2 class="schedule-page__title">Horario Semanal del Docente</h2>
              <p class="schedule-page__subtitle">Visualización del calendario de clases asignadas</p>
            </div>
            <button class="btn btn-primary btn-export" @click="exportSchedule">
              <AppIcon icon="cloud-download-alt" />
              <span>Exportar Horario</span>
            </button>
          </div>

          <div class="schedule-page__filters">
            <div class="filter-group teacher-selector-group">
              <label>Seleccionar Docente</label>
              <v-select v-model="selectedTeacher" :options="teacherOptions" label="name" placeholder="Buscar por nombre o código..." class="teacher-select" @update:modelValue="onTeacherChange">
                <template #option="{ name, code }">
                  <div class="teacher-option">
                    <span class="teacher-option-name">{{ name }}</span>
                    <span class="teacher-option-code">{{ code }}</span>
                  </div>
                </template>
              </v-select>
            </div>
            <div class="filter-group date-selector-group">
              <label>Semana</label>
              <div class="week-selector">
                <button class="week-btn" @click="changeWeek(-1)" title="Semana anterior">
                  <AppIcon icon="chevron-left" />
                </button>

                <div class="week-display-wrapper">
                  <div class="week-display-text">{{ currentWeekDisplay }}</div>
                  <input type="date" class="week-date-input" :value="currentDateISO" @input="onDateInput" />
                  <AppIcon icon="calendar-alt" class="calendar-icon" />
                </div>

                <button class="week-btn" @click="changeWeek(1)" title="Semana siguiente">
                  <AppIcon icon="chevron-right" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <AppLoading v-if="loading" />

        <div v-else class="schedule-content">
          <TeacherProfileCard v-if="teacher" :teacher="teacher" class="mb-4" />
          <ScheduleStats v-if="stats" :data="stats" class="mb-4" />

          <div class="schedule-legend mb-4">
            <span class="legend-label">Leyenda:</span>
            <div class="legend-items">
              <div class="legend-item"><span class="dot dot--success"></span>Cumplida</div>
              <div class="legend-item"><span class="dot dot--primary"></span>En Curso</div>
              <div class="legend-item"><span class="dot dot--secondary"></span>Pendiente</div>
              <div class="legend-divider"></div>
              <div class="legend-item">
                <AppIcon icon="map-marker-alt" class="text-primary" size="xs" />
                Presencial
              </div>
              <div class="legend-item">
                <AppIcon icon="desktop" class="text-purple" size="xs" />
                Virtual/Híbrido
              </div>
            </div>
          </div>

          <!-- Calendar Wrapper with horizontal scroll -->
          <div class="calendar-responsive-wrapper mb-5">
            <ClassScheduleGrid :events="classes" />
          </div>

          <ClassScheduleList :classes="classes" />
        </div>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import TeacherProfileCard from '../components/TeacherProfileCard.vue';
import ScheduleStats from '../components/ScheduleStats.vue';
import ClassScheduleGrid from '../components/ClassScheduleGrid.vue';
import ClassScheduleList from '../components/ClassScheduleList.vue';
import { GetClassScheduleMockService } from '../services/getClassSchedule.mock';
import { ClassScheduleDto, TeacherProfileDto, ScheduleStatsDto } from '../dtos/classSchedule.dto';

const formatDate = (d: Date) =>
  d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default defineComponent({
  name: 'ClassSchedulePage',
  components: {
    AppBaseList,
    AppLoading,
    AppIcon,
    TeacherProfileCard,
    ScheduleStats,
    ClassScheduleGrid,
    ClassScheduleList,
    vSelect,
  },
  setup() {
    const loading = ref(true);
    const teacher = ref<TeacherProfileDto | null>(null);
    const stats = ref<ScheduleStatsDto | null>(null);
    const classes = ref<ClassScheduleDto[]>([]);

    const selectedTeacher = ref<TeacherProfileDto | null>(null);
    const currentWeekStart = ref(new Date(2026, 1, 16)); // Default Feb 16, 2026

    const service = new GetClassScheduleMockService();

    const teacherOptions = ref<TeacherProfileDto[]>([
      {
        id: 'DOC-2026-01',
        name: 'Carvajal Niño Martha Carolina',
        department: 'Ciencias e Ingeniería',
        code: 'DOC-2026-01',
        avatarUrl: 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/test/75/2026/avatar/1773093501468.jpg',
      },
      // {
      //   id: 'DOC-002',
      //   name: 'Ing. Maria Rodriguez',
      //   department: 'Ciencias Básicas',
      //   code: 'DOC-2024-002',
      // },
      // {
      //   id: 'DOC-003',
      //   name: 'Lic. Juan Perez',
      //   department: 'Humanidades',
      //   code: 'DOC-2024-003',
      // },
    ]);

    const currentWeekDisplay = computed(() => {
      const start = new Date(currentWeekStart.value);
      const end = new Date(start);
      end.setDate(start.getDate() + 4);
      return `${start.getDate()} - ${formatDate(end)}`;
    });

    const currentDateISO = computed(() => {
      const d = new Date(currentWeekStart.value);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    const loadData = async () => {
      loading.value = true;
      try {
        const [tProfile, tStats, tClasses] = await Promise.all([service.getTeacherProfile(), service.getStats(), service.getClasses(currentWeekStart.value.toISOString())]);

        teacher.value = selectedTeacher.value || tProfile;
        if (!selectedTeacher.value && teacherOptions.value.length > 0) {
          selectedTeacher.value = teacherOptions.value[0];
          teacher.value = teacherOptions.value[0];
        }

        stats.value = tStats;
        classes.value = [...tClasses].sort((a, b) => {
          const da = `${a.date}T${a.startTime}`;
          const db = `${b.date}T${b.startTime}`;
          return da.localeCompare(db);
        });
      } catch (error) {
        console.error('Error loading schedule data', error);
      } finally {
        loading.value = false;
      }
    };

    const changeWeek = (direction: number) => {
      const newDate = new Date(currentWeekStart.value);
      newDate.setDate(newDate.getDate() + direction * 7);
      currentWeekStart.value = newDate;
      loadData();
    };

    const onDateInput = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.value) {
        const selected = new Date(input.value + 'T12:00:00');
        const day = selected.getDay();
        const diff = selected.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(selected);
        monday.setDate(diff);
        currentWeekStart.value = monday;
        loadData();
      }
    };

    const onTeacherChange = () => {
      loadData();
    };

    const exportSchedule = () => {
      console.log('Exportando horario...');
    };

    onMounted(() => {
      loadData();
    });

    return {
      loading,
      teacher,
      stats,
      classes,
      selectedTeacher,
      teacherOptions,
      currentWeekDisplay,
      currentDateISO,
      changeWeek,
      onTeacherChange,
      exportSchedule,
      onDateInput,
    };
  },
});
</script>

<style scoped>
.schedule-page {
  font-family: 'Inter', sans-serif;
  max-width: 100%;
  margin: 0 auto;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.mb-5 {
  margin-bottom: 2.5rem;
}

/* Responsive Grid/Flex for Stats */
:deep(.stats-grid) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.schedule-page__header {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.schedule-page__header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.schedule-page__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.schedule-page__subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

.btn-export {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-export:hover {
  background: #1d4ed8;
}

.schedule-page__filters {
  display: flex;
  gap: 2rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 250px;
  flex: 1;
}

.teacher-selector-group {
  flex: 2;
  min-width: 300px;
}

.date-selector-group {
  flex: 1;
  min-width: 300px;
}

.filter-group label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
  margin-left: 0.2rem;
}

:deep(.v-select) {
  background: white;
  border-radius: 8px;
}

:deep(.vs__dropdown-toggle) {
  border: 1px solid #e2e8f0;
  padding: 0.4rem;
  border-radius: 8px;
}

.teacher-option {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.teacher-option-code {
  color: #94a3b8;
  font-size: 0.8rem;
}

.week-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 42px;
  width: 100%;
}

.week-btn {
  background: white;
  border: 1px solid #e2e8f0;
  width: 40px;
  height: 100%;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
  flex-shrink: 0;
}

.week-btn:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.week-display-wrapper {
  position: relative;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  height: 100%;
  border-radius: 8px;
  flex: 1;
  /* Take remaining space */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.week-display-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  z-index: 2;
  pointer-events: none;
  white-space: nowrap;
}

.week-date-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
  border: none;
  padding: 0;
  margin: 0;
}

.week-date-input::-webkit-calendar-picker-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.calendar-icon {
  position: absolute;
  right: 1rem;
  color: #64748b;
  z-index: 5;
  pointer-events: none;
}

/* Legend Responsive */
.schedule-legend {
  background: white;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.85rem;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .schedule-legend {
    border-radius: 50px;
  }
}

.legend-label {
  font-weight: 600;
  color: #475569;
}

.legend-items {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #475569;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot--success {
  background: #22c55e;
}

.dot--primary {
  background: #3b82f6;
}

.dot--secondary {
  background: #94a3b8;
}

.text-primary {
  color: #3b82f6;
}

.text-purple {
  color: #9333ea;
}

.legend-divider {
  width: 1px;
  height: 16px;
  background: #e2e8f0;
  display: none;
}

@media (min-width: 768px) {
  .legend-divider {
    display: block;
  }
}

/* Calendar Responsive Wrapper */
.calendar-responsive-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 12px;
  background: white;
  /* Ensure bg if scroll exposes container */
}

/* Ensure grid has min width to trigger scroll on small screens */
:deep(.calendar-wrapper) {
  min-width: 1100px;
  /* Force wider scroll for better readability */
}

@media (max-width: 768px) {
  .schedule-page__filters {
    gap: 1rem;
    align-items: stretch;
  }

  .filter-group {
    width: 100%;
  }

  .schedule-page__header-top {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-export {
    width: 100%;
    justify-content: center;
    margin-top: 1rem;
  }
}
</style>
