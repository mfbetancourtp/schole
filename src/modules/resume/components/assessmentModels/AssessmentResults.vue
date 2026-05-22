<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButtonBack :to="{ name: 'resume.assessmentModels' }" label="Volver" />

      <AppButton style="color: white" type="button" class="btnPrimary" :disabled="isExporting || !resultados.length" @click="exportResults">
        <AppIcon icon="file-download" />
        {{ isExporting ? 'Exportando...' : 'Exportar Resultados' }}
      </AppButton>

      <AppButton type="button" class="btnSecondary" :disabled="isRecalculating || !currentEvaluationModelId" @click="recalculateRanking">
        <AppIcon icon="calculator" />
        Recalcular Ranking
      </AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="resultsPage">
        <!-- Header -->
        <div class="sectionHead">
          <div class="contentIconTitle">
            <div class="sectionHead__icon">
              <AppIcon icon="chart-bar" />
            </div>
            <div>
              <h2 class="sectionHead__title">Resultados de Evaluación Docente</h2>
              <p class="sectionHead__subtitle">Visualización del puntaje calculado según criterios configurados.</p>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="statsGrid">
          <AppStatCard
            v-for="statCard in statCards"
            :key="statCard.label"
            :label="statCard.label"
            :value="statCard.value"
            :caption="statCard.caption"
            :icon="statCard.icon"
            :variant="statCard.variant"
            :value-size="statCard.valueSize"
          />
        </div>

        <!-- Table -->
        <AppDatatable
          name="assessment-results"
          :service="getTeacherRankingService"
          :params="rankingTableParams"
          :default-per-page="10"
          :enable-search-filter="true"
          default-sort-direction="desc"
          table-title="Ranking de docentes evaluados"
        >
          <template #additionalContent>
            <div class="tableIntro">
              <p class="tableIntro__text">Consulta, ordena y revisa el detalle de los docentes evaluados según el modelo seleccionado.</p>
            </div>
          </template>

          <AppDatatableColumn field="position" label="Posición" sortable>
            <template v-slot="props">
              <div class="positionCell">
                <span class="positionNumber">#{{ getRankingPosition(props.row) }}</span>
                <AppIcon v-if="getRankingPosition(props.row) <= 3" icon="award" class="medalIcon" />
              </div>
            </template>
          </AppDatatableColumn>

          <AppDatatableColumn field="people.names" label="Docente" sortable>
            <template v-slot="props">
              <div class="teacherCell">
                <div class="teacherAvatar">
                  <img v-if="getPhotoUrl(props.row)" :src="getPhotoUrl(props.row)" :alt="getTeacherName(props.row)" />
                  <span v-else>{{ getInitials(getTeacherName(props.row)) }}</span>
                </div>

                <div>
                  <div class="teacherName">{{ getTeacherName(props.row) }}</div>
                  <!-- <div class="teacherMeta">{{ props.row.facultad }} • {{ props.row.programa }}</div> -->
                </div>
              </div>
            </template>
          </AppDatatableColumn>

          <AppDatatableColumn field="totalScore" label="Puntaje Total" sortable numeric>
            <template v-slot="props">
              <span class="totalScore">{{ getTotalScore(props.row) }}</span>
            </template>
          </AppDatatableColumn>

          <AppDatatableColumn field="classificationName" label="Nivel" sortable>
            <template v-slot="props">
              <AppBadge :label="getClassificationName(props.row)" :variant="getLevelVariant(getTotalScore(props.row))" />
            </template>
          </AppDatatableColumn>

          <AppDatatableColumn field="excludedSupports" label="Estado Soportes" sortable>
            <template v-slot="props">
              <div class="supportStatus">
                <AppIcon :icon="isSupportComplete(props.row) ? 'check-circle' : 'exclamation-triangle'" :class="isSupportComplete(props.row) ? 'iconOk' : 'iconWarn'" />
                <span v-if="isSupportComplete(props.row)"> {{ getApprovedSupports(props.row) }} aprobados </span>
                <span v-else> {{ getExcludedSupports(props.row) }} excluidos </span>
              </div>
            </template>
          </AppDatatableColumn>

          <AppDatatableColumn label="Acción">
            <template v-slot="props">
              <AppButton v-tooltip="'Ver'" icon="eye" type="button" outlined @click="openDetail(props.row)"> </AppButton>
            </template>
          </AppDatatableColumn>
        </AppDatatable>

        <!-- Drawer detalle -->
        <AppDrawer :isVisible="drawerOpen" size="lg" @update:isVisible="drawerOpen = $event">
          <template #head>
            <div class="drawerHead">
              <div>
                <h2 class="drawerHead__title">Detalle de Evaluación</h2>
                <p class="drawerHead__subtitle">Información detallada de la evaluación del docente</p>
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
                        {{ selectedDocente.facultad }} •
                        {{ selectedDocente.programa }}
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

              <!-- Validación -->
              <AppCard class="mbCard">
                <template #title>Estado de Validación</template>
                <template #body>
                  <div class="validationList">
                    <div class="validationItem">
                      <div class="validationItem__left">
                        <AppIcon icon="check-circle" class="iconOk" />
                        <span>Registros aprobados considerados</span>
                      </div>
                      <AppBadge :label="String(getApprovedSupports(selectedDocente))" variant="success" />
                    </div>

                    <div v-if="getExcludedSupports(selectedDocente) > 0" class="validationItem">
                      <div class="validationItem__left">
                        <AppIcon icon="exclamation-triangle" class="iconWarn" />
                        <span>Registros excluidos por no estar aprobados</span>
                      </div>
                      <AppBadge :label="String(getExcludedSupports(selectedDocente))" variant="warning" />
                    </div>
                  </div>
                </template>
              </AppCard>

              <!-- Desglose -->
              <div class="detailCategories">
                <AppCard v-for="(categoria, index) in detallesCategoria" :key="index" class="mbCard">
                  <template #title>
                    <div class="categoryCardTitle">
                      <span>{{ categoria.categoria }}</span>
                      <AppBadge :label="`${categoria.subtotal} puntos`" variant="primary" />
                    </div>
                  </template>

                  <template #body>
                    <div class="criterionList">
                      <div v-for="(criterio, idx) in categoria.criterios" :key="idx" class="criterionRow">
                        <div class="criterionRow__left">
                          <div class="criterionRow__name">
                            {{ criterio.nombre }}
                          </div>
                          <div class="criterionRow__meta">
                            <span v-if="criterio.cantidad"> {{ criterio.cantidad }} registros </span>
                            <span v-if="criterio.tiempo"> {{ criterio.tiempo }} acumulados </span>
                          </div>
                        </div>

                        <div class="criterionRow__right">
                          {{ criterio.puntaje }}
                        </div>
                      </div>
                    </div>
                  </template>
                </AppCard>
              </div>

              <!-- Total -->
              <AppCard class="totalCard" :color="'var(--color-primary)'">
                <template #body>
                  <div class="totalCard__content">
                    <div>
                      <p class="totalCard__label">TOTAL GENERAL</p>
                      <p class="totalCard__value">
                        {{ getTotalScore(selectedDocente) }}
                      </p>
                    </div>
                    <AppIcon icon="trophy" class="totalCard__icon" />
                  </div>
                </template>
              </AppCard>
            </div>
          </template>

          <template #footer>
            <div class="drawerFooterActions">
              <AppButton type="button" class="btnSecondary" @click="drawerOpen = false"> Cerrar </AppButton>
            </div>
          </template>
        </AppDrawer>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';

import AppBaseList from '../../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../../shared/components/AppLoading.vue';
import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../../shared/components/Buttons/AppButtonBack.vue';
import AppIcon from '../../../../shared/components/AppIcon.vue';
import AppCard from '../../../../shared/components/Card/AppCard.vue';
import AppStatCard from '../../../../shared/components/Card/AppStatCard.vue';
import AppDrawer from '../../../../shared/components/AppDrawer.vue';
import AppBadge from '../../../../shared/components/AppBadge.vue';

import { useHeaderStore } from '../../../../stores/header.store';
import { useCheckDataTableStore } from '../../../../stores/checkDataTable.store';
import { UpdateDatatableService } from '../../../../shared/services/updateDatatable.service';
import AppDatatable from '../../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../../shared/components/Datatable/AppDatatableColumn.vue';
import { GetTeacherRankingService } from '../../services/getTeacherRanking.service';
import { GetTeacherRankingSummaryService } from '../../services/getTeacherRankingSummary.service';
import { RecalculateTeacherRankingService } from '../../services/recalculateTeacherRanking.service';
import { ExportTeacherRankingService } from '../../services/exportTeacherRanking.service';

const getTeacherRankingService = new GetTeacherRankingService();
const getTeacherRankingSummaryService = new GetTeacherRankingSummaryService();
const recalculateTeacherRankingService = new RecalculateTeacherRankingService();
const exportTeacherRankingService = new ExportTeacherRankingService();
const updateDatatableService = new UpdateDatatableService();

interface DetalleCategoriaDto {
  categoria: string;
  criterios: {
    nombre: string;
    cantidad?: number;
    tiempo?: string;
    puntaje: number;
    validado: boolean;
  }[];
  subtotal: number;
}

interface TeacherRankingSummaryDto {
  totalTeachers: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  lastCalculatedAt?: string;
}

export default defineComponent({
  name: 'AssessmentResultsPage',
  components: {
    AppBaseList,
    AppLoading,
    AppButton,
    AppButtonBack,
    AppIcon,
    AppCard,
    AppStatCard,
    AppDrawer,
    AppBadge,
    AppDatatable,
    AppDatatableColumn,
  },
  setup() {
    const title = 'Resultados de Evaluación';
    useMeta({ title });

    const route = useRoute();
    const checkStore = useCheckDataTableStore();
    const loading = ref(true);
    const isRecalculating = ref(false);
    const isExporting = ref(false);
    const drawerOpen = ref(false);
    const selectedDocente = ref<any | null>(null);

    const currentEvaluationModelId = computed(() => {
      const evaluationModelId = Number(route.query.modelId);
      return Number.isFinite(evaluationModelId) && evaluationModelId > 0 ? evaluationModelId : null;
    });
    const rankingTableParams = computed(() => ({
      evaluationModelId: currentEvaluationModelId.value || undefined,
    }));

    const resultados = computed<any[]>(() => {
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

    const totalDocentes = computed(() => rankingSummary.value.totalTeachers);
    const puntajePromedio = computed(() => rankingSummary.value.averageScore.toFixed(1));
    const puntajeMaximo = computed(() => rankingSummary.value.highestScore);
    const puntajeMinimo = computed(() => rankingSummary.value.lowestScore);
    const fechaCalculo = computed(() => {
      const lastDate = rankingSummary.value.lastCalculatedAt;
      return lastDate && dayjs(lastDate).isValid() ? dayjs(lastDate).format('DD/MMM/YYYY') : '-';
    });

    const statCards = computed(() => [
      {
        label: 'Total Docentes Evaluados',
        value: totalDocentes.value,
        icon: 'users',
        variant: 'green',
      },
      {
        label: 'Puntaje Promedio',
        value: puntajePromedio.value,
        icon: 'chart-line',
        variant: 'blue',
      },
      {
        label: 'Puntaje Más Alto',
        value: puntajeMaximo.value,
        icon: 'trophy',
        variant: 'yellow',
      },

      {
        label: 'Fecha Último Cálculo',
        value: fechaCalculo.value,
        icon: 'calendar',
        variant: 'gray',
        valueSize: 'xs',
      },
    ]);

    const normalizeNumber = (value: any) => Number(value ?? 0);

    const getTeacherName = (item: any) => {
      const people = item?.people || item?.teacher || item?.docente || item?.person || item?.user || {};
      const lastnames = people.lastnames || people.lastNames || people.surnames || '';
      const name = item?.docente || item?.nombre || item?.teacherName || item?.fullName || item?.peopleName || people.fullName || people.name || `${people.names || ''} ${lastnames}`.trim();
      return name || 'Docente';
    };

    const getPhotoUrl = (item: any) => item?.fotoUrl || item?.photoUrl || item?.avatar || item?.professionalProfile?.photoUrl || item?.people?.photoUrl || item?.people?.avatar;

    const getTotalScore = (item: any) => normalizeNumber(item?.puntajeTotal ?? item?.totalScore ?? item?.score ?? item?.total);

    const getRankingPosition = (item: any) => normalizeNumber(item?.posicion ?? item?.position ?? item?.rank ?? 0);

    const getClassificationName = (item: any) => item?.nivel || item?.classificationName || item?.classification?.name || getLevel(getTotalScore(item));

    const getApprovedSupports = (item: any) => normalizeNumber(item?.registrosAprobados ?? item?.approvedSupports ?? item?.approvedRecords ?? item?.approvedCount);

    const getExcludedSupports = (item: any) => normalizeNumber(item?.registrosExcluidos ?? item?.excludedSupports ?? item?.excludedRecords ?? item?.excludedCount);

    const isSupportComplete = (item: any) => getExcludedSupports(item) === 0;

    const getCategoryScore = (item: any, categoryName: string) => {
      const normalizedCategory = categoryName.toLowerCase();
      if (normalizedCategory.includes('formación') || normalizedCategory.includes('academ')) {
        return normalizeNumber(item?.puntajeFormacion ?? item?.educationScore ?? item?.academicTrainingScore);
      }
      if (normalizedCategory.includes('experiencia')) {
        return normalizeNumber(item?.puntajeExperiencia ?? item?.experienceScore ?? item?.workExperienceScore);
      }
      if (normalizedCategory.includes('producción') || normalizedCategory.includes('produccion')) {
        return normalizeNumber(item?.puntajeProduccion ?? item?.productionScore ?? item?.intellectualProductionScore);
      }
      if (normalizedCategory.includes('premio') || normalizedCategory.includes('reconocimiento')) {
        return normalizeNumber(item?.puntajePremios ?? item?.recognitionScore ?? item?.awardsScore);
      }
      return 0;
    };

    const normalizeDetailCategories = (item: any): DetalleCategoriaDto[] => {
      const details = item?.detallesCategoria || item?.details || item?.detalles || item?.categories || item?.categorias || item?.breakdown || item?.desglose || [];

      if (!Array.isArray(details)) return [];

      return details.map((detail: any) => ({
        categoria: detail.category || detail.categoria || detail.profileSection?.name || detail.profileSectionName || 'Sin categoría',
        subtotal: normalizeNumber(detail.subtotal ?? detail.score ?? detail.puntaje ?? detail.total),
        criterios: (detail.criteria || detail.criterios || detail.items || []).map((criterion: any) => ({
          nombre: criterion.name || criterion.nombre || criterion.criterionName || 'Criterio',
          cantidad: criterion.quantity ?? criterion.cantidad,
          tiempo: criterion.time ?? criterion.tiempo,
          puntaje: normalizeNumber(criterion.score ?? criterion.puntaje ?? criterion.assignedScore),
          validado: Boolean(criterion.validated ?? criterion.validado ?? true),
        })),
      }));
    };

    const detallesCategoria = computed<DetalleCategoriaDto[]>(() => {
      if (!selectedDocente.value) return [];
      const details = normalizeDetailCategories(selectedDocente.value);
      if (details.length) return details;

      return [
        {
          categoria: 'Formación Académica',
          criterios: [
            {
              nombre: 'Doctorado',
              cantidad: 1,
              puntaje: 30,
              validado: true,
            },
          ],
          subtotal: getCategoryScore(selectedDocente.value, 'Formación Académica'),
        },
        {
          categoria: 'Experiencia Laboral',
          criterios: [
            {
              nombre: 'Experiencia docente',
              tiempo: '8 años',
              puntaje: getCategoryScore(selectedDocente.value, 'Experiencia Laboral'),
              validado: true,
            },
          ],
          subtotal: getCategoryScore(selectedDocente.value, 'Experiencia Laboral'),
        },
        {
          categoria: 'Producción Intelectual',
          criterios: [
            {
              nombre: 'Artículos indexados',
              cantidad: 7,
              puntaje: getCategoryScore(selectedDocente.value, 'Producción Intelectual'),
              validado: true,
            },
          ],
          subtotal: getCategoryScore(selectedDocente.value, 'Producción Intelectual'),
        },
        {
          categoria: 'Premios y Reconocimientos',
          criterios: [
            {
              nombre: 'Premio académico',
              cantidad: 1,
              puntaje: getCategoryScore(selectedDocente.value, 'Premios y Reconocimientos'),
              validado: true,
            },
          ],
          subtotal: getCategoryScore(selectedDocente.value, 'Premios y Reconocimientos'),
        },
      ];
    });

    const loadSummary = async () => {
      const response = await getTeacherRankingSummaryService.run({
        evaluationModelId: currentEvaluationModelId.value || undefined,
      });

      rankingSummary.value = {
        totalTeachers: normalizeNumber(response?.totalTeachers),
        averageScore: normalizeNumber(response?.averageScore),
        highestScore: normalizeNumber(response?.highestScore),
        lowestScore: normalizeNumber(response?.lowestScore),
        lastCalculatedAt: response?.lastCalculatedAt,
      };
    };

    const recalculateRanking = async () => {
      try {
        isRecalculating.value = true;
        await recalculateTeacherRankingService.run({
          evaluationModelId: currentEvaluationModelId.value,
        });
        await loadSummary();
        updateDatatableService.run();
      } catch (error) {
        console.log('error', error);
      } finally {
        isRecalculating.value = false;
      }
    };

    const exportResults = async () => {
      if (!resultados.value.length) return;

      try {
        isExporting.value = true;
        await exportTeacherRankingService.download(
          {
            evaluationModelId: currentEvaluationModelId.value || undefined,
          },
          `resultados-evaluacion-${currentEvaluationModelId.value || 'modelo'}.csv`
        );
      } catch (error) {
        console.log('error', error);
      } finally {
        isExporting.value = false;
      }
    };

    const getInitials = (name: string) => {
      const names = name.split(' ');
      return names.length >= 2 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2).toUpperCase();
    };

    const getLevel = (score: number) => {
      if (score >= 85) return 'Excelente';
      if (score >= 70) return 'Sobresaliente';
      return 'Bueno';
    };

    const getLevelVariant = (score: number) => {
      if (score >= 85) return 'success';
      if (score >= 70) return 'primary';
      return 'warning';
    };

    const openDetail = (item: any) => {
      selectedDocente.value = item;
      drawerOpen.value = true;
    };

    onMounted(async () => {
      try {
        checkStore.isCheckData.dataTable = { data: [] };
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Configuración General', url: '' };
        headerStorage.moduleItem = {
          name: 'Modelos de Evaluación',
          url: 'assessmentModels',
        };
        headerStorage.moduleSubItem = {
          name: title,
          url: '',
        };
        await loadSummary();
      } catch (e) {
        console.log('error', e);
        checkStore.isCheckData.dataTable = { data: [] };
      } finally {
        loading.value = false;
      }
    });

    return {
      title,
      loading,
      isRecalculating,
      isExporting,
      currentEvaluationModelId,
      drawerOpen,
      selectedDocente,
      statCards,
      getTeacherRankingService,
      rankingTableParams,
      totalDocentes,
      puntajePromedio,
      puntajeMaximo,
      puntajeMinimo,
      fechaCalculo,
      detallesCategoria,
      exportResults,
      recalculateRanking,
      getInitials,
      getTeacherName,
      getPhotoUrl,
      getTotalScore,
      getRankingPosition,
      getClassificationName,
      getApprovedSupports,
      getExcludedSupports,
      isSupportComplete,
      getLevel,
      getLevelVariant,
      openDetail,
      resultados,
    };
  },
});
</script>

<style scoped>
.resultsPage {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sectionHead {
  display: flex;
  align-items: center;
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

.sectionHead__subtitle--model strong {
  color: var(--color-primary);
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

.statValue--sm {
  font-size: 1rem;
}

.statHint {
  margin-top: 0.3rem;
  color: var(--color-gray-600, #6b7280);
  font-size: 0.85rem;
}

.searchBox {
  position: relative;
}

.searchBox__icon {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: #98a2b3;
}

.searchBox__input {
  padding-left: 40px;
}

.tableWrap {
  width: 100%;
  overflow-x: auto;
}

.resultsTable {
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
}

.resultsTable thead th {
  text-align: left;
  padding: 14px 16px;
  background: #f9fafb;
  color: #475467;
  font-size: 13px;
  font-weight: 700;
  border-bottom: 1px solid #eaecf0;
}

.resultsTable tbody td {
  padding: 16px;
  border-bottom: 1px solid #f2f4f7;
  vertical-align: middle;
}

.resultsTable tbody tr:hover {
  background: #fafcff;
}

.topRank {
  background: rgba(var(--color-primary-rgb), 0.03);
}

.positionCell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.positionNumber {
  font-size: 18px;
  font-weight: 700;
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

.totalScore {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-primary);
}

.supportStatus {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #4b5563;
}

.iconOk {
  color: #16a34a;
}

.iconWarn {
  color: #d97706;
}

.emptyTable {
  text-align: center;
  padding: 30px 0;
  color: #6b7280;
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

.detailTeacher__info {
  flex: 1;
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

.validationList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.validationItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.validationItem__left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #344054;
  font-size: 14px;
}

.categoryCardTitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.criterionList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.criterionRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f2f4f7;
}

.criterionRow:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.criterionRow__name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.criterionRow__meta {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.criterionRow__right {
  font-weight: 800;
  color: var(--color-primary);
}

.totalCard__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.totalCard__label {
  margin: 0 0 8px 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 13px;
}

.totalCard__value {
  margin: 0;
  font-size: 40px;
  font-weight: 800;
  color: white;
}

.totalCard__icon {
  font-size: 38px;
  color: rgba(255, 255, 255, 0.75);
}

.btnPrimary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btnSecondary {
  padding: 10px 14px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

:deep(.form-control) {
  width: 100%;
  min-height: 44px;
}

@media (max-width: 992px) {
  .statsGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .statsGrid {
    grid-template-columns: 1fr;
  }

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
}
</style>
