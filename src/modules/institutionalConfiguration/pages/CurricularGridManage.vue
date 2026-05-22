<template>
  <AppBaseList title="Mallas Curriculares" :subtitle="`Programa: ${gridConfig.programName}`">
    <template #actions>
      <div class="d-flex gap-2">
        <AppButton
          v-if="!isReadOnlyView"
          variant="primary"
          style="color: white"
          :disabled="!canSaveGrid || loading || isSavingGrid"
          :loading="isSavingGrid"
          :label="hasPersistedPeriods ? 'Guardar cambios' : 'Guardar malla curricular'"
          @click="saveGridCurriculum"
        >
        </AppButton>

        <AppButton variant="light" outlined :disabled="isSavingGrid" @click="goBack" label="Volver" />
      </div>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else>
        <div v-if="loadError" class="alert alert-danger mb-4" role="alert">
          {{ loadError }}
        </div>

        <AppEmptyResponse v-else-if="!hasGridData" :show-image="false" title="No se encontró la malla curricular" />

        <div v-else>
          <div class="bg-white p-4 rounded-3 border mb-4 d-flex justify-content-between align-items-start">
            <div>
              <div class="d-flex align-items-center gap-3 mb-2">
                <h2 class="h4 fw-bold text-dark mb-0">
                  {{ gridConfig.title }}
                </h2>
                <span class="badge rounded-pill px-3 py-1 fw-medium border" :class="getStatusBadgeClass(gridConfig.status)">
                  {{ gridConfig.status }}
                </span>
              </div>

              <div class="d-flex flex-wrap gap-4 text-muted small align-items-center" style="font-size: 13px">
                <span
                  >Código: <strong>{{ gridConfig.code }}</strong></span
                >
                <span class="text-black-50">|</span>
                <span
                  >Versión: <strong>{{ gridConfig.version }}</strong></span
                >
                <span class="text-black-50">|</span>
                <span
                  >Vigencia: <strong>{{ gridConfig.validity }}</strong></span
                >
                <span class="text-black-50">|</span>
                <span
                  >Registro calificado: <strong>{{ gridConfig.qualifiedRegistration }}</strong></span
                >
              </div>
            </div>
          </div>

          <div class="row g-3 mb-4">
            <div class="col-md-3">
              <div class="bg-white rounded border d-flex justify-content-between align-items-center h-100" style="border-left: 4px solid #22c55e !important; background-color: #f0fdf4 !important">
                <div class="p-3">
                  <div class="fw-bold text-success mb-1" style="font-size: 10px; letter-spacing: 0.5px">TOTAL CRÉDITOS</div>
                  <div class="h4 fw-bold text-success mb-0 d-flex align-items-baseline gap-1" style="color: #15803d !important">
                    {{ stats.totalCredits }}
                  </div>
                </div>
                <div class="px-3 py-4 text-success opacity-50">
                  <AppIcon icon="graduation-cap" class="fs-5" />
                </div>
              </div>
            </div>

            <div class="col-md-3">
              <div class="bg-white rounded border d-flex justify-content-between align-items-center h-100" style="border-left: 4px solid #3b82f6 !important; background-color: #eff6ff !important">
                <div class="p-3">
                  <div class="fw-bold text-primary mb-1" style="font-size: 10px; letter-spacing: 0.5px">TOTAL ASIGNATURAS</div>
                  <div class="h4 fw-bold text-primary mb-0 d-flex align-items-baseline gap-1" style="color: #1d4ed8 !important">
                    {{ stats.totalSubjects }}
                  </div>
                </div>
                <div class="px-3 py-4 text-primary opacity-50">
                  <AppIcon icon="book-open" class="fs-5" />
                </div>
              </div>
            </div>

            <div class="col-md-3">
              <div class="bg-white rounded border d-flex justify-content-between align-items-center h-100" style="border-left: 4px solid #a855f7 !important; background-color: #faf5ff !important">
                <div class="p-3">
                  <div class="fw-bold mb-1" style="font-size: 10px; letter-spacing: 0.5px; color: #9333ea">TOTAL {{ gridConfig.periodLabel.toUpperCase() }}</div>
                  <div class="h4 fw-bold mb-0 d-flex align-items-baseline gap-1" style="color: #7e22ce !important">
                    {{ stats.totalCycles }}
                  </div>
                </div>
                <div class="px-3 py-4 opacity-50" style="color: #a855f7">
                  <AppIcon icon="layer-group" class="fs-5" />
                </div>
              </div>
            </div>

            <div class="col-md-3">
              <div class="bg-white rounded border d-flex justify-content-between align-items-center h-100" style="border-left: 4px solid #f97316 !important; background-color: #fff7ed !important">
                <div class="p-3">
                  <div class="fw-bold mb-1" style="font-size: 10px; letter-spacing: 0.5px; color: #ea580c">SEMANAS DE CLASE</div>
                  <div class="h4 fw-bold mb-0 d-flex align-items-baseline gap-1" style="color: #c2410c !important">
                    {{ stats.totalClassWeeks }}
                  </div>
                </div>
                <div class="px-3 py-4 opacity-50" style="color: #f97316">
                  <AppIcon icon="calendar" class="fs-5" />
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-3 border mb-5">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 class="fw-bold text-dark mb-1">Progreso de Créditos del Programa</h6>
                <p class="text-muted small mb-0" style="font-size: 11px">Créditos configurados vs créditos requeridos</p>
              </div>

              <div class="text-end">
                <div class="h5 fw-bold text-dark mb-0">
                  {{ progressStats.configuredCredits }}
                  <span class="text-muted fs-6 fw-normal"> / {{ progressStats.requiredCredits }} </span>
                </div>
                <div class="text-muted" style="font-size: 11px">créditos</div>
              </div>
            </div>

            <div class="progress mb-2" style="height: 6px">
              <div
                class="progress-bar bg-primary"
                role="progressbar"
                :style="{ width: `${progressStats.percentage}%` }"
                :aria-valuenow="progressStats.percentage"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>

            <div class="text-end text-muted mb-4" style="font-size: 11px">{{ progressStats.percentage }}% completado</div>

            <div class="row text-center pt-3 border-top">
              <div class="col-4 border-end">
                <div class="text-muted mb-1" style="font-size: 11px">Créditos obligatorios</div>
                <div class="fs-5 fw-bold text-primary">
                  {{ progressStats.mandatoryCredits }}
                </div>
              </div>

              <div class="col-4 border-end">
                <div class="text-muted mb-1" style="font-size: 11px">Créditos electivos</div>
                <div class="fs-5 fw-bold" style="color: #a855f7">
                  {{ progressStats.electiveCredits }}
                </div>
              </div>

              <div class="col-4">
                <div class="text-muted mb-1" style="font-size: 11px">Créditos faltantes</div>
                <div class="fs-5 fw-bold text-orange">
                  {{ progressStats.missingCredits }}
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="!semestersWithTotals.length"
            class="w-100 border rounded-3 border-dashed d-flex flex-column align-items-center justify-content-center py-5 text-muted"
            style="border-style: dashed !important; border-color: #e5e7eb !important"
          >
            <div class="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style="width: 48px; height: 48px; background-color: #f3f4f6 !important">
              <AppIcon icon="layer-group" class="fs-4 text-secondary opacity-50" />
            </div>

            <p class="mb-1 small" style="color: #6b7280; font-size: 13px">No hay períodos configurados en esta malla curricular</p>
            <p class="mb-0 small" style="color: #9ca3af; font-size: 12px">Cuando existan períodos o se generen desde el esquema operativo, aparecerán aquí.</p>
          </div>

          <div v-else class="semesters-container d-flex flex-column gap-5">
            <div v-for="semester in semestersWithTotals" :key="semester.id" class="semester-row d-flex flex-column flex-lg-row gap-4 border-bottom pb-4">
              <div class="semester-info" style="min-width: 200px; width: 220px">
                <h5 class="fw-bold text-dark mb-3">
                  {{ semester.name || `${gridConfig.periodLabelSingular} ${semester.number}` }}
                </h5>

                <div class="d-flex flex-column gap-2 text-muted small px-1 mb-4" style="font-size: 13px">
                  <div class="d-flex align-items-center gap-2">
                    <AppIcon icon="book-open" style="font-size: 14px" />
                    {{ semester.subjectsTotal }} asignaturas
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <AppIcon icon="clock" style="font-size: 14px" />
                    {{ semester.hoursTotal }} horas
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <AppIcon icon="graduation-cap" style="font-size: 14px" />
                    {{ semester.creditsTotal }} créditos
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <AppIcon icon="check-circle" style="font-size: 14px" />
                    {{ semester.state }}
                  </div>
                </div>

                <AppButton v-if="!isReadOnlyView" variant="ghost" class="text-primary fw-medium px-2 py-1" style="font-size: 13px" @click="openSubjectDrawer(semester.id)">
                  <AppIcon icon="plus" class="me-1" />
                  Agregar asignatura
                </AppButton>
              </div>

              <div class="semester-subjects d-flex flex-wrap gap-3 flex-grow-1">
                <template v-if="semester.subjects.length > 0">
                  <SubjectCard
                    v-for="subject in semester.subjects"
                    :key="getSubjectKey(subject)"
                    :subject="subject"
                    :isEditable="!isReadOnlyView"
                    :showPrerequisites="true"
                    @edit="editSubject"
                    @delete="deleteSubject"
                  />
                </template>

                <div
                  v-else
                  class="w-100 border rounded-3 border-dashed d-flex flex-column align-items-center justify-content-center py-5 text-muted"
                  style="border-style: dashed !important; border-color: #e5e7eb !important"
                >
                  <div class="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style="width: 48px; height: 48px; background-color: #f3f4f6 !important">
                    <AppIcon icon="book-open" class="fs-4 text-secondary opacity-50" />
                  </div>

                  <p class="mb-3 small" style="color: #6b7280; font-size: 13px">No hay asignaturas en este período</p>

                  <AppButton v-if="!isReadOnlyView" variant="light" class="text-dark fw-bold border bg-white shadow-sm" style="font-size: 13px" @click="openSubjectDrawer(semester.id)">
                    <AppIcon icon="plus" class="me-1" />
                    Agregar primera asignatura
                  </AppButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SubjectSelectDrawer
          v-if="isSubjectDrawerOpen && !isReadOnlyView"
          :isVisible="isSubjectDrawerOpen"
          :semesterId="selectedSemesterForSubject"
          :programId="gridConfig.programId"
          :programName="gridConfig.programName"
          :gridTitle="gridConfig.title"
          :associatedSubjectIds="associatedSubjectIds"
          @close="closeSubjectDrawer"
          @add="addSubjectToSemester"
        />

        <SubjectDetailDrawer
          v-if="isDetailDrawerOpen && !isReadOnlyView"
          :isVisible="isDetailDrawerOpen"
          :subject="selectedSubjectForDetail"
          :semesterNumber="selectedSemesterNumberForDetail"
          :periodLabel="gridConfig.periodLabelSingular"
          :programId="gridConfig.programId"
          :associatedSubjectIds="associatedSubjectIds"
          @close="closeDetailDrawer"
          @save="saveSubjectDetails"
        />

        <ExportGridModal v-model="isExportModalOpen" />
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import SubjectCard, { SubjectItem } from '../components/SubjectCard.vue';
import SubjectSelectDrawer from '../components/SubjectSelectDrawer.vue';
import SubjectDetailDrawer from '../components/SubjectDetailDrawer.vue';
import ExportGridModal from '../components/ExportGridModal.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { GetProgramCurriculumsService } from '../services/getProgramCurriculums.service';
import { GetProgramsService } from '../services/getPrograms.service';
import { GetAllOperationalSchemesService } from '../../curriculumDesign/services/getAllOperationalSchemes.service';
import type { ProgramCurriculumDto, ProgramCurriculumPeriodDto, ProgramCurriculumPeriodSubjectDto, ProgramCurriculumSubjectDto } from '../dtos/programCurriculum.dto';
import { SaveFullProgramCurriculumService, type ProgramCurriculumFullPayload } from '../services/saveFullProgramCurriculum.service';
import { ToastService } from '../../../shared/services/toast.service';

type ManageSubjectItem = SubjectItem & {
  id?: number;
  subjectId?: number;
  periodSubjectId?: number;
  curriculumPeriodId?: number;
  prerequisiteIds?: number[];
};

type SemesterItem = {
  id: number;
  persistedId?: number;
  number: number;
  name: string;
  code: string;
  description: string;
  state: string;
  classWeeks: number;
  subjects: ManageSubjectItem[];
};

type GridConfig = {
  id: number;
  programId: number;
  programName: string;
  title: string;
  status: string;
  code: string;
  version: string;
  validity: string;
  qualifiedRegistration: string;
  totalRequiredCredits: number;
  periodLabel: string;
  periodLabelSingular: string;
};

type OperationalSchemePeriodType = {
  id?: number;
  name?: string | null;
  code?: string | null;
  description?: string | null;
};

type OperationalSchemePeriodTemplate = {
  id?: number;
  name?: string | null;
  code?: string | null;
  description?: string | null;
};

type OperationalSchemeResponse = {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  classWeeks?: number | null;
  creditsNumber?: number | null;
  semesterNumber?: number | null;
  periodType?: OperationalSchemePeriodType | null;
  periodTemplates?: OperationalSchemePeriodTemplate[] | null;
};

const getProgramCurriculumsService = new GetProgramCurriculumsService();
const getProgramsService = new GetProgramsService();
const getAllOperationalSchemesService = new GetAllOperationalSchemesService();
const saveFullProgramCurriculumService = new SaveFullProgramCurriculumService();
const toastService = new ToastService();

const getRouteValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value[0] || '';
  }

  return typeof value === 'string' ? value : '';
};

const toNumber = (value: unknown) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const capitalize = (value?: string | null) => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatDateLabel = (value?: string | null) => {
  if (!value || value.startsWith('0000-00-00')) return '';

  const parsedDate = dayjs(value);
  if (!parsedDate.isValid()) return '';

  return parsedDate.format('DD/MM/YYYY');
};

const buildValidityLabel = (startDate?: string | null, endDate?: string | null) => {
  const formattedEndDate = formatDateLabel(endDate);
  if (formattedEndDate) return formattedEndDate;

  const formattedStartDate = formatDateLabel(startDate);
  if (formattedStartDate) return `${formattedStartDate} - Vigente`;

  return 'Vigente';
};

const pluralizePeriodLabel = (periodLabel: string) => {
  if (!periodLabel) return 'Períodos';
  if (periodLabel.endsWith('s')) return periodLabel;
  return `${periodLabel}s`;
};

const romanToNumber = (romanValue: string) => {
  const romanMap: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let total = 0;
  let previousValue = 0;

  for (let index = romanValue.length - 1; index >= 0; index -= 1) {
    const currentValue = romanMap[romanValue[index]] || 0;
    if (currentValue < previousValue) {
      total -= currentValue;
    } else {
      total += currentValue;
      previousValue = currentValue;
    }
  }

  return total;
};

const extractPeriodNumber = (name?: string | null, code?: string | null, fallbackNumber = 1) => {
  const sources = [name || '', code || ''];

  for (const source of sources) {
    const numberMatch = source.match(/(\d+)/);
    if (numberMatch) {
      return Number(numberMatch[1]);
    }

    const romanMatch = source.match(/\b([IVXLCDM]+)\b/i);
    if (romanMatch) {
      const romanNumber = romanToNumber(romanMatch[1].toUpperCase());
      if (romanNumber > 0) {
        return romanNumber;
      }
    }
  }

  return fallbackNumber;
};

const getPeriodLabelFromOperationalScheme = (operationalScheme?: OperationalSchemeResponse | null) => {
  const label = operationalScheme?.periodType?.description || operationalScheme?.periodType?.name || 'Período';

  return capitalize(label) || 'Período';
};

const getPeriodLabelFromPersistedPeriods = (curriculumPeriods: ProgramCurriculumPeriodDto[]) => {
  const firstPeriodName = curriculumPeriods.find((period) => period?.name)?.name;
  const labelMatch = firstPeriodName?.match(/^([A-Za-zÁÉÍÓÚáéíóúÑñ]+)/);

  return capitalize(labelMatch?.[1]) || 'Período';
};

const getSubjectDisplayCode = (subject?: ProgramCurriculumSubjectDto, fallbackId?: number) => {
  if (subject?.code) return subject.code;
  if (fallbackId) return `SUB-${fallbackId}`;
  return 'SIN-CODIGO';
};

const getSubjectDisplayHours = (subject?: ProgramCurriculumSubjectDto) => {
  const maximumHours = toNumber(subject?.maximumHours);
  if (maximumHours > 0) return maximumHours;

  const theoricalHours = toNumber(subject?.theoricalHours);
  const practicalHours = toNumber(subject?.practicalHours);
  return theoricalHours + practicalHours;
};

const getSubjectDisplayType = () => 'Obligatoria';

const getOperationalSchemeClassWeeksPerPeriod = (operationalScheme?: OperationalSchemeResponse | null) => {
  const totalClassWeeks = toNumber(operationalScheme?.classWeeks);
  const totalPeriods = toNumber(operationalScheme?.semesterNumber);

  if (!totalClassWeeks || !totalPeriods) return 0;

  return Number((totalClassWeeks / totalPeriods).toFixed(2));
};

const buildDefaultGridConfig = (programName = 'Sin programa'): GridConfig => ({
  id: 0,
  programId: 0,
  programName,
  title: 'Malla curricular',
  status: 'Borrador',
  code: '-',
  version: 'Sin versión',
  validity: 'Vigente',
  qualifiedRegistration: '-',
  totalRequiredCredits: 0,
  periodLabel: 'Períodos',
  periodLabelSingular: 'Período',
});

export default defineComponent({
  name: 'CurricularGridManage',
  components: {
    AppButton,
    AppIcon,
    AppLoading,
    AppEmptyResponse,
    SubjectCard,
    SubjectSelectDrawer,
    SubjectDetailDrawer,
    ExportGridModal,
    AppBaseList,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const headerStorage = useHeaderStore();
    const isReadOnlyView = computed(() => String(route.name) === 'institutionalConfiguration.curricularGridDetail');

    const programId = computed(() => Number(getRouteValue(route.params.id)) || Number(getRouteValue(route.query.programsId)) || 0);
    const gridId = computed(() => Number(getRouteValue(route.params.gridId)) || 0);
    const operationalSchemeId = computed(() => Number(getRouteValue(route.query.operationalSchemeId)) || 0);

    const loading = ref(false);
    const isSavingGrid = ref(false);
    const loadError = ref('');
    const isExportModalOpen = ref(false);
    const currentCurriculumId = ref(0);
    const fallbackOperationalSchemeId = ref(0);
    const programName = ref('');
    const gridConfig = ref<GridConfig>(buildDefaultGridConfig());
    const semestersList = ref<SemesterItem[]>([]);

    const isDetailDrawerOpen = ref(false);
    const selectedSubjectForDetail = ref<ManageSubjectItem | null>(null);
    const selectedSemesterNumberForDetail = ref<number>(0);

    const isSubjectDrawerOpen = ref(false);
    const selectedSemesterForSubject = ref<number | undefined>(undefined);

    const getStatusBadgeClass = (status: string) => {
      switch (status) {
        case 'Activo':
          return 'bg-success-light text-success border-success-subtle';
        case 'En progreso':
          return 'bg-info-light text-info border-info-subtle';
        case 'Finalizado':
          return 'bg-primary-light text-primary border-primary-subtle';
        case 'Borrador':
          return 'bg-warning-light text-warning border-warning-subtle';
        default:
          return 'bg-secondary-light text-secondary border-secondary-subtle';
      }
    };

    const getSubjectKey = (subject: ManageSubjectItem) => {
      return subject.periodSubjectId || subject.subjectId || subject.id || subject.code;
    };

    const findSemesterBySubject = (subject: ManageSubjectItem) => {
      return semestersList.value.find((semester) => semester.subjects.some((currentSubject) => getSubjectKey(currentSubject) === getSubjectKey(subject)));
    };

    const mapPeriodSubjectToCard = (periodSubject: ProgramCurriculumPeriodSubjectDto): ManageSubjectItem => {
      const subject = periodSubject.subject;
      const prerequisites = Array.isArray(periodSubject.prerequisites) ? periodSubject.prerequisites : [];

      return {
        id: periodSubject.id,
        periodSubjectId: periodSubject.id,
        subjectId: periodSubject.subjectId || subject?.id,
        curriculumPeriodId: periodSubject.curriculumPeriodId,
        code: getSubjectDisplayCode(subject, periodSubject.subjectId || subject?.id),
        name: subject?.shortName || subject?.name || 'Asignatura sin nombre',
        type: getSubjectDisplayType(),
        credits: toNumber(subject?.credits),
        hours: getSubjectDisplayHours(subject),
        prerequisites: prerequisites.map((prerequisite) => prerequisite.shortName || prerequisite.name || getSubjectDisplayCode(prerequisite, prerequisite.id)),
        prerequisiteIds: prerequisites.map((prerequisite) => prerequisite.id).filter((id) => Number.isFinite(id)),
      };
    };

    const buildGeneratedPeriods = (operationalScheme?: OperationalSchemeResponse | null, classWeeksPerPeriod = 0) => {
      const periodTemplates = Array.isArray(operationalScheme?.periodTemplates) ? operationalScheme.periodTemplates : [];

      if (periodTemplates.length > 0) {
        return periodTemplates.map((periodTemplate, index) => {
          const position = index + 1;

          return {
            id: position,
            persistedId: undefined,
            number: extractPeriodNumber(periodTemplate.name, periodTemplate.code, position),
            name: periodTemplate.name || `Período ${position}`,
            code: periodTemplate.code || `P${String(position).padStart(2, '0')}`,
            description: periodTemplate.description || '',
            state: 'Finalizado',
            classWeeks: classWeeksPerPeriod,
            subjects: [],
          };
        });
      }

      const totalPeriods = toNumber(operationalScheme?.semesterNumber);

      return Array.from({ length: totalPeriods }, (_, index) => {
        const position = index + 1;

        return {
          id: position,
          persistedId: undefined,
          number: position,
          name: `Período ${position}`,
          code: `P${String(position).padStart(2, '0')}`,
          description: position === 1 ? 'Período inicial del programa' : `Período ${position} del programa`,
          state: 'Finalizado',
          classWeeks: classWeeksPerPeriod,
          subjects: [],
        };
      });
    };

    const hydrateGridState = (curriculum: ProgramCurriculumDto, curriculumPeriods: SemesterItem[], operationalScheme?: OperationalSchemeResponse | null) => {
      const periodLabelSingular = operationalScheme
        ? getPeriodLabelFromOperationalScheme(operationalScheme)
        : curriculum.curriculumPeriods?.length
        ? getPeriodLabelFromPersistedPeriods(curriculum.curriculumPeriods)
        : 'Período';

      gridConfig.value = {
        id: curriculum.id,
        programId: curriculum.programId || programId.value,
        programName: programName.value,
        title: curriculum.name || 'Malla curricular',
        status: curriculum.state || 'Borrador',
        code: curriculum.code || '-',
        version: curriculum.version || 'Sin versión',
        validity: buildValidityLabel(curriculum.startDate, curriculum.endDate),
        qualifiedRegistration: curriculum.qualifiedRegistration || '-',
        totalRequiredCredits: operationalScheme ? toNumber(operationalScheme.creditsNumber) : toNumber(curriculum.totalCredits),
        periodLabel: pluralizePeriodLabel(periodLabelSingular),
        periodLabelSingular,
      };

      currentCurriculumId.value = curriculum.id;
      semestersList.value = curriculumPeriods;
    };

    const loadProgramInfo = async () => {
      if (!programId.value) return 0;

      const response = await getProgramsService.run({
        noPag: true,
        id: programId.value,
      });

      const program = Array.isArray(response) ? response[0] : Array.isArray(response?.data) ? response.data[0] : null;

      programName.value = program?.name || program?.shortName || `Programa ${programId.value}`;

      return Number(program?.operationalSchemeId || program?.operationalScheme?.id) || 0;
    };

    const loadOperationalScheme = async (targetOperationalSchemeId?: number) => {
      const schemeId = targetOperationalSchemeId || operationalSchemeId.value || fallbackOperationalSchemeId.value;

      if (!schemeId) return null;

      const response = await getAllOperationalSchemesService.run({
        noPag: true,
        id: schemeId,
      });

      if (Array.isArray(response)) {
        return (response[0] || null) as OperationalSchemeResponse | null;
      }

      if (Array.isArray(response?.data)) {
        return (response.data[0] || null) as OperationalSchemeResponse | null;
      }

      return null;
    };

    const loadGridConfiguration = async () => {
      if (!programId.value || !gridId.value) {
        gridConfig.value = buildDefaultGridConfig();
        semestersList.value = [];
        currentCurriculumId.value = 0;
        fallbackOperationalSchemeId.value = 0;
        loadError.value = '';
        return;
      }

      loading.value = true;
      loadError.value = '';

      try {
        const response = await getProgramCurriculumsService.run({
          programId: programId.value,
          noPag: true,
          id: gridId.value,
        });

        const curriculum = Array.isArray(response) ? response[0] : null;

        if (!curriculum) {
          gridConfig.value = buildDefaultGridConfig();
          semestersList.value = [];
          currentCurriculumId.value = 0;
          return;
        }

        const persistedPeriods = Array.isArray(curriculum.curriculumPeriods) ? curriculum.curriculumPeriods : [];
        const programOperationalSchemeId = await loadProgramInfo();
        let resolvedOperationalSchemeId = operationalSchemeId.value;

        if (!resolvedOperationalSchemeId) {
          fallbackOperationalSchemeId.value = programOperationalSchemeId;
          resolvedOperationalSchemeId = programOperationalSchemeId;
        }

        const operationalScheme = resolvedOperationalSchemeId ? await loadOperationalScheme(resolvedOperationalSchemeId) : null;
        const classWeeksPerPeriod = getOperationalSchemeClassWeeksPerPeriod(operationalScheme);

        if (persistedPeriods.length > 0) {
          const mappedPeriods = persistedPeriods.map((period, index) => ({
            id: period.id || index + 1,
            persistedId: period.id || undefined,
            number: extractPeriodNumber(period.name, period.code, index + 1),
            name: period.name || `Período ${index + 1}`,
            code: period.code || `P${String(index + 1).padStart(2, '0')}`,
            description: period.description || '',
            state: period.state || 'Borrador',
            classWeeks: classWeeksPerPeriod,
            subjects: Array.isArray(period.periodSubjects) ? period.periodSubjects.map(mapPeriodSubjectToCard) : [],
          }));

          hydrateGridState(curriculum, mappedPeriods, operationalScheme);
          return;
        }

        const generatedPeriods = buildGeneratedPeriods(operationalScheme, classWeeksPerPeriod);

        hydrateGridState(curriculum, generatedPeriods, operationalScheme);
      } catch (error) {
        console.error('Error al cargar la malla curricular:', error);
        gridConfig.value = buildDefaultGridConfig();
        semestersList.value = [];
        currentCurriculumId.value = 0;
        loadError.value = 'No fue posible cargar la configuración de la malla curricular.';
      } finally {
        loading.value = false;
      }
    };

    const syncHeader = () => {
      headerStorage.module = { name: 'Diseño Curricular', url: '' };
      headerStorage.moduleItem = {
        name: 'Programas académicos',
        url: '/academicPrograms',
      };
      headerStorage.moduleSubItem = {
        name: 'Mallas Curriculares',
        url: `/academicPrograms/${programId.value}/curricular-grids`,
      };
    };

    onMounted(() => {
      syncHeader();
      void loadGridConfiguration();
    });

    watch([programId, gridId, operationalSchemeId], () => {
      syncHeader();
      void loadGridConfiguration();
    });

    const goBack = () => {
      router.push({
        name: 'institutionalConfiguration.curricularGrids',
        params: { id: programId.value },
        query: {
          ...route.query,
        },
      });
    };

    const editSubject = (subject: ManageSubjectItem) => {
      const semester = findSemesterBySubject(subject);

      if (semester) {
        selectedSemesterNumberForDetail.value = semester.number;
      }

      selectedSubjectForDetail.value = { ...subject };
      isDetailDrawerOpen.value = true;
    };

    const closeDetailDrawer = () => {
      isDetailDrawerOpen.value = false;
      setTimeout(() => {
        selectedSubjectForDetail.value = null;
      }, 300);
    };

    const saveSubjectDetails = (updatedSubject: ManageSubjectItem) => {
      const semester = findSemesterBySubject(updatedSubject);

      if (semester) {
        const subjectIndex = semester.subjects.findIndex((subject) => getSubjectKey(subject) === getSubjectKey(updatedSubject));

        if (subjectIndex !== -1) {
          semester.subjects[subjectIndex] = {
            ...semester.subjects[subjectIndex],
            ...updatedSubject,
            prerequisites: updatedSubject.prerequisites || [],
            prerequisiteIds: updatedSubject.prerequisiteIds || [],
          };
        }
      }

      closeDetailDrawer();
    };

    const deleteSubject = (subject: ManageSubjectItem) => {
      const semester = findSemesterBySubject(subject);

      if (semester) {
        semester.subjects = semester.subjects.filter((currentSubject) => getSubjectKey(currentSubject) !== getSubjectKey(subject));
      }
    };

    const openSubjectDrawer = (semesterId: number) => {
      selectedSemesterForSubject.value = semesterId;
      isSubjectDrawerOpen.value = true;
    };

    const closeSubjectDrawer = () => {
      isSubjectDrawerOpen.value = false;
      selectedSemesterForSubject.value = undefined;
    };

    const addSubjectToSemester = (payload: { semesterId: number; subjects: Array<SubjectItem & { subjectId?: number; prerequisiteIds?: number[] }> }) => {
      const semester = semestersList.value.find((currentSemester) => currentSemester.id === payload.semesterId);

      if (!semester) return;

      for (const subject of payload.subjects) {
        semester.subjects.push({
          ...subject,
          subjectId: subject.subjectId,
          curriculumPeriodId: semester.id,
          prerequisiteIds: subject.prerequisiteIds || [],
          prerequisites: subject.prerequisites || [],
        });
      }
    };

    const semestersWithTotals = computed(() =>
      semestersList.value.map((semester) => {
        const subjectsTotal = semester.subjects.length;
        const creditsTotal = semester.subjects.reduce((total, subject) => total + toNumber(subject.credits), 0);
        const hoursTotal = semester.subjects.reduce((total, subject) => total + toNumber(subject.hours), 0);

        return {
          ...semester,
          subjectsTotal,
          creditsTotal,
          hoursTotal,
        };
      })
    );

    const stats = computed(() => {
      const totalCycles = semestersList.value.length;
      const totalSubjects = semestersList.value.reduce((total, semester) => total + semester.subjects.length, 0);
      const totalCredits = semestersList.value.reduce((semesterTotal, semester) => semesterTotal + semester.subjects.reduce((subjectTotal, subject) => subjectTotal + toNumber(subject.credits), 0), 0);
      const totalClassWeeks = semestersList.value.reduce((total, semester) => total + toNumber(semester.classWeeks), 0);

      return {
        totalCycles,
        totalSubjects,
        totalCredits,
        totalClassWeeks,
      };
    });

    const progressStats = computed(() => {
      const configuredCredits = stats.value.totalCredits;
      const requiredCredits = gridConfig.value.totalRequiredCredits || 0;
      const percentage = requiredCredits > 0 ? Math.min((configuredCredits / requiredCredits) * 100, 100) : 0;
      const missingCredits = Math.max(requiredCredits - configuredCredits, 0);

      return {
        configuredCredits,
        requiredCredits,
        percentage: Number(percentage.toFixed(1)),
        mandatoryCredits: configuredCredits,
        electiveCredits: 0,
        missingCredits,
      };
    });

    const fullCurriculumDraft = computed<ProgramCurriculumFullPayload>(() => ({
      curriculumPeriods: semestersList.value.map((semester) => ({
        ...(semester.persistedId ? { id: semester.persistedId } : {}),
        programCurriculumId: currentCurriculumId.value,
        name: semester.name,
        code: semester.code,
        description: semester.description,
        state: semester.state,
        periodSubjects: semester.subjects
          .filter((subject) => Boolean(subject.subjectId))
          .map((subject) => ({
            ...(subject.periodSubjectId ? { id: subject.periodSubjectId } : {}),
            ...(!subject.periodSubjectId ? { curriculumPeriodId: semester.persistedId || semester.id } : {}),
            subjectId: toNumber(subject.subjectId),
            prerequisiteIds: Array.isArray(subject.prerequisiteIds) ? subject.prerequisiteIds.filter((prerequisiteId) => Number.isFinite(prerequisiteId)) : [],
          })),
      })),
    }));

    const hasPersistedPeriods = computed(() => semestersList.value.some((semester) => Boolean(semester.persistedId)));

    const canSaveGrid = computed(() => Boolean(currentCurriculumId.value) && semestersList.value.length > 0);

    const associatedSubjectIds = computed(() => {
      const ids = semestersList.value.flatMap((semester) => semester.subjects.map((subject) => subject.subjectId).filter((subjectId): subjectId is number => Boolean(subjectId)));

      return [...new Set(ids)];
    });

    const hasGridData = computed(() => Boolean(gridConfig.value.id));

    const saveGridCurriculum = async () => {
      if (!canSaveGrid.value) {
        toastService.show('No hay una malla curricular lista para guardar.', 'error');
        return;
      }

      const isEditingCurriculum = hasPersistedPeriods.value;
      isSavingGrid.value = true;

      try {
        await saveFullProgramCurriculumService.run(currentCurriculumId.value, fullCurriculumDraft.value);
        await loadGridConfiguration();

        toastService.show(isEditingCurriculum ? 'La malla curricular se actualizó correctamente.' : 'La malla curricular se guardó correctamente.', 'success');
      } catch (error) {
        console.error('Error al guardar la malla curricular:', error);
        toastService.show('No fue posible guardar la malla curricular.', 'error');
      } finally {
        isSavingGrid.value = false;
      }
    };

    return {
      loading,
      isSavingGrid,
      loadError,
      hasGridData,
      isExportModalOpen,
      gridConfig,
      semestersWithTotals,
      stats,
      progressStats,
      isReadOnlyView,
      canSaveGrid,
      hasPersistedPeriods,
      associatedSubjectIds,
      isSubjectDrawerOpen,
      selectedSemesterForSubject,
      openSubjectDrawer,
      closeSubjectDrawer,
      addSubjectToSemester,
      isDetailDrawerOpen,
      selectedSubjectForDetail,
      selectedSemesterNumberForDetail,
      closeDetailDrawer,
      saveSubjectDetails,
      editSubject,
      deleteSubject,
      saveGridCurriculum,
      goBack,
      getSubjectKey,
      getStatusBadgeClass,
      fullCurriculumDraft,
    };
  },
});
</script>

<style scoped>
.text-orange {
  color: #ea580c !important;
}

.bg-primary-light {
  background-color: #eff6ff !important;
}

.bg-info-light {
  background-color: #eff6ff !important;
}

.bg-secondary-light {
  background-color: #f3f4f6 !important;
}

.bg-success-light {
  background-color: #f0fdf4 !important;
}

.bg-warning-light {
  background-color: #fef3c7 !important;
}

.text-info {
  color: #2563eb !important;
}
</style>
