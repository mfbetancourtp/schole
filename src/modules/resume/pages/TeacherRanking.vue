<template>
  <AppBaseList :title="title">
    <template #actions>
      <!-- <AppButton type="button" class="btnSecondary">
        <AppIcon icon="cog" />
        Ver Criterios
      </AppButton> -->

      <AppButton style="color: white" type="button" class="btnPrimary" :disabled="isExporting || !docentes.length" @click="exportResults">
        <AppIcon icon="file-download" />
        {{ isExporting ? 'Exportando...' : 'Exportar' }}
      </AppButton>

      <AppButton style="color: white" type="button" class="btnPrimary" :disabled="isRecalculating || !selectedEvaluationModelId" @click="recalculateRanking">
        <AppIcon icon="calculator" />
        Recalcular Ranking
      </AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="rankingPage">
        <!-- Header -->
        <div class="sectionHead">
          <div class="contentIconTitle">
            <div class="sectionHead__icon">
              <AppIcon icon="trophy" />
            </div>
            <div>
              <h2 class="sectionHead__title">Ranking Docente</h2>
              <p class="sectionHead__subtitle">Análisis estratégico del desempeño según criterios configurados.</p>
            </div>
          </div>

          <div class="modelFilter">
            <AppFormField :label="'Modelo de evaluación'">
              <AppAutocomplete
                class="rankingPage__topFilter rankingPage__topFilter--model"
                input-id="teacher-ranking-evaluation-model"
                :options="evaluationModelOptions"
                label="displayName"
                :reduce="(option: any) => option.id"
                v-model="selectedEvaluationModelId"
                :clearable="false"
              />
            </AppFormField>
          </div>
        </div>

        <!-- KPIs -->
        <div class="statsGrid">
          <AppStatCard
            v-for="card in summaryCards"
            :key="card.label"
            :label="card.label"
            :value="card.value"
            :caption="card.caption"
            :icon="card.icon"
            :variant="card.variant"
            :value-size="card.valueSize"
          />
        </div>

        <!-- Charts -->
        <div class="chartsGrid">
          <AppCard>
            <template #title>Distribución de Puntajes</template>
            <template #body>
              <apexchart type="bar" height="320" :options="distributionChartOptions" :series="distributionChartSeries" />
            </template>
          </AppCard>

          <AppCard>
            <template #title>Puntaje Promedio por Categoría</template>
            <template #body>
              <apexchart type="bar" height="320" :options="categoryChartOptions" :series="categoryChartSeries" />
            </template>
          </AppCard>
        </div>

        <!-- Datatable -->
        <AppDatatable
          name="teacher-ranking"
          :service="getTeacherRankingService"
          :params="rankingTableParams"
          :enable-search-filter="true"
          :show-filter-steps="true"
          :default-per-page="10"
          default-sort-direction="desc"
        >
          <AppDatatableColumn field="position" label="Posición" sortable v-slot="props">
            <div class="positionCell">
              <span class="positionNumber">#{{ getRankingPosition(props.row) }}</span>
              <AppIcon v-if="getRankingPosition(props.row) <= 3" icon="award" class="medalIcon" />
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn field="people.names" label="Docente" sortable v-slot="props">
            <div class="teacherCell">
              <div class="teacherAvatar">
                <img v-if="getPhotoUrl(props.row)" :src="getPhotoUrl(props.row)" :alt="getTeacherName(props.row)" />
                <span v-else>{{ getInitials(getTeacherName(props.row)) }}</span>
              </div>

              <div>
                <div class="teacherName">{{ getTeacherName(props.row) }}</div>
                <!-- <div class="teacherMeta">{{ props.row.programa }}</div> -->
              </div>
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn field="totalScore" label="Puntaje Total" sortable v-slot="props">
            <div class="scoreCell">
              <div class="scoreCell__top">
                <span class="totalScore">{{ getTotalScore(props.row) }}</span>
                <span class="scoreMax">/ {{ getMaxScore(props.row) }}</span>
              </div>

              <div class="progressBar">
                <div class="progressBar__fill" :style="{ width: `${getScorePercentage(props.row)}%` }" />
              </div>
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn field="classificationName" label="Nivel" sortable v-slot="props">
            <AppBadge :label="getClassificationName(props.row)" :variant="getNivelVariant(getClassificationName(props.row))" />
          </AppDatatableColumn>

          <AppDatatableColumn label="Acción" position="centered" v-slot="props">
            <AppButton type="button" outlined icon="eye" @click="handleVerDetalle(props.row)" v-tooltip="'Ver'"> </AppButton>
          </AppDatatableColumn>
        </AppDatatable>

        <!-- Drawer detalle -->
        <AppDrawer :isVisible="sheetOpen" size="lg" @update:isVisible="sheetOpen = $event">
          <template #head>
            <div class="drawerHead">
              <div>
                <h2 class="drawerHead__title">Análisis de Desempeño</h2>
                <p class="drawerHead__subtitle">Detalles completos del desempeño del docente seleccionado.</p>
              </div>
            </div>
          </template>

          <template #body>
            <div v-if="selectedDocente" class="drawerBody">
              <!-- Header docente -->
              <AppCard class="mbCard">
                <template #body>
                  <div class="detailTeacher">
                    <div class="detailTeacher__avatar">
                      <img v-if="getPhotoUrl(selectedDocente)" :src="getPhotoUrl(selectedDocente)" :alt="getTeacherName(selectedDocente)" />
                      <span v-else>{{ getInitials(getTeacherName(selectedDocente)) }}</span>
                    </div>

                    <div class="detailTeacher__info">
                      <h3 class="detailTeacher__name">
                        {{ getTeacherName(selectedDocente) }}
                      </h3>
                      <!-- <p class="detailTeacher__meta">
                        {{ getProgramName(selectedDocente) }}
                      </p> -->

                      <div class="detailTeacher__stats">
                        <div>
                          <span class="miniLabel">Puntaje Total</span>
                          <div class="bigValue">
                            {{ getTotalScore(selectedDocente) }}
                          </div>
                        </div>
                        <div class="divider"></div>
                        <div>
                          <span class="miniLabel">Posición</span>
                          <div class="bigValue">#{{ getRankingPosition(selectedDocente) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </AppCard>

              <!-- Radar chart -->
              <AppCard class="mbCard">
                <template #title>Distribución por Categoría</template>
                <template #body>
                  <apexchart type="radar" height="320" :options="radarChartOptions" :series="radarChartSeries" />
                </template>
              </AppCard>

              <!-- Desglose -->
              <AppCard class="mbCard">
                <template #title>Desglose de Puntaje</template>
                <template #body>
                  <div class="scoreBreakdown">
                    <div class="scoreBreakdown__row">
                      <span>Formación Académica</span>
                      <strong>{{ getCategoryScore(selectedDocente, 'Formación Académica') }} pts</strong>
                    </div>
                    <div class="scoreBreakdown__row">
                      <span>Experiencia Laboral</span>
                      <strong>{{ getCategoryScore(selectedDocente, 'Experiencia Laboral') }} pts</strong>
                    </div>
                    <div class="scoreBreakdown__row">
                      <span>Producción Intelectual</span>
                      <strong>{{ getCategoryScore(selectedDocente, 'Producción Intelectual') }} pts</strong>
                    </div>
                    <div class="scoreBreakdown__row">
                      <span>Premios y Reconocimientos</span>
                      <strong>{{ getCategoryScore(selectedDocente, 'Premios y Reconocimientos') }} pts</strong>
                    </div>
                  </div>
                </template>
              </AppCard>

              <!-- Comparativo -->
              <AppCard class="compareCard" :color="' #ecfdf3'">
                <template #body>
                  <div class="compareCard__content">
                    <h4 class="compareCard__title">Comparativo Institucional</h4>

                    <div class="compareRow">
                      <span>Puntaje Docente</span>
                      <strong class="comparePrimary">
                        {{ getTotalScore(selectedDocente) }}
                      </strong>
                    </div>

                    <div class="compareRow">
                      <span>Promedio Institucional</span>
                      <strong>{{ puntajePromedio }}</strong>
                    </div>

                    <div class="compareRow compareRow--border">
                      <span>Diferencia</span>
                      <strong :class="getTotalScore(selectedDocente) > Number(puntajePromedio) ? 'comparePositive' : 'compareNegative'">
                        {{ getTotalScore(selectedDocente) > Number(puntajePromedio) ? '+' : '' }}
                        {{ (getTotalScore(selectedDocente) - Number(puntajePromedio)).toFixed(1) }}
                      </strong>
                    </div>
                  </div>
                </template>
              </AppCard>
            </div>
          </template>

          <template #footer>
            <div class="drawerFooterActions">
              <AppButton type="button" class="btnSecondary" @click="sheetOpen = false"> Cerrar </AppButton>
            </div>
          </template>
        </AppDrawer>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useMeta } from 'vue-meta';
import dayjs from 'dayjs';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';

import { useHeaderStore } from '../../../stores/header.store';
import { useCheckDataTableStore } from '../../../stores/checkDataTable.store';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetEvaluationModelsService } from '../services/getEvaluationModels.service';
import { GetTeacherRankingService } from '../services/getTeacherRanking.service';
import { GetTeacherRankingSummaryService } from '../services/getTeacherRankingSummary.service';
import { GetTeacherRankingChartsService } from '../services/getTeacherRankingCharts.service';
import { RecalculateTeacherRankingService } from '../services/recalculateTeacherRanking.service';
import { ExportTeacherRankingService } from '../services/exportTeacherRanking.service';

interface EvaluationModelOptionDto {
  id: number;
  name: string;
  version?: string;
  displayName: string;
}

interface TeacherRankingSummaryDto {
  totalTeachers: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  lastCalculatedAt?: string;
}

interface ScoreDistributionDto {
  range: string;
  classificationName: string;
  color: string;
  count: number;
}

interface AverageByCategoryDto {
  categoryName: string;
  averageScore: number;
}

const getEvaluationModelsService = new GetEvaluationModelsService();
const getTeacherRankingService = new GetTeacherRankingService();
const getTeacherRankingSummaryService = new GetTeacherRankingSummaryService();
const getTeacherRankingChartsService = new GetTeacherRankingChartsService();
const recalculateTeacherRankingService = new RecalculateTeacherRankingService();
const exportTeacherRankingService = new ExportTeacherRankingService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'TeacherRankingPage',
  components: {
    AppBaseList,
    AppLoading,
    AppButton,
    AppIcon,
    AppCard,
    AppStatCard,
    AppBadge,
    AppDrawer,
    AppFormField,
    AppAutocomplete,
    AppDatatable,
    AppDatatableColumn,
  },
  setup() {
    const title = 'Ranking Docente';
    useMeta({ title });

    const loading = ref(true);
    const checkStore = useCheckDataTableStore();
    const isRecalculating = ref(false);
    const isExporting = ref(false);
    const sheetOpen = ref(false);
    const selectedDocente = ref<any | null>(null);

    const evaluationModelOptions = ref<EvaluationModelOptionDto[]>([]);
    const selectedEvaluationModelId = ref<number | null>(null);
    const docentes = computed<any[]>(() => {
      const data = checkStore.isCheckData?.dataTable?.data;
      return Array.isArray(data) ? data : [];
    });
    const rankingSummary = ref<TeacherRankingSummaryDto>({
      totalTeachers: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      lastCalculatedAt: undefined,
    });
    const scoreDistribution = ref<ScoreDistributionDto[]>([]);
    const averageByCategory = ref<AverageByCategoryDto[]>([]);

    const totalDocentes = computed(() => rankingSummary.value.totalTeachers);
    const puntajePromedio = computed(() => rankingSummary.value.averageScore.toFixed(1));
    const puntajeMaximo = computed(() => rankingSummary.value.highestScore);
    const puntajeMinimo = computed(() => rankingSummary.value.lowestScore);
    const ultimoCalculo = computed(() => {
      const lastDate = rankingSummary.value.lastCalculatedAt;
      return lastDate && dayjs(lastDate).isValid() ? dayjs(lastDate).format('DD/MMM/YYYY') : '-';
    });
    const rankingTableParams = computed(() => ({
      evaluationModelId: selectedEvaluationModelId.value || undefined,
    }));
    const summaryCards = computed(() => [
      {
        label: 'Total Docentes',
        value: totalDocentes.value,
        caption: 'Evaluados en el modelo',
        icon: 'users',
        variant: 'green',
      },
      {
        label: 'Puntaje Promedio',
        value: puntajePromedio.value,
        caption: 'Promedio general',
        icon: 'chart-line',
        variant: 'blue',
      },
      {
        label: 'Puntaje Más Alto',
        value: puntajeMaximo.value,
        caption: 'Mayor resultado obtenido',
        icon: 'trophy',
        variant: 'yellow',
      },
      {
        label: 'Puntaje Más Bajo',
        value: puntajeMinimo.value,
        caption: 'Menor resultado obtenido',
        icon: 'arrow-down',
        variant: 'red',
      },
      {
        label: 'Último Cálculo',
        value: ultimoCalculo.value,
        caption: 'Fecha de referencia',
        icon: 'calendar',
        variant: 'gray',
        valueSize: 'xs',
      },
    ]);

    const normalizeNumber = (value: any) => Number(value ?? 0);

    const getTeacherName = (item: any) => {
      const people = item?.people || item?.teacher || item?.person || {};
      const lastnames = people.lastnames || people.lastNames || people.surnames || '';
      const name = item?.nombre || item?.docente || item?.teacherName || item?.fullName || `${people.names || ''} ${lastnames}`.trim();
      return name || 'Docente';
    };

    const getProgramName = (item: any) => item?.programa || item?.program || '';

    const getPhotoUrl = (item: any) => item?.fotoUrl || item?.photoUrl || item?.avatar || item?.professionalProfile?.photoUrl || item?.people?.photoUrl || item?.people?.avatar;

    const getTotalScore = (item: any) => normalizeNumber(item?.puntajeTotal ?? item?.totalScore ?? item?.score ?? item?.total);

    const getMaxScore = (item: any) => normalizeNumber(item?.puntajeMaximo ?? item?.evaluationModel?.teacherEvaluationScale?.maximumOverallScore ?? item?.maximumOverallScore ?? 100) || 100;

    const getRankingPosition = (item: any) => normalizeNumber(item?.posicion ?? item?.position ?? item?.rank ?? 0);

    const getClassificationName = (item: any) => item?.nivel || item?.classificationName || item?.classification?.name || 'Sin clasificación';

    const extractData = (response: any) => {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.items)) return response.items;
      if (Array.isArray(response?.results)) return response.results;
      return [];
    };

    const selectedEvaluationModel = computed(() => evaluationModelOptions.value.find((model) => model.id === selectedEvaluationModelId.value));

    const loadEvaluationModels = async () => {
      const response = await getEvaluationModelsService.run({
        sort: 'id',
        order: 'ASC',
        page: 1,
        noPag: true,
        perPage: 10,
      });
      const models = extractData(response).map((model: any) => ({
        ...model,
        id: Number(model.id),
        displayName: `${model.name}${model.version ? ` v${model.version}` : ''}`,
      }));

      evaluationModelOptions.value = models;
      selectedEvaluationModelId.value = models[0]?.id ?? null;
    };

    const resetSummary = () => {
      rankingSummary.value = {
        totalTeachers: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        lastCalculatedAt: undefined,
      };
    };

    const resetCharts = () => {
      scoreDistribution.value = [];
      averageByCategory.value = [];
    };

    const loadSummary = async () => {
      if (!selectedEvaluationModelId.value) {
        resetSummary();
        return;
      }

      const response = await getTeacherRankingSummaryService.run({
        evaluationModelId: selectedEvaluationModelId.value,
      });

      rankingSummary.value = {
        totalTeachers: normalizeNumber(response?.totalTeachers),
        averageScore: normalizeNumber(response?.averageScore),
        highestScore: normalizeNumber(response?.highestScore),
        lowestScore: normalizeNumber(response?.lowestScore),
        lastCalculatedAt: response?.lastCalculatedAt,
      };
    };

    const loadCharts = async () => {
      if (!selectedEvaluationModelId.value) {
        resetCharts();
        return;
      }

      const response = await getTeacherRankingChartsService.run({
        evaluationModelId: selectedEvaluationModelId.value,
      });

      scoreDistribution.value = Array.isArray(response?.scoreDistribution) ? response.scoreDistribution : [];
      averageByCategory.value = Array.isArray(response?.averageByCategory) ? response.averageByCategory : [];
    };

    const refreshRankingData = async () => {
      checkStore.isCheckData.dataTable = { data: [] };
      await Promise.all([loadSummary(), loadCharts()]);
      updateDatatableService.run();
    };

    const getCategoryScore = (docente: any, categoryName: string) => {
      const normalizedCategory = categoryName.toLowerCase();
      if (normalizedCategory.includes('formación') || normalizedCategory.includes('academ')) {
        return normalizeNumber(docente?.puntajeFormacion ?? docente?.educationScore ?? docente?.academicTrainingScore);
      }
      if (normalizedCategory.includes('experiencia')) {
        return normalizeNumber(docente?.puntajeExperiencia ?? docente?.experienceScore ?? docente?.workExperienceScore);
      }
      if (normalizedCategory.includes('producción') || normalizedCategory.includes('produccion')) {
        return normalizeNumber(docente?.puntajeProduccion ?? docente?.productionScore ?? docente?.intellectualProductionScore);
      }
      if (normalizedCategory.includes('premio') || normalizedCategory.includes('reconocimiento')) {
        return normalizeNumber(docente?.puntajePremios ?? docente?.recognitionScore ?? docente?.awardsScore);
      }
      return 0;
    };

    const promediosCategorias = computed(() =>
      averageByCategory.value.map((item) => ({
        categoria: item.categoryName,
        promedio: normalizeNumber(item.averageScore),
      }))
    );

    const radarData = computed(() => {
      if (!selectedDocente.value) return [];

      return promediosCategorias.value.map((item) => ({
        categoria: item.categoria,
        valor: getCategoryScore(selectedDocente.value, item.categoria),
        promedio: Number(item.promedio.toFixed(1)),
      }));
    });

    const distributionChartOptions = computed(() => ({
      chart: {
        toolbar: { show: false },
      },
      colors: scoreDistribution.value.map((item) => item.color),
      xaxis: {
        categories: scoreDistribution.value.map((item) => `${item.range} ${item.classificationName}`),
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: false,
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '45%',
          distributed: true,
        },
      },
      legend: {
        show: false,
      },
    }));

    const distributionChartSeries = computed(() => [
      {
        name: 'Docentes',
        data: scoreDistribution.value.map((item) => normalizeNumber(item.count)),
      },
    ]);

    const categoryChartOptions = computed(() => ({
      chart: {
        toolbar: { show: false },
      },
      colors: ['#3b82f6'],
      xaxis: {
        categories: averageByCategory.value.map((item) => item.categoryName),
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: false,
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '45%',
        },
      },
      legend: {
        show: false,
      },
    }));

    const categoryChartSeries = computed(() => [
      {
        name: 'Promedio',
        data: averageByCategory.value.map((item) => normalizeNumber(item.averageScore)),
      },
    ]);

    const radarChartOptions = computed(() => ({
      chart: {
        toolbar: { show: false },
      },
      xaxis: {
        categories: radarData.value.map((i) => i.categoria),
      },
      yaxis: {
        show: false,
      },
      dataLabels: {
        enabled: true,
      },
      stroke: {
        width: 2,
      },
      fill: {
        opacity: 0.25,
      },
      legend: {
        position: 'bottom',
      },
    }));

    const radarChartSeries = computed(() => {
      if (!selectedDocente.value) return [];

      return [
        {
          name: 'Docente',
          data: radarData.value.map((i) => i.valor),
        },
        {
          name: 'Promedio Institucional',
          data: radarData.value.map((i) => i.promedio),
        },
      ];
    });

    const getInitials = (name: string) => {
      const names = name.split(' ');
      return names.length >= 2 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2).toUpperCase();
    };

    const getNivelVariant = (nivel: string) => {
      const normalizedNivel = String(nivel || '').toLowerCase();
      if (normalizedNivel.includes('sobresaliente') || normalizedNivel.includes('excelente') || normalizedNivel.includes('alto')) return 'success';
      if (normalizedNivel.includes('bueno') || normalizedNivel.includes('medio')) return 'primary';
      if (normalizedNivel.includes('regular')) return 'warning';
      if (normalizedNivel.includes('bajo') || normalizedNivel.includes('básico') || normalizedNivel.includes('basico')) return 'danger';
      return 'secondary';
    };

    const getScorePercentage = (docente: any) => {
      const maxScore = getMaxScore(docente);
      if (!maxScore) return 0;
      return Math.min((getTotalScore(docente) / maxScore) * 100, 100);
    };

    const handleVerDetalle = (docente: any) => {
      selectedDocente.value = docente;
      sheetOpen.value = true;
    };

    const recalculateRanking = async () => {
      if (!selectedEvaluationModelId.value) return;

      try {
        isRecalculating.value = true;
        await recalculateTeacherRankingService.run({
          evaluationModelId: selectedEvaluationModelId.value,
        });
        await refreshRankingData();
      } catch (error) {
        console.log('error', error);
      } finally {
        isRecalculating.value = false;
      }
    };

    const exportResults = async () => {
      if (!docentes.value.length) return;

      try {
        isExporting.value = true;
        await exportTeacherRankingService.download(
          {
            evaluationModelId: selectedEvaluationModelId.value || undefined,
          },
          `ranking-docente-${selectedEvaluationModelId.value || 'modelo'}.csv`
        );
      } catch (error) {
        console.log('error', error);
      } finally {
        isExporting.value = false;
      }
    };

    watch(selectedEvaluationModelId, async (newModelId, previousModelId) => {
      if (newModelId === previousModelId || loading.value) return;

      await refreshRankingData();
    });

    onMounted(async () => {
      try {
        checkStore.isCheckData.dataTable = { data: [] };
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Configuración General', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };

        await loadEvaluationModels();
        await Promise.all([loadSummary(), loadCharts()]);
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    return {
      title,
      loading,
      isRecalculating,
      isExporting,
      selectedEvaluationModelId,
      selectedEvaluationModel,
      evaluationModelOptions,
      getTeacherRankingService,
      rankingTableParams,
      sheetOpen,
      selectedDocente,
      docentes,
      summaryCards,
      totalDocentes,
      puntajePromedio,
      puntajeMaximo,
      puntajeMinimo,
      ultimoCalculo,
      promediosCategorias,
      radarData,
      distributionChartOptions,
      distributionChartSeries,
      categoryChartOptions,
      categoryChartSeries,
      radarChartOptions,
      radarChartSeries,
      getInitials,
      getTeacherName,
      getProgramName,
      getPhotoUrl,
      getTotalScore,
      getMaxScore,
      getRankingPosition,
      getClassificationName,
      getCategoryScore,
      getNivelVariant,
      getScorePercentage,
      handleVerDetalle,
      recalculateRanking,
      exportResults,
    };
  },
});
</script>

<style scoped>
.rankingPage {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sectionHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.contentIconTitle {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sectionHead__icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.14), rgba(var(--color-primary-rgb), 0.05));
  color: var(--color-primary);
}

.sectionHead__title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-dark, #1f2937);
}

.sectionHead__subtitle {
  margin: 0.25rem 0 0 0;
  color: var(--color-gray-600, #6b7280);
  font-size: 0.95rem;
}

.modelFilter {
  min-width: 320px;
  max-width: 420px;
}

.rankingPage__topFilter {
  display: block;
  width: 100%;
}

.rankingPage__topFilter :deep(.v-select) {
  width: 100%;
}

.rankingPage__topFilter :deep(.vs__dropdown-toggle) {
  width: 100%;
}

.rankingPage__topFilter :deep(.vs__selected-options) {
  min-width: 0;
  flex-wrap: nowrap;
  overflow: hidden;
}

.rankingPage__topFilter :deep(.vs__selected) {
  display: block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.rankingPage__topFilter :deep(.vs__search) {
  min-width: 0;
  flex: 1 1 auto;
}

.rankingPage__topFilter :deep(.vs__dropdown-menu) {
  min-width: 100%;
}

.rankingPage__topFilter--model :deep(.vs__dropdown-menu) {
  min-width: 340px;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.statValue {
  font-size: 1.9rem;
  font-weight: 800;
  color: var(--color-primary);
}

.statHint {
  margin-top: 0.3rem;
  color: var(--color-gray-600, #6b7280);
  font-size: 0.85rem;
}

.chartsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.filtersRow {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filterItem {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-weight: 600;
}

.filterLabel {
  font-size: 14px;
}

.filterSelect {
  min-width: 220px;
}

.positionCell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.positionNumber {
  font-size: 22px;
  font-weight: 800;
  color: #344054;
}

.medalIcon {
  color: #f59e0b;
}

.teacherCell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.teacherAvatar {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  overflow: hidden;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #344054;
  font-weight: 700;
  flex-shrink: 0;
}

.teacherAvatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.teacherName {
  font-weight: 700;
  color: #111827;
}

.teacherMeta {
  font-size: 12px;
  color: #6b7280;
}

.scoreCell {
  min-width: 200px;
}

.scoreCell__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.totalScore {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-primary);
}

.scoreMax {
  font-size: 12px;
  color: #98a2b3;
}

.progressBar {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
}

.progressBar__fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--color-primary), #3b82f6);
}

.drawerHead__title {
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 900;
}

.drawerHead__subtitle {
  margin: 4px 0 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
}

.drawerBody {
  padding: 16px;
}

.drawerFooterActions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.mbCard {
  margin-bottom: 16px;
}

.detailTeacher {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.detailTeacher__avatar {
  width: 96px;
  height: 96px;
  border-radius: 999px;
  overflow: hidden;
  background: #dbeafe;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
  flex-shrink: 0;
}

.detailTeacher__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detailTeacher__name {
  margin: 0 0 6px 0;
  font-size: 22px;
  font-weight: 800;
  color: #111827;
}

.detailTeacher__meta {
  margin: 0 0 16px 0;
  color: #6b7280;
}

.detailTeacher__stats {
  display: flex;
  align-items: center;
  gap: 18px;
}

.miniLabel {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.bigValue {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-primary);
}

.divider {
  width: 1px;
  height: 48px;
  background: #d0d5dd;
}

.scoreBreakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scoreBreakdown__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #344054;
}

.compareCard__content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.compareCard__title {
  margin: 0;
  color: #111827;
  font-weight: 700;
}

.compareRow {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #344054;
}

.compareRow--border {
  padding-top: 12px;
  border-top: 1px solid #d1fae5;
}

.comparePrimary {
  color: var(--color-primary);
}

.comparePositive {
  color: #16a34a;
}

.compareNegative {
  color: #dc2626;
}

:deep(.form-control) {
  width: 100%;
  min-height: 44px;
}

.btnPrimary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btnSecondary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

@media (max-width: 992px) {
  .statsGrid,
  .chartsGrid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sectionHead__title {
    font-size: 1.45rem;
  }

  .detailTeacher {
    flex-direction: column;
  }

  .detailTeacher__stats {
    flex-direction: column;
    align-items: flex-start;
  }

  .divider {
    display: none;
  }

  .drawerFooterActions {
    flex-direction: column;
  }

  .filtersRow {
    align-items: stretch;
  }

  .filterSelect,
  .modelFilter {
    min-width: 100%;
  }
}
</style>
