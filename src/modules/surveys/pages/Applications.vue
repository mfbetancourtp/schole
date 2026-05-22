<template>
  <AppBaseList :title="title" :routes="routes">
    <template #actions>
      <AppButton style="color: white" outlined @click="exportApplications">
        <AppIcon icon="download" class="me-2" />
        Exportar
      </AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="applicationsPage">
        <!-- Stat cards -->
        <div class="row g-3 mb-4">
          <div class="col-12 col-md-6 col-xl-3">
            <AppStatCard label="Total postulantes" :value="stats.total" caption="Inscritos en el proceso" icon="users" variant="blue" />
          </div>
          <div class="col-12 col-md-6 col-xl-3">
            <AppStatCard label="En proceso" :value="stats.inProcess" caption="Postulaciones activas" icon="clock" variant="yellow" />
          </div>
          <div class="col-12 col-md-6 col-xl-3">
            <AppStatCard label="Admitidos" :value="stats.admitted" caption="Con resultado favorable" icon="check-circle" variant="green" />
          </div>
          <div class="col-12 col-md-6 col-xl-3">
            <AppStatCard label="Nuevos" :value="stats.newStudents" caption="Aspirantes de primer ingreso" icon="user-plus" variant="gray" />
          </div>
        </div>

        <AppDatatable name="surveys-applications" :service="applicationsTableService" :params="filterParams" :paginated="true" :default-per-page="10">
          <template #additionalContent>
            <div class="applicationsPage__tableHead">
              <div class="applicationsPage__title">
                <div class="applicationsPage__titleLabel">
                  <AppIcon icon="users" class="me-2" />
                  Postulaciones
                </div>
              </div>
              <p class="applicationsPage__tableHint">Gestiona, filtra y da seguimiento al estado de los postulantes de los procesos de admisión.</p>
            </div>
          </template>

          <template #filters>
            <AppFilter v-model="selectedProgramId" filter-name="applications.program">
              <label>Programa</label>
              <AppAutocomplete
                input-id="applications-program-filter"
                :options="programOptions"
                label="name"
                :reduce="(o: any) => o.id"
                :clearable="true"
                :filterable="false"
                v-model="selectedProgramId"
                @search="searchProgramOptions"
              />
            </AppFilter>

            <AppFilter v-model="selectedConvocationId" filter-name="applications.convocation">
              <label>Convocatoria</label>
              <AppAutocomplete
                input-id="applications-convocation-filter"
                :options="convocationOptions"
                label="title"
                :reduce="(o: any) => o.id"
                :clearable="true"
                :filterable="false"
                v-model="selectedConvocationId"
                @search="searchConvocationOptions"
              />
            </AppFilter>

            <AppFilter v-model="selectedStatus" filter-name="applications.status">
              <label>Estado</label>
              <AppAutocomplete input-id="applications-status-filter" :options="statusOptions" label="label" :reduce="(o: any) => o.key" :clearable="true" v-model="selectedStatus" />
            </AppFilter>
          </template>

          <!-- Postulante: avatar + nombre + correo -->
          <AppDatatableColumn label="Postulante" field="fullName" sortable width="280" v-slot="{ row }">
            <div class="applicationsPage__studentCell">
              <AppAvatar :name="row.fullName" :src="row.avatar" size="sm" />
              <div class="applicationsPage__studentInfo">
                <strong>{{ row.fullName }}</strong>
                <small>{{ row.email }}</small>
              </div>
            </div>
          </AppDatatableColumn>

          <!-- Identificación -->
          <AppDatatableColumn label="Identificación" field="identification" sortable width="160" v-slot="{ row }">
            <span class="applicationsPage__mono">{{ row.identification }}</span>
          </AppDatatableColumn>

          <!-- Programa + convocatoria -->
          <AppDatatableColumn label="Programa" field="programName" sortable width="220" v-slot="{ row }">
            <div class="applicationsPage__programCell">
              <strong>{{ row.programName || '—' }}</strong>
              <small>{{ row.convocationTitle }}</small>
            </div>
          </AppDatatableColumn>

          <!-- Estado -->
          <AppDatatableColumn label="Estado" field="statusLabel" sortable width="150" position="centered" v-slot="{ row }">
            <AppBadge :label="row.statusLabel" :variant="getStatusVariant(row.status)" />
          </AppDatatableColumn>

          <!-- Progreso -->
          <AppDatatableColumn label="Progreso" field="progress" sortable width="200" v-slot="{ row }">
            <div class="applicationsPage__progressCell">
              <div class="applicationsPage__progressTrack">
                <div class="applicationsPage__progressFill" :class="getProgressClass(row.progress)" :style="{ width: `${row.progress}%` }"></div>
              </div>
              <span>{{ row.progress }}%</span>
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn label="Puntaje examen admisión" field="admissionExamScore" width="180" position="centered" v-slot="{ row }">
            <span class="applicationsPage__mono">{{ row.admissionExamScore }}</span>
          </AppDatatableColumn>

          <!-- Última actividad -->
          <AppDatatableColumn label="Última actividad" field="lastActivity" sortable width="150" v-slot="{ row }">
            <span class="applicationsPage__activityCell">{{ row.lastActivity }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn label="Acciones" width="160" position="centered" v-slot="{ row }">
            <AppButtonGroup :size="'sm'">
              <AppButton v-tooltip="'Ver detalle'" icon="eye" outlined @click="openDetailView(row)" />
              <AppButtonDelete @click="openConfirmDelete(row)" />
              <AppButton v-tooltip="'Acceder como estudiante'" icon="user-secret" outlined @click="enterAsRegistered(row)" />
            </AppButtonGroup>
          </AppDatatableColumn>
        </AppDatatable>
      </div>
    </template>
  </AppBaseList>

  <AppModal v-model="modalDelete">
    <AppConfirmDeleteModal v-if="modalDelete" entity="Inscrito" @confirmDelete="confirmDelete" @close="modalDelete = false" />
  </AppModal>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import type { ConvocationEnrollDto, ConvocationEnrollStatsDto, ConvocationEnrollStatusOptionDto } from '../dtos/convocationEnroll.dto';
import type { ApplicationStatus } from '../dtos/application.dto';
import type { VariantsConstant } from '../../../shared/constant/variants.constant';
import { GetApplicationsService } from '../services/getApplications.service';
import { GetConvocationEnrollStatsService } from '../services/getConvocationEnrollStats.service';
import { GetProgramsForFilterService } from '../services/getProgramsForFilter.service';
import { GetConvocationsForFilterService } from '../services/getConvocationsForFilter.service';
import { DeleteConvocationsEnrollsService } from '../services/deleteConvocationsEnrolls.service';
import { useHeaderStore } from '../../../stores/header.store';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';

const statusVariantMap: Record<string, VariantsConstant> = {
  interesado: 'secondary',
  postulante: 'warning',
  ingresante: 'primary',
  matriculado: 'success',
  in_process: 'warning',
  en_proceso: 'warning',
  admitted: 'success',
  admitido: 'success',
  applicant: 'primary',
  enrollee: 'primary',
  matriculated: 'success',
  waiting: 'secondary',
  en_espera: 'secondary',
  rejected: 'danger',
  rechazado: 'danger',
};

interface TableRow {
  id: number;
  fullName: string;
  email: string;
  avatar: string | null;
  identification: string;
  programName: string;
  convocationTitle: string;
  statusLabel: string;
  status: ApplicationStatus;
  progress: number;
  admissionExamScore: string;
  lastActivity: string;
  _raw: ConvocationEnrollDto;
}

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours}h`;
  if (days < 7) return `hace ${days} día${days !== 1 ? 's' : ''}`;
  return new Date(iso).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const normalizeApplicationStatus = (status?: string | null): ApplicationStatus => {
  const normalizedStatus = (status ?? '').toLowerCase();
  const statusMap: Record<string, ApplicationStatus> = {
    interested: 'interesado',
    interesado: 'interesado',
    applicant: 'postulante',
    postulante: 'postulante',
    enrollee: 'ingresante',
    ingresante: 'ingresante',
    admitted: 'admitido',
    admitido: 'admitido',
    matriculated: 'matriculado',
    matriculado: 'matriculado',
    in_process: 'en_proceso',
    en_proceso: 'en_proceso',
    waiting: 'en_espera',
    en_espera: 'en_espera',
    rejected: 'rechazado',
    rechazado: 'rechazado',
    retired: 'retirado',
    retirado: 'retirado',
  };

  return statusMap[normalizedStatus] ?? 'interesado';
};

const statusLabelFallback: Record<ApplicationStatus, string> = {
  interesado: 'Interesado',
  postulante: 'Postulante',
  ingresante: 'Ingresante',
  matriculado: 'Matriculado',
  en_proceso: 'En proceso',
  admitido: 'Admitido',
  rechazado: 'Rechazado',
  en_espera: 'En espera',
  retirado: 'Retirado',
};

const getFullName = (enroll: ConvocationEnrollDto): string => [enroll.people?.names, enroll.people?.lastnames].filter(Boolean).join(' ').trim() || '—';

const getProgressValue = (progress?: number | null): number => {
  const parsedProgress = Number(progress ?? 0);
  if (Number.isNaN(parsedProgress)) return 0;

  return Math.min(100, Math.max(0, parsedProgress));
};

const formatAdmissionExamScore = (score?: number | null): string => {
  if (score === null || score === undefined) return '—';

  return `${score}/100`;
};

const getServiceStatusLabel = (enroll: ConvocationEnrollDto): string => enroll.statusLabel || statusLabelFallback[normalizeApplicationStatus(enroll.status)];

export default defineComponent({
  name: 'ApplicationsPage',
  components: {
    AppAvatar,
    AppBadge,
    AppBaseList,
    AppButton,
    AppButtonDelete,
    AppButtonGroup,
    AppStatCard,
    AppDatatable,
    AppDatatableColumn,
    AppAutocomplete,
    AppFilter,
    AppIcon,
    AppLoading,
    AppModal,
    AppConfirmDeleteModal,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const title = 'Postulaciones';
    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    const loading = ref(true);
    const stats = ref<ConvocationEnrollStatsDto>({
      total: 0,
      inProcess: 0,
      admitted: 0,
      newStudents: 0,
    });
    const statusOptions = ref<ConvocationEnrollStatusOptionDto[]>([]);
    const selectedStatus = ref<string | null>(null);
    const selectedProgramId = ref<number | null>(null);
    const selectedConvocationId = ref<number | null>(null);
    const modalDelete = ref(false);
    const currentApplication = ref<TableRow | null>(null);

    const programOptions = ref<{ id: number; name: string }[]>([]);
    const convocationOptions = ref<{ id: number; title: string }[]>([]);
    const deleteConvocationsEnrollsService = new DeleteConvocationsEnrollsService();
    const updateDatatableService = new UpdateDatatableService();

    const searchProgramOptions = async (search: string, setLoading: (v: boolean) => void) => {
      setLoading(true);
      programOptions.value = await new GetProgramsForFilterService().run({
        search: search || undefined,
      });
      setLoading(false);
    };

    const searchConvocationOptions = async (search: string, setLoading: (v: boolean) => void) => {
      setLoading(true);
      convocationOptions.value = await new GetConvocationsForFilterService().run({
        search: search || undefined,
      });
      setLoading(false);
    };

    const filterParams = computed(() => ({
      status: selectedStatus.value ?? undefined,
      programId: selectedProgramId.value ?? undefined,
      convocationId: selectedConvocationId.value ?? undefined,
      order: 'ASC',
    }));

    const applicationsTableService = {
      async run(params: any) {
        const result = await new GetApplicationsService().run(params);
        const data = (result.data ?? []).map((e: ConvocationEnrollDto): TableRow => {
          const status = normalizeApplicationStatus(e.status);

          return {
            id: e.id,
            fullName: getFullName(e),
            email: e.people.email ?? '—',
            avatar: e.people.user?.avatar ?? null,
            identification: e.people.identification ?? '—',
            programName: e.offering?.program?.name ?? '',
            convocationTitle: e.convocation.title,
            statusLabel: getServiceStatusLabel(e),
            status,
            progress: getProgressValue(e.progress),
            admissionExamScore: formatAdmissionExamScore(e.admissionExamScore),
            lastActivity: timeAgo(e.updatedAt ?? e.createdAt),
            _raw: e,
          };
        });
        return { data, pagination: result.pagination };
      },
    };

    const getStatusVariant = (status: string): VariantsConstant => statusVariantMap[status] ?? 'secondary';

    const getProgressClass = (progress: number) => {
      if (progress >= 85) return 'applicationsPage__progressFill--success';
      if (progress >= 45) return 'applicationsPage__progressFill--warning';
      return 'applicationsPage__progressFill--danger';
    };

    const openDetailView = (row: TableRow) => {
      router.push({
        name: 'surveys.applicationDetail',
        params: { applicationId: row.id },
      });
    };

    const getApplicationInstitutionId = (row: TableRow) => row._raw.institutionId ?? row._raw.convocation?.institutionId ?? localStorage.getItem('institutionId');

    const enterAsRegistered = (row: TableRow) => {
      const institutionId = getApplicationInstitutionId(row);
      const convocationId = row._raw.convocation?.id;

      if (!institutionId || !convocationId) return;

      localStorage.setItem('administratorAsStudent', '1');
      window.open(
        router.resolve({
          name: 'surveys.userConvocations.registrationModern',
          params: {
            institutionId,
            convocationId,
            convocationEnrollId: row.id,
          },
        }).href,
        '_blank'
      );
    };

    const openConfirmDelete = (row: TableRow) => {
      currentApplication.value = row;
      modalDelete.value = true;
    };

    const confirmDelete = async () => {
      if (currentApplication.value?.id) {
        await deleteConvocationsEnrollsService.run(currentApplication.value.id);
        currentApplication.value = null;
        updateDatatableService.run();
        await loadData();
      }

      modalDelete.value = false;
    };

    const loadData = async () => {
      const [programsResult, convocationsResult, statsResult] = await Promise.all([
        new GetProgramsForFilterService().run(),
        new GetConvocationsForFilterService().run(),
        new GetConvocationEnrollStatsService().run(),
      ]);
      programOptions.value = programsResult;
      convocationOptions.value = convocationsResult;
      stats.value = statsResult.stats;
      statusOptions.value = statsResult.statusOptions;
    };

    const exportApplications = async () => {
      const result = await new GetApplicationsService().run({
        status: selectedStatus.value ?? undefined,
        programId: selectedProgramId.value ?? undefined,
        convocationId: selectedConvocationId.value ?? undefined,
        perPage: 1000,
      });
      const rows = (result.data ?? []).map((e: ConvocationEnrollDto) => {
        const progress = getProgressValue(e.progress);

        return {
          nombre: getFullName(e),
          identificacion: e.people.identification ?? '—',
          programa: e.offering?.program?.name ?? '—',
          convocatoria: e.convocation.title,
          estado: getServiceStatusLabel(e),
          progreso: `${progress}%`,
          puntajeExamenAdmision: formatAdmissionExamScore(e.admissionExamScore),
          ultimaActividad: timeAgo(e.updatedAt ?? e.createdAt),
          correo: e.people.email ?? '—',
        };
      });

      const headers = ['Nombre', 'Identificación', 'Programa', 'Convocatoria', 'Estado', 'Progreso', 'Puntaje examen admisión', 'Última actividad', 'Correo'];
      const csvRows = [
        headers.join(','),
        ...rows.map((row) =>
          Object.values(row)
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(',')
        ),
      ];

      const blob = new Blob([csvRows.join('\n')], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'postulaciones.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Admisión y Registro', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      await loadData();
      loading.value = false;
    });

    return {
      title,
      routes,
      loading,
      stats,
      statusOptions,
      selectedStatus,
      selectedProgramId,
      selectedConvocationId,
      modalDelete,
      programOptions,
      convocationOptions,
      searchProgramOptions,
      searchConvocationOptions,
      filterParams,
      applicationsTableService,
      getStatusVariant,
      getProgressClass,
      openDetailView,
      openConfirmDelete,
      enterAsRegistered,
      confirmDelete,
      exportApplications,
    };
  },
});
</script>

<style scoped>
.applicationsPage__tableHead {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.35rem 1.5rem 0.75rem;
}

.applicationsPage__search {
  max-width: 380px;
}

.applicationsPage__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.applicationsPage__titleLabel {
  display: inline-flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
}

.applicationsPage__tableHint {
  margin: 0;
  color: #64748b;
  line-height: 1.45;
}

.applicationsPage__studentCell {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.applicationsPage__studentInfo {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.applicationsPage__studentInfo strong,
.applicationsPage__programCell strong {
  color: #0f172a;
}

.applicationsPage__studentInfo small,
.applicationsPage__programCell small {
  color: #64748b;
  line-height: 1.4;
}

.applicationsPage__programCell {
  display: flex;
  flex-direction: column;
}

.applicationsPage__mono {
  font-family: 'Roboto Mono', monospace;
  color: #0f172a;
}

.applicationsPage__progressCell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.applicationsPage__progressTrack {
  flex: 1;
  min-width: 110px;
  height: 0.55rem;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}

.applicationsPage__progressFill {
  height: 100%;
  border-radius: inherit;
}

.applicationsPage__progressFill--success {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.applicationsPage__progressFill--warning {
  background: linear-gradient(90deg, #f59e0b, #f97316);
}

.applicationsPage__progressFill--danger {
  background: linear-gradient(90deg, #fb7185, #ef4444);
}

.applicationsPage__activityCell {
  color: #475569;
  font-weight: 500;
}

@media (max-width: 768px) {
  .applicationsPage__tableHead {
    padding: 1rem 1rem 0.25rem;
  }
}
</style>
