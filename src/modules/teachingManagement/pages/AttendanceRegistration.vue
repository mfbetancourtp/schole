<template>
  <AppBaseList :title="title" :routes="routes">
    <template v-slot:content>
      <AppLoading v-if="loading" />

      <template v-else>
        <div class="attendance-page">
          <!-- ═══ Título + Subtítulo (Header Azul) ═══ -->
          <div class="attendance-page__header">
            <div class="attendance-page__title-row">
              <div class="attendance-page__title-content">
                <h2 class="attendance-page__heading">Mi Asistencia</h2>
                <p class="attendance-page__subheading">Consulta de registros de asistencia académica</p>
              </div>

              <!-- Botón Exportar -->
              <AppButton label="Exportar" variant="primary" class="btn-export-custom" @click="handleExport">
                <AppIcon icon="cloud-download-alt" class="me-2" style="color: white" />
                Exportar
              </AppButton>
            </div>
            <!-- Selector de Mes (Barra blanca estilo input) -->
            <div class="attendance-page__controls">
              <AttendanceMonthSelector :initial-month="1" :initial-year="2026" @change="onMonthChange" />
            </div>
          </div>

          <!-- ═══ Tarjetas de Resumen ═══ -->
          <div class="attendance-page__stats">
            <!-- Card 1: Días Asistidos -->
            <AttendanceStatCard
              icon="check-circle"
              label="Días Asistidos"
              :value="summary.attendedDays"
              :suffix="`de ${summary.totalDays} días`"
              :show-progress="true"
              :percentage="summary.attendancePercentage"
              icon-bg="#dcfce7"
              icon-color="#10b981"
              progress-color="#10b981"
            />

            <!-- Card 2: Retrasos -->
            <AttendanceStatCard
              icon="exclamation-circle"
              label="Retrasos"
              :value="summary.delays"
              suffix="registros"
              icon-bg="#fef3c7"
              icon-color="#f59e0b"
              helper-text="Ver observaciones"
              helper-color="#637381"
            />

            <!-- Card 3: Inasistencias -->
            <AttendanceStatCard
              icon="times-circle"
              label="Inasistencias"
              :value="summary.absences"
              suffix="registros"
              icon-bg="#fee2e2"
              icon-color="#ef4444"
              helper-text="Ver detalles"
              helper-color="#637381"
            />

            <!-- Card 4: Horas Totales -->
            <AttendanceStatCard
              icon="clock"
              label="Horas Totales"
              :value="`${summary.totalHours}h`"
              suffix="del periodo"
              icon-bg="#dbeafe"
              icon-color="#3b82f6"
              :helper-text="`Registros validados: ${summary.validatedRecords}`"
              helper-color="#3b82f6"
            />
          </div>

          <!-- ═══ Filtros de Consulta ═══ -->
          <div class="attendance-page__filters">
            <div class="attendance-page__filters-header">
              <AppIcon icon="filter" class="attendance-page__filters-icon" />
              <h3 class="attendance-page__filters-title">Filtros de Consulta</h3>
            </div>

            <div class="attendance-page__filters-row">
              <div class="attendance-page__filter-group">
                <label class="attendance-page__filter-label">Fecha Inicio</label>
                <input type="date" class="form-control" v-model="filters.startDate" @change="applyFilters" />
              </div>

              <div class="attendance-page__filter-group">
                <label class="attendance-page__filter-label">Fecha Fin</label>
                <input type="date" class="form-control" v-model="filters.endDate" @change="applyFilters" />
              </div>

              <div class="attendance-page__filter-group">
                <label class="attendance-page__filter-label">Estado del Registro</label>
                <select class="form-control" v-model="filters.status" @change="applyFilters">
                  <option :value="null">Todos</option>
                  <option value="Puntual">Puntual</option>
                  <option value="Tardanza">Tardanza</option>
                  <option value="Falta">Falta</option>
                  <option value="Justificado">Justificado</option>
                </select>
              </div>
            </div>
          </div>

          <!-- ═══ Tabla de Registros ═══ -->
          <AttendanceRecordsTable :records="records" />

          <!-- ═══ Tarjetas de Información ═══ -->
          <!-- <AttendanceInfoCards :validated-records="summary.validatedRecords" :total-records="summary.totalRecords" :validation-percentage="summary.validationPercentage" /> -->

          <!-- ═══ Leyenda de Estados ═══ -->
          <!-- <AttendanceStatusLegend /> -->
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';

// Shared Components
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

// Module Components
import AttendanceStatCard from '../components/AttendanceStatCard.vue';
import AttendanceRecordsTable from '../components/AttendanceRecordsTable.vue';
// import AttendanceInfoCards from '../components/AttendanceInfoCards.vue';
// import AttendanceStatusLegend from '../components/AttendanceStatusLegend.vue';
import AttendanceMonthSelector from '../components/AttendanceMonthSelector.vue';

// DTOs & Services
import { AttendanceRecordDto, AttendanceSummaryDto, AttendanceFilterDto } from '../dtos/attendanceRecord.dto';
import { GetAttendanceRecordsMockService } from '../services/getAttendanceRecords.mock';

const attendanceService = new GetAttendanceRecordsMockService();

export default defineComponent({
  name: 'AttendanceRegistrationPage',

  components: {
    AppBaseList,
    AppLoading,
    AppButton,
    AppIcon,
    AttendanceStatCard,
    AttendanceRecordsTable,
    // AttendanceInfoCards,
    // AttendanceStatusLegend,
    AttendanceMonthSelector,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Mi Asistencia';

    useMeta({ title: t(title) });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Gestión Docente', url: '' };
    headerStore.moduleItem = { name: title, url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const routes = [{ name: title }];
    const loading = ref(true);

    const records: Ref<AttendanceRecordDto[]> = ref([]);
    const summary: Ref<AttendanceSummaryDto> = ref({
      attendedDays: 0,
      totalDays: 0,
      attendancePercentage: 0,
      delays: 0,
      absences: 0,
      totalHours: 0,
      validatedRecords: 0,
      totalRecords: 0,
      validationPercentage: 0,
    });

    const filters: AttendanceFilterDto = reactive({
      startDate: null,
      endDate: null,
      status: null,
    });

    const loadData = async () => {
      loading.value = true;
      try {
        const [fetchedRecords, fetchedSummary] = await Promise.all([attendanceService.getRecords(filters), attendanceService.getSummary()]);
        records.value = fetchedRecords;
        summary.value = fetchedSummary;
      } catch (error) {
        console.error('Error loading attendance data:', error);
      }
      loading.value = false;
    };

    const applyFilters = () => {
      loadData();
    };

    const onMonthChange = (payload: { month: number; year: number }) => {
      console.log('Month changed:', payload);
      // Future: Reload data for the selected month
      loadData();
    };

    const handleExport = () => {
      console.log('Export attendance records');
      // Future: Implement export functionality
    };

    onMounted(() => {
      loadData();
    });

    return {
      t,
      title,
      routes,
      loading,
      records,
      summary,
      filters,
      applyFilters,
      onMonthChange,
      handleExport,
    };
  },
});
</script>

<style scoped>
.attendance-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ═══ Header Section (Gradient) ═══ */
.attendance-page__header {
  background: linear-gradient(135deg, rgba(24, 119, 242, 0.08) 0%, rgba(24, 119, 242, 0.02) 100%);
  border: 1px solid rgba(24, 119, 242, 0.12);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
}

/* Decoración opcional de fondo suave */
.attendance-page__header::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: radial-gradient(circle at top right, rgba(24, 119, 242, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.attendance-page__title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.attendance-page__heading {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}

.attendance-page__subheading {
  font-size: 0.95rem;
  color: #475569;
  margin: 0.25rem 0 0;
}

.attendance-page__controls {
  display: inline-flex;
  width: fit-content;
  align-self: flex-start;
}

/* ─── Stats Row ─── */
.attendance-page__stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* ─── Filters ─── */
.attendance-page__filters {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 0 2px rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12);
}

.attendance-page__filters-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.attendance-page__filters-icon {
  color: #637381;
  font-size: 0.9rem;
}

.attendance-page__filters-title {
  font-size: 1rem;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.attendance-page__filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.attendance-page__filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.attendance-page__filter-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #637381;
}

.attendance-page__filter-group .form-control {
  border-radius: 8px;
  border: 1px solid #e0e3e7;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.attendance-page__filter-group .form-control:focus {
  border-color: var(--color-primary, #1877f2);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 24, 119, 242), 0.1);
}

/* ─── Responsive ─── */
/* Custom Export Button Style */
.btn-export-custom {
  /* Assumes AppButton root IS the button */
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.5), 0 2px 4px -1px rgba(37, 99, 235, 0.3) !important;
  color: white !important;
  font-weight: 600 !important;
  padding: 0.5rem 1.25rem !important;
  border-radius: 8px !important;
  transition: all 0.2s ease-in-out !important;
}

.btn-export-custom:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.5), 0 4px 6px -2px rgba(37, 99, 235, 0.3) !important;
  filter: brightness(1.05);
}

@media (max-width: 768px) {
  .attendance-page__title-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .attendance-page__stats {
    flex-direction: column;
  }
}
</style>
