<template>
  <AppBaseList title="Detalle del Docente" :isCard="true">
    <template #actions>
      <AppButton style="color: white" :loading="isDownloading" @click="handleDownloadPDF">
        <AppIcon icon="file-pdf" />
        Descargar Reporte
      </AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <template v-else>
        <section class="teacherDetail">
          <!-- ====== Banner del docente ====== -->
          <div class="banner">
            <div class="banner__profile">
              <div class="banner__avatar">{{ initials(teacher.name) }}</div>
              <div class="banner__info">
                <h2 class="banner__name">{{ teacher.name }}</h2>
                <p class="banner__course">{{ teacher.course }}</p>
                <p class="banner__department">{{ teacher.department }}</p>
              </div>
            </div>

            <div class="banner__stats">
              <div class="statCard">
                <div class="statCard__icon">
                  <font-awesome-icon icon="award" />
                </div>
                <div class="statCard__content">
                  <div class="statCard__label">Promedio General</div>
                  <div class="statCard__value">
                    {{ teacher.averageScore.toFixed(2) }}
                  </div>
                </div>
              </div>

              <div class="statCard">
                <div class="statCard__icon">
                  <font-awesome-icon icon="clipboard-list" />
                </div>
                <div class="statCard__content">
                  <div class="statCard__label">Evaluaciones Recibidas</div>
                  <div class="statCard__value">{{ teacher.responseCount }}</div>
                </div>
              </div>

              <div class="statCard">
                <div class="statCard__icon">
                  <font-awesome-icon icon="chart-bar" />
                </div>
                <div class="statCard__content">
                  <div class="statCard__label">Tasa de Respuesta</div>
                  <div class="statCard__value">{{ teacher.responseRate }}%</div>
                </div>
              </div>
            </div>
          </div>

          <!-- ====== Filtros ====== -->
          <div class="filterCard">
            <div class="filterCard__field filterCard__field--search">
              <label class="filterCard__label">{{ t('evaluationTeacher.search') }}</label>
              <div class="filterCard__inputWrap">
                <input v-model="searchQuery" type="text" :placeholder="t('evaluationTeacher.searchPlaceholder')" class="o-form-control" />
                <span class="filterCard__searchIcon">
                  <AppIcon icon="search" />
                </span>
              </div>
            </div>

            <div class="filterCard__field">
              <label class="filterCard__label">{{ t('evaluationTeacher.subject') }}</label>
              <select v-model="selectedSubject" class="o-form-control">
                <option value="all">
                  {{ t('evaluationTeacher.allSubjects') }}
                </option>
                <option v-for="subj in subjects || []" :key="subj.id" :value="subj.id">
                  {{ subj.name }}
                </option>
              </select>
            </div>

            <div class="filterCard__field">
              <label class="filterCard__label">{{ t('evaluationTeacher.evaluatorTypes') }}</label>
              <select v-model="selectedEvaluatorRole" class="o-form-control" :disabled="!evaluatorRoles || evaluatorRoles.length === 0">
                <option value="all">
                  {{ t('evaluationTeacher.allEvaluators') }}
                </option>
                <option v-for="role in evaluatorRoles || []" :key="role.id" :value="role.id">
                  {{ role.label }}
                </option>
              </select>
            </div>

            <div class="filterCard__actions">
              <AppButton variant="secondary" outlined @click="clearFilters">{{ t('evaluationTeacher.clearFilters') }}</AppButton>
            </div>
          </div>

          <!-- ====== Análisis por Dimensión ====== -->
          <div class="detailCard">
            <h3 class="detailCard__title">
              <AppIcon icon="chart-pie" />
              Análisis por Dimensión
            </h3>

            <AppLoading v-if="isFiltering" />

            <template v-else>
              <div class="radar-container">
                <div class="radar-chart">
                  <svg viewBox="0 0 600 500" class="radar-svg">
                    <!-- Guías de fondo -->
                    <g>
                      <polygon :points="radarMaxPoints" fill="none" stroke="#e2e8f0" stroke-width="1" />
                      <polygon :points="radarGuidePoints(0.8)" fill="none" stroke="#e2e8f0" stroke-width="0.5" />
                      <polygon :points="radarGuidePoints(0.6)" fill="none" stroke="#e2e8f0" stroke-width="0.5" />
                      <polygon :points="radarGuidePoints(0.4)" fill="none" stroke="#e2e8f0" stroke-width="0.5" />
                    </g>
                    <!-- Líneas desde el centro -->
                    <g>
                      <line v-for="(dim, i) in dimensions" :key="'line-' + i" x1="300" y1="250" :x2="getRadarPoint(i, 1).x" :y2="getRadarPoint(i, 1).y" stroke="#e2e8f0" stroke-width="0.5" />
                    </g>
                    <!-- Polígono de datos -->
                    <g>
                      <polygon :points="radarDataPoints" fill="rgba(37, 99, 235, 0.2)" stroke="#2563eb" stroke-width="2" />
                    </g>
                    <!-- Puntos de datos -->
                    <g>
                      <circle v-for="(dim, i) in dimensions" :key="'point-' + i" :cx="getRadarPoint(i, dim.score / 5).x" :cy="getRadarPoint(i, dim.score / 5).y" r="4" fill="#2563eb" />
                    </g>
                    <!-- Labels -->
                    <g>
                      <text v-for="(dim, i) in dimensions" :key="'label-' + i" :x="getRadarLabelPoint(i).x" :y="getRadarLabelPoint(i).y" text-anchor="middle" class="radar-label">
                        {{ dim.name }}
                      </text>
                    </g>
                  </svg>
                </div>

                <div class="radar-legend">
                  <span class="radar-legend__item">
                    <span class="radar-legend__dot radar-legend__dot--blue"></span>
                    Puntaje Obtenido
                  </span>
                  <span class="radar-legend__item">
                    <span class="radar-legend__dot radar-legend__dot--gray"></span>
                    Puntaje Máximo
                  </span>
                </div>
              </div>

              <div class="dimensions-grid">
                <div v-for="dim in dimensions" :key="dim.name" class="dimensionCard">
                  <div class="dimensionCard__name">{{ dim.name }}</div>
                  <div class="dimensionCard__score">
                    <span class="dimensionCard__value">{{ dim.score.toFixed(1) }}</span>
                    <span class="dimensionCard__max">/ 5</span>
                  </div>
                  <div class="dimensionCard__pct" :class="percentageClass(dim.score)">{{ Math.round((dim.score / 5) * 100) }}%</div>
                </div>
              </div>
            </template>
          </div>

          <!-- ====== Desglose por Pregunta ====== -->
          <div class="detailCard">
            <h3 class="detailCard__title">
              <AppIcon icon="list" />
              Desglose por Pregunta
            </h3>

            <AppLoading v-if="isFiltering" />

            <template v-else>
              <p v-if="!filteredQuestionCategories.length" class="tw-text-sm tw-text-gray-400 tw-text-center tw-py-6">No hay preguntas para los filtros seleccionados.</p>
              <div v-for="category in filteredQuestionCategories" :key="category.name" class="questionGroup">
                <h4 class="questionGroup__title">{{ category.name }}</h4>

                <div v-for="question in category.questions" :key="question.id" class="questionCard">
                  <div class="questionCard__header">
                    <span class="questionCard__number">{{ question.id }}</span>
                    <span class="questionCard__text">{{ question.text }}</span>
                  </div>

                  <div class="questionCard__stats">
                    <div class="questionStat">
                      <div class="questionStat__label">Promedio</div>
                      <div class="questionStat__value">
                        <span class="questionStat__score">{{ question.average.toFixed(2) }}</span>
                        <span class="questionStat__max">/ 5.00</span>
                      </div>
                    </div>

                    <div class="questionStat">
                      <div class="questionStat__label">Desviación Estándar</div>
                      <div class="questionStat__value">
                        <span class="questionStat__deviation">≈ {{ question.stdDev.toFixed(2) }}</span>
                      </div>
                      <div class="questionStat__variability" :class="variabilityClass(question.stdDev)">
                        {{ variabilityText(question.stdDev) }}
                      </div>
                    </div>

                    <div class="questionStat">
                      <div class="questionStat__label">Respuestas</div>
                      <div class="questionStat__value">
                        <span class="questionStat__responses">{{ question.responses }}</span>
                      </div>
                      <div class="questionStat__sub">participantes</div>
                    </div>
                  </div>

                  <div class="questionCard__bar">
                    <div class="questionCard__progress" :style="{ width: (question.average / 5) * 100 + '%' }" :class="progressBarClass(question.average)"></div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </section>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import { ToastService } from '../../../shared/services/toast.service';
import { InstitutionsService } from '../../../shared/services/institutions.service';
import { GetTeacherDetailAnalyticsService } from '../services/getTeacherDetailAnalytics.service';
import { GetTeacherSubjectsService } from '../services/getTeacherSubjects.service';
import { GetTeacherDimensionsService } from '../services/getTeacherDimensions.service';

const toastService = new ToastService();
const institutionsService = new InstitutionsService();
const getTeacherDetailService = new GetTeacherDetailAnalyticsService();
const getTeacherSubjectsService = new GetTeacherSubjectsService();
const getTeacherDimensionsService = new GetTeacherDimensionsService();

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { useI18n } from 'vue-i18n';

type Teacher = {
  id: string;
  name: string;
  department: string;
  course: string;
  averageScore: number;
  responseCount: number;
  responseRate: number;
};

type Dimension = { name: string; score: number };

type Question = {
  id: number;
  text: string;
  average: number;
  stdDev: number;
  responses: number;
};

type QuestionCategory = { name: string; questions: Question[] };

export default defineComponent({
  name: 'TeacherDetail',
  components: {
    AppLoading,
    AppBaseList,
    AppButton,
    AppIcon,
  },
  setup() {
    const route = useRoute();
    const { t } = useI18n();
    const loading = ref(true);
    const isFiltering = ref(false);
    const isDownloading = ref(false);

    useMeta({ title: 'Detalle del Docente' });

    const teacher = ref<Teacher>({
      id: '',
      name: '',
      department: '',
      course: '',
      averageScore: 0,
      responseCount: 0,
      responseRate: 0,
    });

    const selectedSubject = ref<number | 'all'>('all');
    const searchQuery = ref('');
    const subjects = ref<Array<{ id: number; name: string }>>([]);
    const selectedEvaluatorRole = ref('all');
    const evaluatorRoles = ref<Array<{ id: string | number; label: string }>>([]);

    const dimensions = ref<Dimension[]>([]);

    const questionCategories = ref<QuestionCategory[]>([]);

    const filteredQuestionCategories = computed(() => {
      const term = searchQuery.value.trim().toLowerCase();

      // Si no hay término de búsqueda, devolver todas las categorías
      if (!term) {
        return questionCategories.value;
      }

      // Filtrar categorías
      return questionCategories.value
        .filter((cat) => {
          const categoryName = cat.name.toLowerCase();
          const hasMatchingQuestion = cat.questions.some((q) => (q.text || '').toLowerCase().includes(term));

          // Incluir la categoría si:
          // 1. El nombre de la dimensión coincide (mostrar todas sus preguntas)
          // 2. O alguna pregunta coincide con el término
          return categoryName.includes(term) || hasMatchingQuestion;
        })
        .map((cat) => {
          // Si la dimensión coincide, mostrar todas sus preguntas
          const categoryName = cat.name.toLowerCase();
          if (categoryName.includes(term)) {
            return cat;
          }

          // Si no, filtrar preguntas que coincidan
          return {
            ...cat,
            questions: cat.questions.filter((q) => (q.text || '').toLowerCase().includes(term)),
          };
        });
    });

    const clearFilters = () => {
      searchQuery.value = '';
      selectedSubject.value = 'all';
      selectedEvaluatorRole.value = 'all';
    };

    // Radar chart
    const getRadarPoint = (index: number, value: number) => {
      const angle = (Math.PI * 2 * index) / dimensions.value.length - Math.PI / 2;
      const radius = 160 * value;
      return {
        x: 300 + radius * Math.cos(angle),
        y: 250 + radius * Math.sin(angle),
      };
    };

    const getRadarLabelPoint = (index: number) => {
      const angle = (Math.PI * 2 * index) / dimensions.value.length - Math.PI / 2;
      return {
        x: 300 + 240 * Math.cos(angle),
        y: 250 + 240 * Math.sin(angle) + 4,
      };
    };

    const radarMaxPoints = computed(() =>
      dimensions.value
        .map((_, i) => {
          const p = getRadarPoint(i, 1);
          return `${p.x},${p.y}`;
        })
        .join(' ')
    );

    const radarGuidePoints = (scale: number) =>
      dimensions.value
        .map((_, i) => {
          const p = getRadarPoint(i, scale);
          return `${p.x},${p.y}`;
        })
        .join(' ');

    const radarDataPoints = computed(() =>
      dimensions.value
        .map((dim, i) => {
          const p = getRadarPoint(i, dim.score / 5);
          return `${p.x},${p.y}`;
        })
        .join(' ')
    );

    // UI helpers
    const initials = (name: string) => {
      const parts = name.split(' ').filter(Boolean);
      return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '')).toUpperCase();
    };

    const percentageClass = (score: number) => {
      const pct = (score / 5) * 100;
      if (pct >= 90) return 'pct--green';
      if (pct >= 80) return 'pct--blue';
      if (pct >= 70) return 'pct--amber';
      return 'pct--red';
    };

    const variabilityClass = (stdDev: number) => {
      if (stdDev <= 0.5) return 'variability--low';
      if (stdDev <= 0.8) return 'variability--medium';
      return 'variability--high';
    };

    const variabilityText = (stdDev: number) => {
      if (stdDev <= 0.5) return 'Baja variabilidad';
      if (stdDev <= 0.8) return 'Variabilidad moderada';
      return 'Alta variabilidad';
    };

    const progressBarClass = (score: number) => {
      if (score >= 4.5) return 'progress--green';
      if (score >= 4.0) return 'progress--blue';
      if (score >= 3.5) return 'progress--amber';
      return 'progress--red';
    };

    const buildCsv = (headers: string[], rows: string[][]) => {
      const lines = [headers, ...rows].map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','));
      return lines.join('\r\n');
    };

    const triggerCsvDownload = (filename: string, content: string) => {
      const blob = new Blob(['\uFEFF' + content], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const handleDownloadPDF = async () => {
      if (isDownloading.value) return;
      isDownloading.value = true;
      try {
        const headers = ['Dimensión', 'N° Pregunta', 'Pregunta', 'Promedio', 'Desviación Estándar', 'Respuestas'];
        const rows: string[][] = [];
        for (const cat of questionCategories.value) {
          for (const q of cat.questions) {
            rows.push([cat.name, String(q.id), q.text, q.average.toFixed(2), q.stdDev.toFixed(2), String(q.responses)]);
          }
        }
        const safeName = (teacher.value.name || 'docente').replace(/[\s/\\:*?"<>|]+/g, '-');
        triggerCsvDownload(`reporte-${safeName}.csv`, buildCsv(headers, rows));
        toastService.show(`Reporte de ${teacher.value.name} generado exitosamente.`, 'success');
      } catch {
        toastService.show('Error al generar el reporte.', 'error');
      } finally {
        isDownloading.value = false;
      }
    };

    onMounted(async () => {
      try {
        const q = route.query;
        const evaluationId = q.evaluationId as string;
        const userId = q.id as string;

        // Si tenemos los parámetros necesarios, cargar datos del API
        if (evaluationId && userId) {
          // Cargar datos del docente, asignaturas y dimensiones en paralelo
          const institutionId = institutionsService.getSelectedInstitution()?.id.toString();
          const [detailResponse, subjectsResponse, dimensionsResponse] = await Promise.all([
            getTeacherDetailService.run({ evaluationId, userId }, institutionId),
            getTeacherSubjectsService.run({ evaluationId, userId }, institutionId),
            getTeacherDimensionsService.run({ evaluationId, userId }, institutionId),
          ]);

          // Mapear respuesta del API a teacher
          if (detailResponse?.data) {
            const apiData = detailResponse.data;
            teacher.value = {
              id: q.id as string,
              name: apiData.fullName || (q.name as string) || 'Docente',
              department: apiData.faculty || (q.department as string) || '',
              course: (q.course as string) || apiData.subjectName || '',
              averageScore: apiData.stats?.average ?? parseFloat(q.averageScore as string) ?? 0,
              responseCount: apiData.stats?.received ?? parseInt(q.responseCount as string) ?? 0,
              responseRate: apiData.stats?.responseRate ?? parseInt(q.responseRate as string) ?? 0,
            };

            // Mapear dimensiones
            if (apiData.dimensions && Array.isArray(apiData.dimensions)) {
              dimensions.value = apiData.dimensions.map((dim: any) => ({
                name: dim.name,
                score: dim.score,
              }));

              // Agrupar preguntas por dimensión para las categorías
              const questionCats = apiData.dimensions.map((dim: any) => ({
                name: dim.name?.toUpperCase() || 'SIN CATEGORÍA',
                questions: (dim.questions || []).map((q: any) => ({
                  id: q.id,
                  text: q.label || q.description || '',
                  average: q.average ?? 0,
                  stdDev: q.stdDev ?? 0,
                  responses: q.responses ?? 0,
                })),
              }));
              questionCategories.value = questionCats;
            }
          }

          // Mapear asignaturas
          if (subjectsResponse?.data?.subjects && Array.isArray(subjectsResponse.data.subjects)) {
            subjects.value = subjectsResponse.data.subjects.filter((s: any) => s?.id).map((s: any) => ({ id: s.id, name: s.name || String(s.id) }));
          }

          // Mapear tipos de evaluadores
          if (subjectsResponse?.data?.evaluatorRoles && Array.isArray(subjectsResponse.data.evaluatorRoles)) {
            evaluatorRoles.value = subjectsResponse.data.evaluatorRoles.map((role: any) => ({
              id: role.key,
              label: role.label,
            }));
          }

          // Mapear dimensiones desde el endpoint específico (reemplaza con datos más detallados)
          if (dimensionsResponse?.data && Array.isArray(dimensionsResponse.data)) {
            // dimensionsResponse.data es un array directo de dimensiones
            const dimensionsFromApi = dimensionsResponse.data;

            // Actualizar dimensiones para el radar chart
            dimensions.value = dimensionsFromApi.map((dim: any) => ({
              name: dim.name,
              score: dim.score,
            }));

            // Actualizar categorías de preguntas con datos del endpoint /dimensions
            const questionCats = dimensionsFromApi.map((dim: any) => ({
              name: dim.name?.toUpperCase() || 'SIN CATEGORÍA',
              questions: (dim.questions || []).map((q: any) => ({
                id: q.id,
                text: q.label || q.description || '',
                average: q.average ?? 0,
                stdDev: q.stdDev ?? 0,
                responses: q.responses ?? 0,
              })),
            }));
            questionCategories.value = questionCats;
          }
        } else {
          // Fallback a datos del query string
          if (q.id) {
            teacher.value = {
              id: q.id as string,
              name: (q.name as string) || 'Docente',
              department: (q.department as string) || '',
              course: (q.course as string) || '',
              averageScore: parseFloat(q.averageScore as string) || 0,
              responseCount: parseInt(q.responseCount as string) || 0,
              responseRate: parseInt(q.responseRate as string) || 0,
            };
          }
        }
      } catch (error) {
        console.error('Error al cargar detalle del docente:', error);
        toastService.show('Error al cargar los datos del docente. Por favor intenta más tarde.', 'error');

        // Fallback a query string
        const q = route.query;
        if (q.id) {
          teacher.value = {
            id: q.id as string,
            name: (q.name as string) || 'Docente',
            department: (q.department as string) || '',
            course: (q.course as string) || '',
            averageScore: parseFloat(q.averageScore as string) || 0,
            responseCount: parseInt(q.responseCount as string) || 0,
            responseRate: parseInt(q.responseRate as string) || 0,
          };
        }
      } finally {
        loading.value = false;

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Evaluación Docente', url: '' };
        headerStorage.moduleItem = { name: 'Análisis y Estadística', url: '' };
        headerStorage.moduleSubItem = {
          name: teacher.value.name || 'Detalle',
          url: '',
        };
      }
    });

    const reloadDimensionsWithFilters = async () => {
      const q = route.query;
      const evaluationId = q.evaluationId as string;
      const userId = q.id as string;
      if (!evaluationId || !userId) return;

      isFiltering.value = true;
      try {
        const institutionId = institutionsService.getSelectedInstitution()?.id.toString();
        const params: any = { evaluationId, userId };

        if (selectedSubject.value !== 'all') params.subjectId = selectedSubject.value;
        if (selectedEvaluatorRole.value !== 'all') params.evaluatorRole = selectedEvaluatorRole.value;

        const dimensionsResponse = await getTeacherDimensionsService.run(params, institutionId);

        if (dimensionsResponse?.data && Array.isArray(dimensionsResponse.data)) {
          dimensions.value = dimensionsResponse.data.map((dim: any) => ({
            name: dim.name,
            score: dim.score,
          }));
          questionCategories.value = dimensionsResponse.data.map((dim: any) => ({
            name: dim.name?.toUpperCase() || 'SIN CATEGORÍA',
            questions: (dim.questions || []).map((q: any) => ({
              id: q.id,
              text: q.label || q.description || '',
              average: q.average ?? 0,
              stdDev: q.stdDev ?? 0,
              responses: q.responses ?? 0,
            })),
          }));
        }
      } catch {
        toastService.show('Error al aplicar los filtros. Por favor intenta de nuevo.', 'error');
      } finally {
        isFiltering.value = false;
      }
    };

    watch([selectedSubject, selectedEvaluatorRole], reloadDimensionsWithFilters);

    return {
      t,
      loading,
      isFiltering,
      teacher,
      selectedSubject,
      searchQuery,
      subjects,
      selectedEvaluatorRole,
      evaluatorRoles,
      dimensions,
      questionCategories,
      filteredQuestionCategories,
      clearFilters,
      getRadarPoint,
      getRadarLabelPoint,
      radarMaxPoints,
      radarGuidePoints,
      radarDataPoints,
      initials,
      percentageClass,
      variabilityClass,
      variabilityText,
      progressBarClass,
      handleDownloadPDF,
      isDownloading,
    };
  },
});
</script>

<style scoped>
.teacherDetail {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ====== Banner ====== */
.banner {
  padding: 1.25rem;
  background: var(--color-primary);
  color: #fff;
  border-radius: 4px;
}

.banner__profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.banner__avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.375rem;
  font-weight: 800;
  flex-shrink: 0;
}

.banner__info {
  flex: 1;
}

.banner__name {
  margin: 0 0 3px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

.banner__course {
  margin: 0 0 2px;
  font-size: 0.875rem;
  opacity: 0.95;
  color: #fff;
}

.banner__department {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.8;
  color: #fff;
}

.banner__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  width: 38px;
  height: 38px;
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

/* ====== Filter Card (patrón EvaluationFilters) ====== */
.filterCard {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr 250px 300px auto;
  gap: 1rem;
  align-items: end;
}

.filterCard__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filterCard__field--search {
  min-width: 0;
}

.filterCard__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  margin: 0;
}

.filterCard__inputWrap {
  position: relative;
}

.filterCard__inputWrap .o-form-control {
  padding-right: 2rem;
  width: 100%;
}

.filterCard__searchIcon {
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.8rem;
  pointer-events: none;
}

.filterCard__field:not(.filterCard__field--search) .o-form-control {
  width: 100%;
}

.filterCard__actions {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

/* Responsive: adaptar en pantallas pequeñas */
@media (max-width: 1200px) {
  .filterCard {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}

/* Reutiliza la clase del AppDatatable para consistencia */
.o-form-control {
  display: block;
  width: 100%;
  padding: var(--padding-1, 0.5rem 0.75rem);
  border-radius: var(--border-radius-1, 4px);
  font-size: var(--font-size-2, 0.875rem);
  font-weight: var(--font-weight-normal, 400);
  line-height: var(--line-height-3, 1.5);
  color: rgba(var(--color-gray-900-rgb), var(--opacity-color-80, 0.8));
  background-color: var(--color-light, #fff);
  border: var(--border-1, 1px) solid rgba(var(--color-gray-600-rgb), var(--opacity-color-60, 0.6));
}

.o-form-control:focus {
  border-color: rgba(var(--color-gray-600-rgb), 1);
  outline: 0;
}

/* ====== Detail Card (secciones) ====== */
.detailCard {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
}

.detailCard__title {
  margin: 0 0 1.25rem;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ====== Radar Chart ====== */
.radar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.radar-chart {
  width: 100%;
  max-width: 600px;
  height: 400px;
}

.radar-svg {
  width: 100%;
  height: 100%;
}

.radar-label {
  font-size: 13px;
  fill: #64748b;
  font-weight: 500;
}

.radar-legend {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 0.75rem;
}

.radar-legend__item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #64748b;
}

.radar-legend__dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.radar-legend__dot--blue {
  background: #2563eb;
}
.radar-legend__dot--gray {
  background: #e2e8f0;
}

/* ====== Dimensions Grid ====== */
.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.dimensionCard {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem;
}

.dimensionCard__name {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 4px;
}

.dimensionCard__value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.dimensionCard__max {
  font-size: 0.875rem;
  color: #94a3b8;
}

.dimensionCard__pct {
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 2px;
}

.pct--green {
  color: #16a34a;
}
.pct--blue {
  color: #2563eb;
}
.pct--amber {
  color: #d97706;
}
.pct--red {
  color: #dc2626;
}

/* ====== Question Groups ====== */
.questionGroup {
  margin-bottom: 1.5rem;
}

.questionGroup:last-child {
  margin-bottom: 0;
}

.questionGroup__title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem;
}

.questionCard {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
}

.questionCard:last-child {
  margin-bottom: 0;
}

.questionCard__header {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  margin-bottom: 0.875rem;
}

.questionCard__number {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: #475569;
  flex-shrink: 0;
}

.questionCard__text {
  font-size: 0.875rem;
  color: #334155;
  line-height: 1.4;
}

.questionCard__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 0.875rem;
}

@media (max-width: 640px) {
  .questionCard__stats {
    grid-template-columns: 1fr;
  }
}

.questionStat__label {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-bottom: 3px;
}

.questionStat__score {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.questionStat__max {
  font-size: 0.875rem;
  color: #94a3b8;
}

.questionStat__deviation {
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
}

.questionStat__variability {
  font-size: 0.7rem;
  margin-top: 2px;
}

.variability--low {
  color: #16a34a;
}
.variability--medium {
  color: #d97706;
}
.variability--high {
  color: #dc2626;
}

.questionStat__responses {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.questionStat__sub {
  font-size: 0.7rem;
  color: #94a3b8;
}

.questionCard__bar {
  height: 5px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.questionCard__progress {
  height: 100%;
  border-radius: 3px;
}

.progress--green {
  background: #22c55e;
}
.progress--blue {
  background: #3b82f6;
}
.progress--amber {
  background: #f59e0b;
}
.progress--red {
  background: #ef4444;
}
</style>
