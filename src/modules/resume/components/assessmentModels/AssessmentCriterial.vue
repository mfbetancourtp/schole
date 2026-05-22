<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButtonBack :to="{ name: 'resume.assessmentModels' }" label="Volver" />

      <AppButton style="color: white" type="button" class="btnPrimary" @click="openCreate">
        <AppIcon icon="plus" />
        Agregar Criterio
      </AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="criteriaPage">
        <!-- Header -->
        <div class="sectionHead">
          <div class="contentIconTitle">
            <div class="sectionHead__icon">
              <AppIcon icon="tasks" />
            </div>
            <div>
              <h2 class="sectionHead__title">Configuración de Criterios</h2>
              <p class="sectionHead__subtitle">Administre los criterios utilizados para calcular el puntaje y ranking docente.</p>
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

        <!-- Search -->
        <AppCard>
          <template #body>
            <div class="filtersWrap">
              <div class="searchBox">
                <AppIcon icon="search" class="searchBox__icon" />
                <AppInput v-model="searchQuery" type="search" class="searchBox__input" placeholder="Buscar criterio por nombre o categoría..." />
              </div>

              <div class="chipsWrap">
                <button type="button" class="chip" :class="{ 'chip--active': selectedProfileSectionId === null }" @click="handleProfileSectionFilter(null)">Todos ({{ totalCriteriaCount }})</button>

                <button
                  v-for="profileSection in profileSections"
                  :key="profileSection.id"
                  type="button"
                  class="chip"
                  :class="{
                    'chip--active': selectedProfileSectionId === profileSection.id,
                  }"
                  @click="handleProfileSectionFilter(profileSection.id)"
                >
                  {{ profileSection.name }} ({{ countByProfileSection(profileSection.id) }})
                </button>
              </div>
            </div>
          </template>
        </AppCard>

        <!-- Empty -->
        <AppCard v-if="!filteredCriterios.length">
          <template #body>
            <div class="emptyState">
              <AppIcon icon="file-medical" class="emptyState__icon" />
              <h3 class="emptyState__title">No hay criterios configurados</h3>
              <p class="emptyState__text">No se encontraron criterios con los filtros actuales.</p>

              <AppButton type="button" class="btnPrimary" @click="openCreate">
                <AppIcon icon="plus" />
                Agregar Primer Criterio
              </AppButton>
            </div>
          </template>
        </AppCard>

        <!-- Grouped cards -->
        <div v-else class="categoriesWrap">
          <div v-for="(items, categoria) in groupedCriterios" :key="categoria" class="categoryBlock">
            <div class="categoryTitle">
              <div class="categoryTitle__bar"></div>
              <h3>{{ categoria }}</h3>
              <span>({{ items.length }} criterios)</span>
            </div>

            <div class="grid-cards">
              <AppCard v-for="item in items" :key="item.id">
                <template #title>
                  <div class="cardTitleRow">
                    <div>
                      <h4 class="criterionTitle">{{ item.nombre }}</h4>
                      <div class="badgesRow">
                        <AppBadge :label="item.categoria" variant="primary" />
                        <AppBadge :label="item.tipoCalculo === 'registro' ? 'Puntaje por registro' : 'Escala por tiempo'" variant="ghost" />
                      </div>
                    </div>

                    <!-- <div class="titleActions">
                      <AppButtonEdit @click="editCriterion(item)" />
                      <AppButton
                        outlined
                        :icon="item.activo ? 'ban' : 'check'"
                        :class="
                          item.activo
                            ? 'btnAction--danger'
                            : 'btnAction--success'
                        "
                        @click="toggleStatus(item.id)"
                      />
                    </div> -->
                  </div>
                </template>

                <template #body>
                  <div class="criterionBody">
                    <div class="summaryBox">
                      <template v-if="item.tipoCalculo === 'registro'">
                        <p v-if="item.hasScoreRecord">
                          <strong>{{ item.puntajePorRegistro }}</strong>
                          puntos por registro
                        </p>
                        <p v-if="item.topeMaximo">
                          Tope máximo:
                          <strong>{{ item.topeMaximo }}</strong>
                        </p>
                        <p v-if="!item.hasScoreRecord" class="summaryBox__empty">No hay puntaje por registro</p>
                      </template>

                      <template v-else>
                        <p class="summaryBox__title">Escalas configuradas:</p>
                        <p v-if="!item.rangosEscala?.length" class="summaryBox__empty">No hay escalas configuradas</p>
                        <div v-for="(rango, index) in item.rangosEscala" :key="index" class="rangeRow">
                          <span>{{ rango.desde }} - {{ rango.hasta }} años</span>
                          <strong>{{ rango.puntaje }} pts</strong>
                        </div>
                      </template>
                    </div>

                    <div class="validationRow">
                      <div class="validationInfo">
                        <AppIcon :icon="item.validarDocumentos ? 'check-circle' : 'ban'" :class="item.validarDocumentos ? 'iconOk' : 'iconMuted'" />
                        <span>
                          {{ item.validarDocumentos ? 'Solo registros aprobados' : 'Sin validación obligatoria' }}
                        </span>
                      </div>

                      <AppBadge :label="item.activo ? 'Activo' : 'Inactivo'" :variant="item.activo ? 'success' : 'secondary'" />
                    </div>
                  </div>
                </template>

                <template #footer>
                  <div class="footerActions">
                    <AppButton type="button" class="btnSecondary" @click="editCriterion(item)">
                      <AppIcon icon="pen" />
                      Editar
                    </AppButton>

                    <AppButton type="button" class="btnDanger" :disabled="pendingDeleteCriterionId === item.id" @click="deleteCriterion(item.id)">
                      <AppIcon icon="trash" />
                      Eliminar
                    </AppButton>
                  </div>
                </template>
              </AppCard>
            </div>
          </div>
        </div>

        <!-- Drawer -->
        <AppDrawer :isVisible="drawerOpen" size="lg" @update:isVisible="drawerOpen = $event">
          <template #head>
            <div class="drawerHead">
              <div>
                <h2 class="drawerHead__title">{{ drawerTitle }}</h2>
                <p class="drawerHead__subtitle">Seleccione categoría y configure la asignación de puntaje</p>
              </div>
            </div>
          </template>

          <template #body>
            <div class="drawerBody">
              <form @submit.prevent="drawerStep === 'base' ? continueCriterion() : saveCriterionConfiguration()">
                <div v-if="drawerStep === 'base'" class="formGrid">
                  <AppFormField :label="'Categoría'">
                    <AppAutocomplete
                      input-id="profileSectionsId"
                      v-model="form.profileSectionsId"
                      :options="profileSections"
                      placeholder="Seleccione una categoría"
                      @update:modelValue="handleCategoryChange"
                    />
                  </AppFormField>

                  <AppFormField v-if="selectedProfileSectionRequiresCriteriaType" :label="'Criterio'">
                    <AppAutocompleteRemote
                      :key="criterionTypesAutocompleteKey"
                      input-id="criterionTypeId"
                      :modelValue="form.criterionTypeId"
                      :service="getEvaluationCriteriaTypesService"
                      :paramsService="{
                        profileSectionsId: form.profileSectionsId,
                      }"
                      :init="form.criterionTypeId"
                      label="name"
                      :reduce="(item: any) => item.id"
                      @update:modelValue="handleCriterionTypeRemoteChange"
                      @loading-finished="applyPendingCriterionTypeId"
                    />
                  </AppFormField>

                  <div class="field--full">
                    <AppFormField :label="'Tipo de Cálculo'">
                      <div class="calcTypeGrid">
                        <button
                          type="button"
                          class="calcTypeCard"
                          :class="{
                            'calcTypeCard--active': form.calculationType === 'PER_RECORD',
                          }"
                          @click="form.calculationType = 'PER_RECORD'"
                        >
                          Puntaje por Registro
                        </button>

                        <button
                          type="button"
                          class="calcTypeCard"
                          :class="{
                            'calcTypeCard--active': form.calculationType === 'TIME_SCALE',
                          }"
                          @click="form.calculationType = 'TIME_SCALE'"
                        >
                          Puntaje por Escala de Tiempo
                        </button>
                      </div>
                    </AppFormField>
                  </div>

                  <div class="field--full">
                    <AppFormField :label="'Validación de Soportes'">
                      <div class="switchRow">
                        <label class="switchText"> Solo considerar registros con documentos aprobados </label>
                        <AppInput v-model="form.validation" type="checkbox" />
                      </div>
                    </AppFormField>
                  </div>

                  <div class="field--full">
                    <AppFormField :label="'Estado'">
                      <div class="switchRow">
                        <label class="switchText">
                          {{ form.status ? 'Activo' : 'Inactivo' }}
                        </label>
                        <AppInput v-model="form.status" type="checkbox" />
                      </div>
                    </AppFormField>
                  </div>
                </div>

                <div v-else class="formGrid">
                  <section class="field--full configurationSummary">
                    <strong>{{ selectedProfileSection?.name || 'Categoría seleccionada' }}</strong>
                    <span>{{ form.calculationType === 'PER_RECORD' ? 'Puntaje por registro' : 'Escala por tiempo' }}</span>
                  </section>

                  <template v-if="form.calculationType === 'PER_RECORD'">
                    <AppFormField :label="'Puntaje por registro'">
                      <AppInput v-model="form.scoreRecord" type="number" placeholder="0.00" />
                    </AppFormField>

                    <AppFormField :label="'Tope máximo (opcional)'">
                      <AppInput v-model="form.maxScore" type="number" placeholder="0.00" />
                    </AppFormField>
                  </template>

                  <template v-else>
                    <div class="field--full">
                      <AppFormField :label="'Configuración de Escala'">
                        <div class="rangesWrap">
                          <div v-for="range in form.rangosEscala" :key="range.id" class="rangeEditor">
                            <AppInput v-model="range.desde" type="number" placeholder="Desde" />
                            <AppInput v-model="range.hasta" type="number" placeholder="Hasta" />
                            <AppInput v-model="range.puntaje" type="number" placeholder="Puntaje" />
                            <AppButton type="button" outlined icon="trash" class="btnAction--danger" :disabled="pendingDeleteRangeId === range.id" @click="removeRange(range.id)" />
                          </div>

                          <AppButton type="button" outlined @click="addRange">
                            <AppIcon icon="plus" />
                            Agregar Rango
                          </AppButton>
                        </div>
                      </AppFormField>
                    </div>
                  </template>
                </div>
              </form>
            </div>
          </template>

          <template #footer>
            <div class="drawerFooterActions">
              <AppButton type="button" class="btnSecondary" @click="closeDrawer"> Cancelar </AppButton>

              <AppButton v-if="drawerStep === 'configuration'" type="button" class="btnSecondary" :disabled="isSavingConfiguration" @click="drawerStep = 'base'"> Volver </AppButton>

              <AppButton v-if="drawerStep === 'base'" type="button" class="btnPrimary" :disabled="isSavingCriterion" @click="continueCriterion">
                <AppIcon icon="arrow-right" />
                Continuar
              </AppButton>

              <AppButton v-else type="button" class="btnPrimary" :disabled="isSavingConfiguration" @click="saveCriterionConfiguration">
                <AppIcon icon="save" />
                Guardar configuración
              </AppButton>
            </div>
          </template>
        </AppDrawer>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';

import AppBaseList from '../../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../../shared/components/AppLoading.vue';
import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../../shared/components/Buttons/AppButtonBack.vue';
// import AppButtonEdit from '../../../../shared/components/Buttons/AppButtonEdit.vue';
import AppIcon from '../../../../shared/components/AppIcon.vue';
import AppCard from '../../../../shared/components/Card/AppCard.vue';
import AppStatCard from '../../../../shared/components/Card/AppStatCard.vue';
import AppBadge from '../../../../shared/components/AppBadge.vue';
import AppDrawer from '../../../../shared/components/AppDrawer.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../../shared/components/Forms/AppAutocomplete.vue';
import AppAutocompleteRemote from '../../../../shared/components/Forms/AppAutocompleteRemote.vue';
import AppInput from '../../../../shared/components/Forms/AppInput.vue';

import { useHeaderStore } from '../../../../stores/header.store';
import { GetEvaluationCriteriaService } from '../../services/getEvaluationCriteria.service';
import { GetProfileSectionsService } from '../../services/getProfileSections.service';
import { DeleteEvaluationCriteriaService } from '../../services/deleteEvaluationCriteria.service';
import { GetEvaluationCriteriaTypesService } from '../../services/getEvaluationCriteriaTypes.service';
import { CreateOrUpdateEvaluationCriteriaService, CreateOrUpdateEvaluationCriteriaPayload } from '../../services/createOrUpdateEvaluationCriteria.service';
import { CreateSectionScoreRecordService } from '../../services/createSectionScoreRecord.service';
import { CreateSectionTimeScaleRangeService } from '../../services/createSectionTimeScaleRange.service';
import { DeleteSectionTimeScaleRangeService } from '../../services/deleteSectionTimeScaleRange.service';

const getEvaluationCriteriaService = new GetEvaluationCriteriaService();
const getProfileSectionsService = new GetProfileSectionsService();
const deleteEvaluationCriteriaService = new DeleteEvaluationCriteriaService();
const getEvaluationCriteriaTypesService = new GetEvaluationCriteriaTypesService();
const createOrUpdateEvaluationCriteriaService = new CreateOrUpdateEvaluationCriteriaService();
const createSectionScoreRecordService = new CreateSectionScoreRecordService();
const createSectionTimeScaleRangeService = new CreateSectionTimeScaleRangeService();
const deleteSectionTimeScaleRangeService = new DeleteSectionTimeScaleRangeService();

type CalculationType = 'PER_RECORD' | 'TIME_SCALE';
type DrawerStep = 'base' | 'configuration';

interface CriterionRange {
  id: string | number;
  desde: number;
  hasta: number;
  puntaje: number;
}

interface CriterionDto {
  id: string | number;
  profileSectionId?: number;
  criterionTypeId?: number | null;
  nombre: string;
  categoria: string;
  tipoCalculo: 'registro' | 'escala';
  hasScoreRecord?: boolean;
  puntajePorRegistro?: number;
  topeMaximo?: number;
  rangosEscala?: CriterionRange[];
  validarDocumentos: boolean;
  activo: boolean;
  updatedAt?: string;
  evaluationModelId?: number;
  evaluationModelName?: string;
  evaluationModelVersion?: string;
}

interface CriterionForm {
  profileSectionsId: number | null;
  criterionTypeId: number | null;
  status: boolean;
  calculationType: CalculationType;
  scoreRecord: string;
  maxScore: string;
  rangosEscala: {
    id: string | number;
    desde: string;
    hasta: string;
    puntaje: string;
  }[];
  validation: boolean;
}

export default defineComponent({
  name: 'AssessmentCriteriaPage',
  components: {
    AppBaseList,
    AppLoading,
    AppButton,
    AppButtonBack,
    // AppButtonEdit,
    AppIcon,
    AppCard,
    AppStatCard,
    AppBadge,
    AppDrawer,
    AppFormField,
    AppAutocomplete,
    AppAutocompleteRemote,
    AppInput,
  },
  setup() {
    const title = 'Configuración de Criterios';
    useMeta({ title });

    const route = useRoute();
    const loading = ref(true);
    const drawerOpen = ref(false);
    const editingId = ref<string | number | null>(null);
    const pendingDeleteCriterionId = ref<string | number | null>(null);
    const pendingDeleteRangeId = ref<string | number | null>(null);
    const drawerStep = ref<DrawerStep>('base');
    const createdEvaluationCriteriaId = ref<number | null>(null);
    const hasExistingScoreRecord = ref(false);
    const pendingCriterionTypeId = ref<number | null>(null);
    const isSavingCriterion = ref(false);
    const isSavingConfiguration = ref(false);

    const criterios = ref<CriterionDto[]>([]);
    const profileSections = ref<any[]>([]);
    const selectedProfileSectionId = ref<number | null>(null);
    const criteriaCountByProfileSectionId = ref<Record<number, number>>({});
    const searchQuery = ref('');

    const form = reactive<CriterionForm>({
      profileSectionsId: null,
      criterionTypeId: null,
      status: true,
      calculationType: 'PER_RECORD',
      scoreRecord: '',
      maxScore: '',
      rangosEscala: [
        { id: 'local-1', desde: '0', hasta: '2', puntaje: '5' },
        { id: 'local-2', desde: '3', hasta: '5', puntaje: '10' },
        { id: 'local-3', desde: '6', hasta: '10', puntaje: '20' },
      ],
      validation: false,
    });

    const drawerTitle = computed(() => (editingId.value ? 'Editar Criterio de Evaluación' : 'Agregar Criterio de Evaluación'));
    const selectedProfileSection = computed(() => profileSections.value.find((profileSection) => Number(profileSection.id) === Number(form.profileSectionsId)) || null);
    const selectedProfileSectionRequiresCriteriaType = computed(() => ['EDUCATION_TYPE', 'PRODUCTION_TYPE'].includes(selectedProfileSection.value?.criterioType));
    const criterionTypesAutocompleteKey = computed(() => `criterion-types-${form.profileSectionsId || 'empty'}-${editingId.value || 'create'}`);

    const totalActivos = computed(() => criterios.value.filter((c) => c.activo).length);
    const totalInactivos = computed(() => criterios.value.filter((c) => !c.activo).length);

    const getCriterionWeight = (criterio: CriterionDto) => {
      if (criterio.tipoCalculo === 'registro') {
        return Number(criterio.topeMaximo ?? criterio.puntajePorRegistro ?? 0);
      }

      return Math.max(...(criterio.rangosEscala || []).map((rango) => Number(rango.puntaje || 0)), 0);
    };

    const categoriaConMasPeso = computed(() => {
      const weightsByCategory = criterios.value.reduce((acc: Record<string, number>, criterio) => {
        acc[criterio.categoria] = (acc[criterio.categoria] || 0) + getCriterionWeight(criterio);
        return acc;
      }, {});

      const [category] = Object.entries(weightsByCategory).sort(([, weightA], [, weightB]) => weightB - weightA)[0] || [];
      return category || '-';
    });

    const ultimaActualizacion = computed(() => {
      const lastDate = criterios.value
        .map((criterio) => criterio.updatedAt)
        .filter((dateValue): dateValue is string => !!dateValue && dayjs(dateValue).isValid())
        .sort((dateA, dateB) => dayjs(dateB).valueOf() - dayjs(dateA).valueOf())[0];

      return lastDate ? dayjs(lastDate).format('DD/MMM/YYYY') : '-';
    });

    const currentEvaluationModelId = computed(() => {
      const evaluationModelId = Number(route.query.modelId);
      return Number.isFinite(evaluationModelId) && evaluationModelId > 0 ? evaluationModelId : null;
    });

    const statCards = computed(() => [
      {
        label: 'Criterios Activos',
        value: totalActivos.value,
        caption: 'Aplicados en ranking',
        icon: 'check-circle',
        variant: 'green',
      },
      {
        label: 'Criterios Inactivos',
        value: totalInactivos.value,
        caption: 'No aplican actualmente',
        icon: 'ban',
        variant: 'gray',
      },
      {
        label: 'Mayor Peso',
        value: categoriaConMasPeso.value,
        caption: 'Categoría destacada',
        icon: 'chart-line',
        variant: 'blue',
        valueSize: 'xs',
      },
      {
        label: 'Última Actualización',
        value: ultimaActualizacion.value,
        caption: 'Fecha de referencia',
        icon: 'calendar',
        variant: 'yellow',
        valueSize: 'xs',
      },
    ]);

    const filteredCriterios = computed(() => {
      return criterios.value.filter((criterio) => {
        const matchSearch = criterio.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) || criterio.categoria.toLowerCase().includes(searchQuery.value.toLowerCase());

        return matchSearch;
      });
    });

    const groupedCriterios = computed(() => {
      return filteredCriterios.value.reduce((acc: Record<string, CriterionDto[]>, item) => {
        if (!acc[item.categoria]) acc[item.categoria] = [];
        acc[item.categoria].push(item);
        return acc;
      }, {});
    });

    const totalCriteriaCount = computed(() => Object.values(criteriaCountByProfileSectionId.value).reduce((total, count) => total + count, 0));

    const countByProfileSection = (profileSectionId: number) => {
      return criteriaCountByProfileSectionId.value[profileSectionId] || 0;
    };

    const getCriterionName = (criterion: any, fallbackCategory: string) => {
      return criterion.educationType?.name || criterion.productionType?.name || criterion.profileSections?.name || fallbackCategory || `Criterio ${criterion.id}`;
    };

    const mapApiCriterion = (criterion: any, category: string): CriterionDto => {
      const isPerRecord = criterion.calculationType === 'PER_RECORD';

      return {
        id: criterion.id,
        profileSectionId: criterion.profileSections?.id,
        criterionTypeId: criterion.educationType?.id || criterion.productionType?.id || null,
        nombre: getCriterionName(criterion, category),
        categoria: category,
        tipoCalculo: isPerRecord ? 'registro' : 'escala',
        hasScoreRecord: isPerRecord ? !!criterion.sectionScoreRecord : undefined,
        puntajePorRegistro: isPerRecord ? criterion.sectionScoreRecord?.scoreRecord : undefined,
        topeMaximo: isPerRecord ? criterion.sectionScoreRecord?.maxScore : undefined,
        rangosEscala: !isPerRecord
          ? (criterion.sectionTimeScaleRanges || []).map((range) => ({
              id: range.id,
              desde: Number(range.fromYear),
              hasta: Number(range.toYear),
              puntaje: Number(range.assignedScore),
            }))
          : undefined,
        validarDocumentos: Boolean(Number(criterion.validation)),
        activo: Boolean(Number(criterion.status)),
        updatedAt: criterion.updatedAt,
        evaluationModelId: criterion.evaluationModel?.id,
        evaluationModelName: criterion.evaluationModel?.name,
        evaluationModelVersion: criterion.evaluationModel?.version,
      };
    };

    const mapCriteriaGroups = (groups: any[]) => {
      return groups.flatMap((group) => {
        const category = group.profileSection?.name || 'Sin categoría';

        return (group.criteria || []).map((criterion) => mapApiCriterion(criterion, category));
      });
    };

    const setCriteriaCounts = (groups: any[]) => {
      criteriaCountByProfileSectionId.value = groups.reduce((acc: Record<number, number>, group) => {
        if (group.profileSection?.id) {
          acc[group.profileSection.id] = Number(group.totalCriteria ?? group.criteria?.length ?? 0);
        }

        return acc;
      }, {});
    };

    const loadProfileSections = async () => {
      profileSections.value = await getProfileSectionsService.run();
    };

    const loadCriteria = async (profileSectionsId: number | null = selectedProfileSectionId.value) => {
      const params = profileSectionsId ? { profileSectionsId } : undefined;
      const response = await getEvaluationCriteriaService.run(params);

      if (!selectedProfileSectionId.value) {
        setCriteriaCounts(Array.isArray(response) ? response : []);
      }

      criterios.value = Array.isArray(response) ? mapCriteriaGroups(response) : [];
    };

    const loadCriteriaCounts = async () => {
      const response = await getEvaluationCriteriaService.run();
      setCriteriaCounts(Array.isArray(response) ? response : []);
    };

    const reloadCriteriaAfterMutation = async () => {
      await loadCriteria(selectedProfileSectionId.value);

      if (selectedProfileSectionId.value) {
        await loadCriteriaCounts();
      }
    };

    const handleProfileSectionFilter = async (profileSectionId: number | null) => {
      selectedProfileSectionId.value = profileSectionId;
      await loadCriteria(profileSectionId);
    };

    const handleCategoryChange = async (profileSectionsId: string | number | null) => {
      const previousProfileSectionId = form.profileSectionsId;
      const value = Number(profileSectionsId);
      const nextProfileSectionId = Number.isFinite(value) && value > 0 ? value : null;

      form.profileSectionsId = nextProfileSectionId;

      if (Number(previousProfileSectionId) !== Number(nextProfileSectionId)) {
        form.criterionTypeId = null;
        pendingCriterionTypeId.value = null;
      }
    };

    const handleCriterionTypeRemoteChange = (criterionType: any) => {
      const criterionTypeId = Number(typeof criterionType === 'object' ? criterionType?.id : criterionType);
      form.criterionTypeId = Number.isFinite(criterionTypeId) && criterionTypeId > 0 ? criterionTypeId : null;
    };

    const applyPendingCriterionTypeId = () => {
      if (!pendingCriterionTypeId.value) return;

      form.criterionTypeId = pendingCriterionTypeId.value;
      pendingCriterionTypeId.value = null;
    };

    const resetForm = () => {
      form.profileSectionsId = null;
      form.criterionTypeId = null;
      form.status = true;
      form.calculationType = 'PER_RECORD';
      form.scoreRecord = '';
      form.maxScore = '';
      form.rangosEscala = [
        { id: 'local-1', desde: '0', hasta: '2', puntaje: '5' },
        { id: 'local-2', desde: '3', hasta: '5', puntaje: '10' },
        { id: 'local-3', desde: '6', hasta: '10', puntaje: '20' },
      ];
      form.validation = false;
      pendingCriterionTypeId.value = null;
      editingId.value = null;
      createdEvaluationCriteriaId.value = null;
      hasExistingScoreRecord.value = false;
      drawerStep.value = 'base';
    };

    const openCreate = async () => {
      resetForm();
      await loadProfileSections();
      drawerOpen.value = true;
    };

    const closeDrawer = () => {
      drawerOpen.value = false;
      resetForm();
    };

    const addRange = () => {
      form.rangosEscala.push({
        id: `local-${Date.now()}`,
        desde: '',
        hasta: '',
        puntaje: '',
      });
    };

    const removeRange = async (id: string | number) => {
      if (form.rangosEscala.length === 1) return;

      try {
        pendingDeleteRangeId.value = id;

        if (typeof id === 'number') {
          await deleteSectionTimeScaleRangeService.run(id);
        }

        form.rangosEscala = form.rangosEscala.filter((item) => item.id !== id);
      } catch (error) {
        console.log('error', error);
      } finally {
        pendingDeleteRangeId.value = null;
      }
    };

    const extractResponseId = (response: any) => {
      return Number(response?.id ?? response?.data?.id ?? response?.data?.data?.id);
    };

    const continueCriterion = async () => {
      try {
        if (!currentEvaluationModelId.value || !form.profileSectionsId) return;
        if (selectedProfileSectionRequiresCriteriaType.value && !form.criterionTypeId) return;

        isSavingCriterion.value = true;

        const payload: CreateOrUpdateEvaluationCriteriaPayload = {
          evaluationModelId: currentEvaluationModelId.value,
          profileSectionsId: form.profileSectionsId,
          calculationType: form.calculationType,
          validation: form.validation ? 1 : 0,
          status: form.status,
        };

        if (selectedProfileSection.value?.criterioType === 'EDUCATION_TYPE') {
          payload.educationTypeId = form.criterionTypeId;
        }

        if (selectedProfileSection.value?.criterioType === 'PRODUCTION_TYPE') {
          payload.productionTypeId = form.criterionTypeId;
        }

        const evaluationCriteriaId = createdEvaluationCriteriaId.value || (editingId.value ? Number(editingId.value) : undefined);
        const response = await createOrUpdateEvaluationCriteriaService.run(payload, evaluationCriteriaId);
        const responseId = extractResponseId(response) || evaluationCriteriaId;

        if (!Number.isFinite(responseId) || responseId <= 0) return;

        createdEvaluationCriteriaId.value = responseId;
        drawerStep.value = 'configuration';
        await reloadCriteriaAfterMutation();
      } catch (error) {
        console.log('error', error);
      } finally {
        isSavingCriterion.value = false;
      }
    };

    const saveCriterionConfiguration = async () => {
      try {
        if (!createdEvaluationCriteriaId.value) return;

        isSavingConfiguration.value = true;

        if (form.calculationType === 'PER_RECORD') {
          if (!form.scoreRecord) return;

          if (editingId.value && hasExistingScoreRecord.value) {
            closeDrawer();
            await reloadCriteriaAfterMutation();
            return;
          }

          await createSectionScoreRecordService.run({
            evaluationCriteriaId: createdEvaluationCriteriaId.value,
            scoreRecord: form.scoreRecord,
            maxScore: form.maxScore || undefined,
          });
        } else {
          const validRanges = form.rangosEscala.filter((range) => String(range.id).startsWith('local-') && range.desde !== '' && range.hasta !== '' && range.puntaje !== '');
          if (!validRanges.length) {
            if (editingId.value) {
              closeDrawer();
              await reloadCriteriaAfterMutation();
            }

            return;
          }

          await Promise.all(
            validRanges.map((range) =>
              createSectionTimeScaleRangeService.run({
                evaluationCriteriaId: createdEvaluationCriteriaId.value,
                fromYear: Number(range.desde),
                toYear: Number(range.hasta),
                assignedScore: range.puntaje,
              })
            )
          );
        }

        closeDrawer();
        await reloadCriteriaAfterMutation();
      } catch (error) {
        console.log('error', error);
      } finally {
        isSavingConfiguration.value = false;
      }
    };

    const editCriterion = (item: CriterionDto) => {
      editingId.value = item.id;
      createdEvaluationCriteriaId.value = Number(item.id);
      drawerStep.value = 'base';
      form.profileSectionsId = item.profileSectionId || null;
      form.criterionTypeId = null;
      pendingCriterionTypeId.value = item.criterionTypeId || null;
      form.status = item.activo;
      form.calculationType = item.tipoCalculo === 'registro' ? 'PER_RECORD' : 'TIME_SCALE';
      form.scoreRecord = item.puntajePorRegistro?.toString() || '';
      form.maxScore = item.topeMaximo?.toString() || '';
      hasExistingScoreRecord.value = !!item.hasScoreRecord;
      form.rangosEscala = item.rangosEscala?.map((r) => ({
        id: r.id,
        desde: String(r.desde),
        hasta: String(r.hasta),
        puntaje: String(r.puntaje),
      })) || [{ id: 'local-1', desde: '', hasta: '', puntaje: '' }];
      form.validation = item.validarDocumentos;
      drawerOpen.value = true;
    };

    const toggleStatus = (id: string | number) => {
      criterios.value = criterios.value.map((item) => (item.id === id ? { ...item, activo: !item.activo } : item));
    };

    const deleteCriterion = async (id: string | number) => {
      try {
        pendingDeleteCriterionId.value = id;
        await deleteEvaluationCriteriaService.run(Number(id));
        await loadCriteria(selectedProfileSectionId.value);

        if (selectedProfileSectionId.value) {
          await loadCriteriaCounts();
        }
      } catch (error) {
        console.log('error', error);
      } finally {
        pendingDeleteCriterionId.value = null;
      }
    };

    onMounted(async () => {
      try {
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
        await Promise.all([loadProfileSections(), loadCriteria(null)]);
      } catch (e) {
        console.log('error', e);
        criterios.value = [];
      } finally {
        loading.value = false;
      }
    });

    return {
      title,
      loading,
      drawerOpen,
      drawerStep,
      drawerTitle,
      criterios,
      profileSections,
      selectedProfileSection,
      selectedProfileSectionRequiresCriteriaType,
      criterionTypesAutocompleteKey,
      selectedProfileSectionId,
      searchQuery,
      filteredCriterios,
      groupedCriterios,
      statCards,
      totalActivos,
      totalInactivos,
      categoriaConMasPeso,
      ultimaActualizacion,
      form,
      editingId,
      pendingDeleteCriterionId,
      pendingDeleteRangeId,
      isSavingCriterion,
      isSavingConfiguration,
      getEvaluationCriteriaTypesService,
      totalCriteriaCount,
      countByProfileSection,
      handleProfileSectionFilter,
      handleCategoryChange,
      handleCriterionTypeRemoteChange,
      applyPendingCriterionTypeId,
      openCreate,
      closeDrawer,
      addRange,
      removeRange,
      continueCriterion,
      saveCriterionConfiguration,
      editCriterion,
      toggleStatus,
      deleteCriterion,
    };
  },
});
</script>

<style scoped>
.criteriaPage {
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.filtersWrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.searchBox__input :deep(.o-form-input) {
  padding-left: 40px;
}

.chipsWrap {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 4px;
}

.chip {
  border: 1px solid #d0d5dd;
  background: #fff;
  color: #344054;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.chip--active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.categoriesWrap {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.categoryBlock {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.categoryTitle {
  display: flex;
  align-items: center;
  gap: 10px;
}

.categoryTitle h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #1f2937;
}

.categoryTitle span {
  color: #6b7280;
  font-size: 0.9rem;
}

.categoryTitle__bar {
  width: 4px;
  height: 24px;
  border-radius: 999px;
  background: var(--color-primary);
}

.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
}

.cardTitleRow {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.criterionTitle {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.badgesRow {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.titleActions {
  display: flex;
  gap: 8px;
}

.criterionBody {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summaryBox {
  background: #f9fafb;
  border-radius: 12px;
  padding: 14px;
  display: grid;
  gap: 8px;
}

.summaryBox__title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}

.summaryBox__empty {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}

.rangeRow {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  color: #4b5563;
}

.validationRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid #eaecf0;
}

.validationInfo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #4b5563;
}

.iconOk {
  color: #16a34a;
}

.iconMuted {
  color: #98a2b3;
}

.footerActions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 0;
}

.emptyState {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}

.emptyState__icon {
  font-size: 34px;
  color: #98a2b3;
}

.emptyState__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.emptyState__text {
  margin: 0;
  color: #6b7280;
  max-width: 520px;
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

.formGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 900px) {
  .formGrid {
    grid-template-columns: 1fr 1fr;
  }
}

.field--full {
  grid-column: 1 / -1;
}

.configurationSummary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  border: 1px solid #eaecf0;
  border-radius: 12px;
  background: #f9fafb;
  padding: 14px;
}

.configurationSummary strong {
  color: #1f2937;
}

.configurationSummary span {
  color: #6b7280;
  font-size: 13px;
  font-weight: 700;
}

.calcTypeGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

@media (min-width: 900px) {
  .calcTypeGrid {
    grid-template-columns: 1fr 1fr;
  }
}

.calcTypeCard {
  width: 100%;
  border: 1px solid #d0d5dd;
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  text-align: left;
  font-weight: 700;
}

.calcTypeCard--active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
  color: var(--color-primary);
}

.rangesWrap {
  display: grid;
  gap: 12px;
}

.rangeEditor {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 10px;
}

@media (max-width: 640px) {
  .rangeEditor {
    grid-template-columns: 1fr;
  }
}

.switchRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid #eaecf0;
  border-radius: 12px;
  padding: 14px;
}

.switchText {
  font-size: 14px;
  color: #344054;
  font-weight: 600;
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
  padding: 10px 14px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.btnDanger {
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #ef4444;
}

.btnAction--danger {
  border-color: #fecaca;
  color: #dc2626;
}

.btnAction--success {
  border-color: #bbf7d0;
  color: #16a34a;
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

  .rangeEditor {
    grid-template-columns: 1fr;
  }

  .footerActions,
  .drawerFooterActions {
    flex-direction: column;
  }
}
</style>
