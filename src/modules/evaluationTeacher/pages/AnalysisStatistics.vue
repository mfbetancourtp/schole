<template>
  <AppBaseList title="Análisis y Estadística" :isCard="true">
    <template #actions>
      <AppButton style="color: white" :loading="isDownloading" @click="handleDownloadPDF">
        <AppIcon icon="file-pdf" />
        Descargar Reporte
      </AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <template v-else>
        <section class="analysisSection">
          <!-- ====== Banner de stats ====== -->
          <div class="banner">
            <h2 class="banner__title">Resultados Consolidados</h2>
            <p class="banner__subtitle">{{ surveyTitle }}</p>

            <div class="banner__stats">
              <div class="statCard">
                <div class="statCard__icon">
                  <font-awesome-icon icon="award" />
                </div>
                <div class="statCard__content">
                  <div class="statCard__label">Promedio Institucional</div>
                  <div class="statCard__value">{{ overallAverage }}</div>
                </div>
              </div>

              <div class="statCard">
                <div class="statCard__icon">
                  <font-awesome-icon icon="users" />
                </div>
                <div class="statCard__content">
                  <div class="statCard__label">Total Respuestas</div>
                  <div class="statCard__value">{{ totalResponses }}</div>
                </div>
              </div>

              <div class="statCard">
                <div class="statCard__icon">
                  <font-awesome-icon icon="chart-line" />
                </div>
                <div class="statCard__content">
                  <div class="statCard__label">Tasa de Respuesta Promedio</div>
                  <div class="statCard__value">{{ averageResponseRate }}%</div>
                </div>
              </div>
            </div>
          </div>

          <!-- ====== Tabla con filtros ====== -->
          <template v-if="!selectedEvaluationId">
            <AppLoading />
          </template>
          <template v-else>
            <AppDatatable
              name="analysisStatistics"
              :service="getEvaluatedTeachersService"
              :params="{
                evaluationId: selectedEvaluationId,
                facultyId: selectedFacultyId || undefined,
                programId: selectedProgramId || undefined,
              }"
              default-sort-direction="desc"
              enableSearchFilter
            >
              <template #filters>
                <AppFilter v-model="selectedEvaluationId" filter-name="analysisStatistics.evaluationId">
                  <AppFormField label="Evaluación" capitalize>
                    <AppAutocomplete v-model="selectedEvaluationId" :options="evaluations" input-id="evaluationId" />
                  </AppFormField>
                </AppFilter>

                <AppFilter v-model="selectedFacultyId" filter-name="analysisStatistics.facultyId">
                  <AppFormField label="Facultad" capitalize>
                    <AppAutocomplete v-model="selectedFacultyId" :options="faculties" input-id="facultyId" />
                  </AppFormField>
                </AppFilter>

                <AppFilter v-model="selectedProgramId" filter-name="analysisStatistics.programId">
                  <AppFormField label="Programa" capitalize>
                    <AppAutocomplete v-model="selectedProgramId" :options="programs" input-id="programId" />
                  </AppFormField>
                </AppFilter>
              </template>

              <!-- Docente -->
              <AppDatatableColumn field="evaluatedName" label="Docente" sortable v-slot="{ row }">
                <div class="teacherCell">
                  <div class="avatar">{{ initials(row.evaluatedName) }}</div>
                  <span class="teacherCell__name">{{ row.evaluatedName }}</span>
                </div>
              </AppDatatableColumn>

              <!-- Facultad -->
              <AppDatatableColumn field="facultyName" label="Facultad" sortable v-slot="{ row }">
                <span class="text-muted">{{ row.facultyName }}</span>
              </AppDatatableColumn>

              <!-- Curso -->
              <AppDatatableColumn field="subjectName" label="Curso" sortable v-slot="{ row }">
                <span class="text-muted">{{ row.subjectName }}</span>
              </AppDatatableColumn>

              <!-- Promedio -->
              <AppDatatableColumn field="evaluatedAverage" label="Promedio" sortable v-slot="{ row }">
                <span class="scorePill" :class="scoreClass(row.evaluatedAverage ?? 0)">
                  {{ (row.evaluatedAverage ?? 0).toFixed(2) }}
                </span>
              </AppDatatableColumn>

              <!-- Respuestas -->
              <AppDatatableColumn field="totalResponses" label="Respuestas" sortable v-slot="{ row }">
                <span class="text-muted">{{ row.totalResponses ?? 0 }}</span>
              </AppDatatableColumn>

              <!-- Tasa -->
              <AppDatatableColumn field="responseRate" label="Tasa %" sortable v-slot="{ row }">
                <span class="text-muted">{{ row.responseRate ?? 0 }}%</span>
              </AppDatatableColumn>

              <!-- Acciones -->
              <AppDatatableColumn label="Acciones" v-slot="{ row }">
                <AppButton variant="secondary" outlined icon="eye" v-tooltip="'Ver Detalle'" @click="handleViewTeacherDetails(row)" />
              </AppDatatableColumn>
            </AppDatatable>
          </template>
        </section>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';
import { ToastService } from '../../../shared/services/toast.service';
import { InstitutionsService } from '../../../shared/services/institutions.service';
import { GetEvaluationsAnalyticsService } from '../services/getEvaluationsAnalytics.service';
import { GetEvaluatedTeachersAnalyticsService } from '../services/getEvaluatedTeachersAnalytics.service';
import { GetEvaluationAnalyticsRelatedDataService } from '../services/getEvaluationAnalyticsRelatedData.service';

const toastService = new ToastService();
const institutionsService = new InstitutionsService();
const getEvaluationsService = new GetEvaluationsAnalyticsService();
const getEvaluatedTeachersService = new GetEvaluatedTeachersAnalyticsService();
const getRelatedDataService = new GetEvaluationAnalyticsRelatedDataService();

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import { useHeaderStore } from '../../../stores/header.store';

type Evaluation = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status?: string;
  description?: string;
  academicPeriodId?: number;
  institutionId?: number;
  evaluationType?: string;
  templateId?: number;
  assignmentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export default defineComponent({
  name: 'AnalysisStatistics',
  components: {
    AppLoading,
    AppBaseList,
    AppButton,
    AppIcon,
    AppDatatable,
    AppDatatableColumn,
    AppFilter,
    AppFormField,
    AppAutocomplete,
  },
  setup() {
    const router = useRouter();
    const title = 'Análisis y Estadística';
    const loading = ref(true);
    const isDownloading = ref(false);

    useMeta({ title });

    // ==========================
    // Evaluaciones (del servicio)
    // ==========================
    const evaluations = ref<Evaluation[]>([]);
    const selectedEvaluationId = ref<number | null>(null);

    // ==========================
    // Facultades y Programas (del servicio)
    // ==========================
    const faculties = ref<any[]>([]);
    const programs = ref<any[]>([]);
    const selectedFacultyId = ref<number | null>(null);
    const selectedProgramId = ref<number | null>(null);
    const loadingRelatedData = ref(false);

    // ==========================
    // Stats de la evaluación seleccionada (vienen del related-data)
    // ==========================
    const evaluationStats = ref<{
      institutionalAverage: number;
      totalResponses: number;
      responseRate: number;
    } | null>(null);

    // ==========================
    // Computed
    // ==========================
    const selectedEvaluation = computed(() => evaluations.value.find((e) => e.id === selectedEvaluationId.value) || null);

    const surveyTitle = computed(() => selectedEvaluation.value?.name ?? '');

    const overallAverage = computed(() => (evaluationStats.value?.institutionalAverage ?? 0).toFixed(2));

    const totalResponses = computed(() => evaluationStats.value?.totalResponses ?? 0);

    const averageResponseRate = computed(() => evaluationStats.value?.responseRate ?? 0);

    // ==========================
    // Watchers
    // ==========================
    watch(selectedEvaluationId, async (newEvalId) => {
      selectedFacultyId.value = null;
      selectedProgramId.value = null;
      faculties.value = [];
      programs.value = [];
      evaluationStats.value = null;

      if (newEvalId) {
        await loadEvaluationRelatedData(newEvalId);
      }
    });

    // ==========================
    // Métodos para cargar datos
    // ==========================
    const loadEvaluations = async () => {
      try {
        loading.value = true;
        const institutionId = institutionsService.getSelectedInstitution()?.id.toString();
        const response = await getEvaluationsService.run({}, institutionId);

        if (response.data && Array.isArray(response.data)) {
          evaluations.value = response.data;
          if (evaluations.value.length > 0) {
            const sorted = [...evaluations.value].sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
            selectedEvaluationId.value = sorted[0].id;
          }
        } else {
          evaluations.value = [];
        }
      } catch (error) {
        console.error('Error al cargar evaluaciones:', error);
        toastService.show('Error al cargar las evaluaciones. Por favor intenta más tarde.', 'error');
        evaluations.value = [];
      } finally {
        loading.value = false;
      }
    };

    const loadEvaluationRelatedData = async (evaluationId: string | number) => {
      try {
        loadingRelatedData.value = true;
        const institutionId = institutionsService.getSelectedInstitution()?.id.toString();
        const response = await getRelatedDataService.run({ evaluationId }, institutionId);

        if (response) {
          evaluationStats.value = response.stats || null;
          faculties.value = response.faculties || [];
          programs.value = response.programs || [];
        } else {
          evaluationStats.value = null;
          faculties.value = [];
          programs.value = [];
        }
      } catch (error) {
        console.error('Error al cargar facultades y programas:', error);
        toastService.show('Error al cargar los datos relacionados. Por favor intenta más tarde.', 'error');
        faculties.value = [];
        programs.value = [];
      } finally {
        loadingRelatedData.value = false;
      }
    };

    // ==========================
    // Helpers UI
    // ==========================
    const scoreClass = (score: number) => {
      if (score >= 4.5) return 'scorePill--green';
      if (score >= 4.0) return 'scorePill--blue';
      if (score >= 3.5) return 'scorePill--amber';
      return 'scorePill--red';
    };

    const initials = (name: string | undefined) => {
      if (!name || typeof name !== 'string') return '?';
      const parts = name.split(' ').filter(Boolean);
      return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '')).toUpperCase();
    };

    // ==========================
    // Acciones
    // ==========================
    const handleDownloadPDF = async () => {
      if (isDownloading.value || !selectedEvaluationId.value) return;
      isDownloading.value = true;
      try {
        const response = await getEvaluatedTeachersService.run({
          evaluationId: selectedEvaluationId.value,
          facultyId: selectedFacultyId.value || undefined,
          programId: selectedProgramId.value || undefined,
          page: 1,
          perPage: 1000,
        });

        const headers = ['Docente', 'Facultad', 'Curso', 'Promedio', 'Respuestas', 'Tasa %'];
        const rows = (response.data || []).map((row: any) => [
          row.evaluatedName || '',
          row.facultyName || '',
          row.subjectName || '',
          (row.evaluatedAverage ?? 0).toFixed(2),
          String(row.totalResponses ?? 0),
          String(row.responseRate ?? 0),
        ]);

        const csv = [headers, ...rows].map((r) => r.map((cell: string) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');

        const blob = new Blob(['' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${(surveyTitle.value || 'evaluacion').replace(/[\s/\\:*?"<>|]+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toastService.show('Reporte generado exitosamente.', 'success');
      } catch {
        toastService.show('Error al generar el reporte.', 'error');
      } finally {
        isDownloading.value = false;
      }
    };

    const handleViewTeacherDetails = (row: any) => {
      router.push({
        name: 'evaluation-teacher.TeacherDetail',
        query: {
          id: row.userEvaluatedId ?? row.id,
          evaluationId: selectedEvaluationId.value,
          name: row.evaluatedName,
          department: row.facultyName,
          course: row.subjectName,
          averageScore: (row.evaluatedAverage ?? 0).toString(),
          responseCount: (row.totalResponses ?? 0).toString(),
          responseRate: (row.responseRate ?? 0).toString(),
        },
      });
    };

    onMounted(() => {
      loadEvaluations();

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Evaluación Docente', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    });

    return {
      loading,
      loadingRelatedData,
      evaluations,
      selectedEvaluationId,
      faculties,
      selectedFacultyId,
      programs,
      selectedProgramId,
      surveyTitle,
      overallAverage,
      totalResponses,
      averageResponseRate,
      scoreClass,
      initials,
      isDownloading,
      getEvaluatedTeachersService,
      handleDownloadPDF,
      handleViewTeacherDetails,
    };
  },
});
</script>

<style scoped>
.analysisSection {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ====== Banner ====== */
.banner {
  padding: 1.25rem 1.25rem;
  border-radius: 4px;
}

.banner__title {
  margin: 0 0 4px;
  font-size: 1.25rem;
  font-weight: 700;
}

.banner__subtitle {
  margin: 0 0 1rem;
  font-size: 0.875rem;
}

.banner__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .banner__stats {
    grid-template-columns: 1fr;
  }
}

/* ====== Stat Cards ====== */
.statCard {
  background: var(--color-secondary);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.statCard__icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1rem;
  color: #fff;
}

.statCard__label {
  font-size: 0.75rem;
  opacity: 0.85;
  color: #fff;
}

.statCard__value {
  font-size: 1.375rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
}

/* ====== Filtros externos ====== */
.externalFilters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.externalFilters__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 240px;
  flex: 1;
}

.externalFilters__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-gray-600, #64748b);
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
}

/* ====== Celda Docente ====== */
.teacherCell {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #dbeafe;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.7rem;
  flex-shrink: 0;
}

.teacherCell__name {
  font-weight: 600;
  font-size: 0.875rem;
}

/* ====== Score Pills ====== */
.scorePill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.8rem;
  border: 1px solid transparent;
  white-space: nowrap;
}

.scorePill--green {
  color: #15803d;
  background: #dcfce7;
  border-color: #bbf7d0;
}

.scorePill--blue {
  color: #1d4ed8;
  background: #dbeafe;
  border-color: #bfdbfe;
}

.scorePill--amber {
  color: #b45309;
  background: #ffedd5;
  border-color: #fed7aa;
}

.scorePill--red {
  color: #b91c1c;
  background: #fee2e2;
  border-color: #fecaca;
}
</style>
