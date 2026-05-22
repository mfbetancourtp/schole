<template>
  <AppBaseList title="Postulaciones">
    <template #actions>
      <AppButton outlined @click="goBack" style="color: white">
        <AppIcon icon="arrow-left" />
        Volver a Convenios
      </AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="applicationsPage">
        <!-- Agreement info header card -->
        <div class="agreementCard" v-if="agreement">
          <div class="agreementCard__left">
            <span class="agreementCard__name">{{ agreement.name }}</span>
            <div class="agreementCard__meta">
              <span class="tipoBadge" :class="tipoClass(agreement.agreementsType?.name)">{{ agreement.agreementsType?.name }}</span>
              <span class="metaItem">
                <AppIcon icon="university" />
                {{ agreement.institutionPartner }}
              </span>
              <span class="metaItem">
                <AppIcon icon="globe" />
                {{ countryName }}
              </span>
              <span class="metaItem">
                <AppIcon icon="calendar-alt" />
                {{ formatDate(agreement.starDay) }} –
                {{ formatDate(agreement.endDate) }}
              </span>
            </div>
          </div>
          <span class="agreementBadge" :class="agreementStatusClass(agreement.agreementStatus)">
            {{ agreement.agreementStatus }}
          </span>
        </div>

        <!-- 5 stat cards -->
        <div class="statsRow">
          <div class="statCard statCard--blue">
            <div class="statCard__iconWrap statCard__iconWrap--blue">
              <AppIcon icon="users" />
            </div>
            <div class="statCard__info">
              <span class="statCard__value">{{ stats.total }}</span>
              <span class="statCard__label">Total Postuladas</span>
            </div>
          </div>

          <div class="statCard statCard--green">
            <div class="statCard__iconWrap statCard__iconWrap--green">
              <AppIcon icon="check-circle" />
            </div>
            <div class="statCard__info">
              <span class="statCard__value">{{ stats.aprobadas }}</span>
              <span class="statCard__label">Aprobadas</span>
            </div>
          </div>

          <div class="statCard statCard--orange">
            <div class="statCard__iconWrap statCard__iconWrap--orange">
              <AppIcon icon="clock" />
            </div>
            <div class="statCard__info">
              <span class="statCard__value">{{ stats.pendientes }}</span>
              <span class="statCard__label">Pendientes</span>
            </div>
          </div>

          <div class="statCard statCard--red">
            <div class="statCard__iconWrap statCard__iconWrap--red">
              <AppIcon icon="times-circle" />
            </div>
            <div class="statCard__info">
              <span class="statCard__value">{{ stats.rechazadas }}</span>
              <span class="statCard__label">Rechazadas</span>
            </div>
          </div>

          <div class="statCard statCard--purple">
            <div class="statCard__iconWrap statCard__iconWrap--purple">
              <AppIcon icon="user-plus" />
            </div>
            <div class="statCard__info">
              <span class="statCard__value">
                {{ stats.cuposDisponibles }}
                <span class="statCard__sub">de {{ stats.cuposTotales }} totales</span>
              </span>
              <span class="statCard__label">Cupos Disponibles</span>
            </div>
          </div>
        </div>

        <!-- Tabla de postulaciones -->
        <AppDatatable name="applications" :service="getAgreementApplicationsService" :params="params" :default-per-page="10">
          <template #filters>
            <AppFilter v-model="statusFilter" filter-name="applications.status">
              <AppFormField label="Estado" capitalize>
                <AppAutocomplete :options="['Pendiente', 'Aprobada', 'Rechazada']" :reduce="(option: any) => option" v-model="statusFilter" input-id="statusFilter" />
              </AppFormField>
            </AppFilter>
            <AppFilter v-model="desdeFilter" filter-name="applications.desde">
              <AppFormField label="Desde">
                <input type="date" class="form-control" v-model="desdeFilter" />
              </AppFormField>
            </AppFilter>
            <AppFilter v-model="hastaFilter" filter-name="applications.hasta">
              <AppFormField label="Hasta">
                <input type="date" class="form-control" v-model="hastaFilter" />
              </AppFormField>
            </AppFilter>
          </template>

          <!-- # -->
          <AppDatatableColumn field="id" label="#" width="80" v-slot="props">
            <span class="documentCell">#{{ props.row.id }}</span>
          </AppDatatableColumn>

          <!-- Estudiante -->
          <AppDatatableColumn field="user" label="Estudiante" v-slot="props">
            <div class="d-flex flex-column">
              <span class="small fw-semibold text-gray-800">
                {{ props.row.user?.people ? `${props.row.user.people.names} ${props.row.user.people.lastnames}` : '—' }}
              </span>
              <span class="fs-8 text-muted">{{ props.row.user?.userToken || '' }}</span>
            </div>
          </AppDatatableColumn>

          <!-- Identificación -->
          <AppDatatableColumn field="identification" label="Identificación" width="140" v-slot="props">
            <span class="small text-gray-700">{{ props.row.user?.people?.identification || '—' }}</span>
          </AppDatatableColumn>

          <!-- Fecha postulación -->
          <AppDatatableColumn field="createdAt" label="Fecha postulación" sortable width="150" v-slot="props">
            <div class="dateCell">
              <AppIcon icon="calendar-alt" />
              <span>{{ formatDate(props.row.createdAt?.split('T')[0]) }}</span>
            </div>
          </AppDatatableColumn>

          <!-- Documentos -->
          <AppDatatableColumn field="uploadedDocuments" label="Documentos" width="140" position="centered" v-slot="props">
            <div class="docsCell">
              <span class="docsCell__count" :class="props.row.uploadedDocuments >= props.row.totalRequiredDocuments ? 'docsCell__count--ok' : 'docsCell__count--pending'">
                {{ props.row.uploadedDocuments }}/{{ props.row.totalRequiredDocuments }}
              </span>
              <div class="docsCell__bar">
                <div
                  class="docsCell__fill"
                  :class="props.row.uploadedDocuments >= props.row.totalRequiredDocuments ? 'docsCell__fill--ok' : 'docsCell__fill--pending'"
                  :style="{
                    width: props.row.totalRequiredDocuments > 0 ? (props.row.uploadedDocuments / props.row.totalRequiredDocuments) * 100 + '%' : '0%',
                  }"
                />
              </div>
            </div>
          </AppDatatableColumn>

          <!-- Estado -->
          <AppDatatableColumn field="status" label="Estado" sortable position="centered" v-slot="props">
            <span class="appStatusBadge" :class="appStatusClass(props.row.status)">
              {{ props.row.status }}
            </span>
          </AppDatatableColumn>

          <!-- Acciones -->
          <AppDatatableColumn label="Acciones" position="centered" width="120" v-slot="props">
            <div class="actionsCell">
              <AppButton outlined icon="eye" v-tooltip="'Ver detalle'" @click="viewApplication(props.row)" />
              <AppCheckPermission permission="institutionalAgreements.applications.update">
                <AppButton v-if="props.row.status === 'Pendiente'" outlined icon="check-circle" class="btnApprove" v-tooltip="'Aprobar'" @click="approveApplication(props.row)" />
                <AppButton v-if="props.row.status === 'Pendiente'" outlined icon="times-circle" class="btnReject" v-tooltip="'Rechazar'" @click="rejectApplication(props.row)" />
              </AppCheckPermission>
            </div>
          </AppDatatableColumn>
        </AppDatatable>

        <!-- Application detail drawer -->
        <ApplicationDetailDrawer
          :isVisible="showDetailDrawer"
          :application="selectedApplication"
          :agreement="agreement"
          :resolvedCountryName="countryName"
          @update:isVisible="showDetailDrawer = $event"
          @approve="onDrawerApprove"
          @reject="onDrawerReject"
          @statusChanged="onDrawerStatusChanged"
        />
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import ApplicationDetailDrawer from '../components/ApplicationDetailDrawer.vue';

import { InstitutionalAgreementDto } from '../dtos/institutionalAgreement.dto';
import { AgreementsApplicationDto } from '../dtos/agreementsApplication.dto';
import { GetInstitutionalAgreementByIdService } from '../services/getInstitutionalAgreementById.service';
import { GetAgreementApplicationsService } from '../services/getAgreementApplications.service';
import { GetAgreementApplicationsStatsService, AgreementApplicationsStatsDto } from '../services/getAgreementApplicationsStats.service';
import { GetAgreementsApplicationsListService } from '../services/getAgreementsApplicationsList.service';
import { FindAllCountriesForSelectService } from '../../../shared/services/findAllCountriesForSelect.service';
import { useHeaderStore } from '../../../stores/header.store';

const getInstitutionalAgreementByIdService = new GetInstitutionalAgreementByIdService();
const getAgreementApplicationsStatsService = new GetAgreementApplicationsStatsService();
const getAgreementsApplicationsListService = new GetAgreementsApplicationsListService();
const findAllCountriesForSelectService = new FindAllCountriesForSelectService();

export default defineComponent({
  name: 'AgreementApplicationsPage',
  components: {
    AppBaseList,
    AppLoading,
    AppButton,
    AppIcon,
    AppDatatable,
    AppDatatableColumn,
    AppFilter,
    AppFormField,
    AppAutocomplete,
    AppCheckPermission,
    ApplicationDetailDrawer,
  },
  setup() {
    useMeta({ title: 'Postulaciones' });

    const route = useRoute();
    const router = useRouter();
    const agreementId = Number(route.params.id);

    const loading = ref(true);
    const agreement = ref<InstitutionalAgreementDto | null>(null);
    const filterCountries = ref<{ id: number; name: string }[]>([]);
    const applications = ref<AgreementsApplicationDto[]>([]);
    const stats = ref<AgreementApplicationsStatsDto>({
      total: 0,
      aprobadas: 0,
      pendientes: 0,
      rechazadas: 0,
      pendienteDocs: 0,
      cuposTotales: 0,
      cuposDisponibles: 0,
    });

    const showDetailDrawer = ref(false);
    const selectedApplication = ref<AgreementsApplicationDto | null>(null);

    const getAgreementApplicationsService = new GetAgreementApplicationsService(agreementId);

    const statusFilter = ref<string>('');
    const desdeFilter = ref<string>('');
    const hastaFilter = ref<string>('');
    const refreshTrigger = ref<number>(0);

    const params = computed(() => ({
      status: statusFilter.value || undefined,
      desde: desdeFilter.value || undefined,
      hasta: hastaFilter.value || undefined,
      _refresh: refreshTrigger.value,
    }));

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Acuerdos Institucionales', url: '' };
        headerStorage.moduleItem = {
          name: 'Convenios Institucionales',
          url: '',
        };
        headerStorage.moduleSubItem = { name: 'Postulaciones', url: '' };
      } catch (e) {
        console.error('Error setting header:', e);
      }

      await Promise.allSettled([
        getInstitutionalAgreementByIdService
          .run(agreementId)
          .then((a) => {
            agreement.value = a;
          })
          .catch((e) => console.error('Error loading agreement:', e)),
        getAgreementApplicationsStatsService.run(agreementId).then((s) => {
          stats.value = s;
        }),
        findAllCountriesForSelectService.run({ perPage: 300 }).then((r) => {
          const raw = (r as any).data || r || [];
          filterCountries.value = (Array.isArray(raw) ? raw : []).map((c: any) => {
            try {
              const t = typeof c.translations === 'string' ? JSON.parse(c.translations) : c.translations;
              return { id: c.id, name: t?.es || c.name };
            } catch {
              return { id: c.id, name: c.name };
            }
          });
        }),
      ]);

      loading.value = false;
    });

    const clearFilters = () => {
      statusFilter.value = '';
      desdeFilter.value = '';
      hastaFilter.value = '';
    };

    const goBack = () => {
      router.push({ name: 'institutionalAgreements.agreements' });
    };

    const openDrawer = async (row: AgreementsApplicationDto) => {
      selectedApplication.value = row;
      showDetailDrawer.value = true;
      // Cargar el registro completo (motivation, area, languageLevel, etc.)
      // y hacer merge para preservar user.people que solo trae el datatable
      try {
        const res = await getAgreementsApplicationsListService.run({
          id: row.id,
          perPage: 50,
        });
        const records: any[] = (res as any)?.data || [];
        const full = records.find((r: any) => r.id === row.id) || null;
        if (full)
          selectedApplication.value = {
            ...full,
            user: (row as any).user ?? full.user,
          };
      } catch {
        // mantener el dato del datatable si falla
      }
    };

    const viewApplication = (row: AgreementsApplicationDto) => openDrawer(row);
    const approveApplication = (row: AgreementsApplicationDto) => openDrawer(row);
    const rejectApplication = (row: AgreementsApplicationDto) => openDrawer(row);

    const onDrawerApprove = ({ application }: { application: AgreementsApplicationDto }) => {
      const idx = applications.value.findIndex((a) => a.id === application.id);
      if (idx !== -1)
        applications.value[idx] = {
          ...applications.value[idx],
          status: 'Aprobada',
        };
      stats.value.aprobadas++;
      stats.value.pendientes = Math.max(0, stats.value.pendientes - 1);
      refreshTrigger.value++;
    };

    const onDrawerReject = ({ application }: { application: AgreementsApplicationDto }) => {
      const idx = applications.value.findIndex((a) => a.id === application.id);
      if (idx !== -1)
        applications.value[idx] = {
          ...applications.value[idx],
          status: 'Rechazada',
        };
      stats.value.rechazadas++;
      stats.value.pendientes = Math.max(0, stats.value.pendientes - 1);
      refreshTrigger.value++;
    };

    const onDrawerStatusChanged = ({ application }: { application: AgreementsApplicationDto }) => {
      const idx = applications.value.findIndex((a) => a.id === application.id);
      if (idx !== -1) {
        const oldStatus = applications.value[idx].status;
        applications.value[idx] = {
          ...applications.value[idx],
          status: application.status,
        };
        // Actualizar stats según el cambio de estado
        if (oldStatus === 'Pendiente' && application.status === 'Aprobada') {
          stats.value.pendientes = Math.max(0, stats.value.pendientes - 1);
          stats.value.aprobadas++;
        } else if (oldStatus === 'Pendiente' && application.status === 'Rechazada') {
          stats.value.pendientes = Math.max(0, stats.value.pendientes - 1);
          stats.value.rechazadas++;
        } else if (oldStatus === 'Aprobada' && application.status === 'Rechazada') {
          stats.value.aprobadas = Math.max(0, stats.value.aprobadas - 1);
          stats.value.rechazadas++;
        } else if (oldStatus === 'Rechazada' && application.status === 'Aprobada') {
          stats.value.rechazadas = Math.max(0, stats.value.rechazadas - 1);
          stats.value.aprobadas++;
        }
      }
      refreshTrigger.value++;
      // Refrescar stats del backend para sincronizar
      setTimeout(() => {
        getAgreementApplicationsStatsService.run(agreementId).then((s) => {
          stats.value = s;
        });
      }, 500);
    };

    const formatDate = (dateStr: string | null | undefined): string => {
      if (!dateStr) return '—';
      try {
        const [year, month, day] = dateStr.split('-');
        return `${parseInt(day)}/${parseInt(month)}/${year}`;
      } catch {
        return dateStr;
      }
    };

    const tipoClass = (tipo: string | undefined): string => {
      const map: Record<string, string> = {
        'Práctica Profesional': 'tipoBadge--practice',
        'Movilidad Internacional': 'tipoBadge--mobility',
        'Investigación Conjunta': 'tipoBadge--research',
        'Intercambio Cultural': 'tipoBadge--cultural',
      };
      return map[tipo ?? ''] ?? '';
    };

    const countryName = computed(() => {
      const countryId = (agreement.value as any)?.country?.id;
      if (countryId && filterCountries.value.length) {
        const found = filterCountries.value.find((c) => c.id === countryId);
        if (found) return found.name;
      }
      return (agreement.value as any)?.country?.name || '—';
    });

    const agreementStatusClass = (status: string | undefined): string => {
      const map: Record<string, string> = {
        Activo: 'agreementBadge--active',
        Borrador: 'agreementBadge--draft',
        Finalizado: 'agreementBadge--finished',
        Cerrado: 'agreementBadge--suspended',
      };
      return map[status ?? ''] ?? '';
    };

    const appStatusClass = (status: string): string => {
      const map: Record<string, string> = {
        Pendiente: 'appStatusBadge--pending',
        Aprobada: 'appStatusBadge--approved',
        Rechazada: 'appStatusBadge--rejected',
        'Pendiente de documentos': 'appStatusBadge--review',
      };
      return map[status] ?? '';
    };

    return {
      loading,
      agreement,
      countryName,
      stats,
      statusFilter,
      desdeFilter,
      hastaFilter,
      params,
      refreshTrigger,
      showDetailDrawer,
      selectedApplication,
      goBack,
      clearFilters,
      viewApplication,
      approveApplication,
      rejectApplication,
      onDrawerApprove,
      onDrawerReject,
      onDrawerStatusChanged,
      formatDate,
      tipoClass,
      agreementStatusClass,
      appStatusClass,
      getAgreementApplicationsService,
    };
  },
});
</script>

<style scoped>
.applicationsPage {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Agreement header card ── */
.agreementCard {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.agreementCard__left {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 0;
}

.agreementCard__name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.agreementCard__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.metaItem {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.83rem;
  color: #6b7280;
}

.agreementBadge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.agreementBadge--active {
  background: #dcfce7;
  color: #16a34a;
}
.agreementBadge--draft {
  background: #fef3c7;
  color: #d97706;
}
.agreementBadge--finished {
  background: #f3f4f6;
  color: #6b7280;
}
.agreementBadge--suspended {
  background: #fee2e2;
  color: #dc2626;
}

/* ── Tipo badge ── */
.tipoBadge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  border: 1.5px solid transparent;
  width: fit-content;
}

.tipoBadge--practice {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}
.tipoBadge--mobility {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}
.tipoBadge--research {
  background: #fff7ed;
  color: #c2410c;
  border-color: #fed7aa;
}
.tipoBadge--cultural {
  background: #faf5ff;
  color: #7c3aed;
  border-color: #ddd6fe;
}

/* ── 5 stat cards ── */
.statsRow {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.75rem;
}

@media (max-width: 1200px) {
  .statsRow {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .statsRow {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.statCard {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
  overflow: hidden;
}

.statCard__iconWrap {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.statCard__iconWrap--blue {
  background: #eff6ff;
  color: #2563eb;
}
.statCard__iconWrap--green {
  background: #f0fdf4;
  color: #15803d;
}
.statCard__iconWrap--orange {
  background: #fff7ed;
  color: #c2410c;
}
.statCard__iconWrap--red {
  background: #fee2e2;
  color: #dc2626;
}
.statCard__iconWrap--purple {
  background: #f5f3ff;
  color: #7c3aed;
}

.statCard__info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.statCard__value {
  font-size: 1.7rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.1;
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.statCard__sub {
  font-size: 0.72rem;
  font-weight: 500;
  color: #9ca3af;
}

.statCard__label {
  font-size: 0.82rem;
  color: #6b7280;
  overflow-wrap: break-word;
  word-break: break-word;
}

/* ── Filters bar ── */
.filtersBar {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.75rem 0 0.25rem;
}

.filtersBar__inputs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.filtersBar__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.filtersBar__search {
  min-width: 200px;
}
.filtersBar__select {
  min-width: 160px;
  width: auto;
}
.filtersBar__date {
  min-width: 140px;
}

/* ── Table cells ── */
.studentCell {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.studentInfo {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
}

.studentInfo__name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
}

.studentInfo__semester {
  font-size: 0.75rem;
  color: #9ca3af;
}

.documentCell {
  font-size: 0.85rem;
  color: #374151;
  font-family: monospace;
}

.gradeCell {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.88rem;
  font-weight: 700;
  color: #111827;
  justify-content: center;
}

.gradeCell__icon {
  color: #d97706;
  font-size: 0.9rem;
}

.dateCell {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #6b7280;
  white-space: nowrap;
}

/* ── Application status badge ── */
.appStatusBadge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.appStatusBadge--pending {
  background: #fef3c7;
  color: #d97706;
}
.appStatusBadge--approved {
  background: #dcfce7;
  color: #16a34a;
}
.appStatusBadge--rejected {
  background: #fee2e2;
  color: #dc2626;
}
.appStatusBadge--review {
  background: #eff6ff;
  color: #2563eb;
}

/* ── Docs cell ── */
.docsCell {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.88rem;
  font-weight: 700;
}

.docsCell__icon {
  font-size: 0.85rem;
}

.docsCell--complete {
  color: #16a34a;
}
.docsCell--partial {
  color: #d97706;
}
.docsCell--empty {
  color: #dc2626;
}

/* ── Actions ── */
.actionsCell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  flex-wrap: nowrap;
}

/* ── Docs cell ── */
.docsCell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}
.docsCell__count {
  font-size: 0.82rem;
  font-weight: 700;
}
.docsCell__count--ok {
  color: #16a34a;
}
.docsCell__count--pending {
  color: #d97706;
}
.docsCell__bar {
  width: 72px;
  height: 5px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}
.docsCell__fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}
.docsCell__fill--ok {
  background: #22c55e;
}
.docsCell__fill--pending {
  background: #f59e0b;
}

.btnApprove {
  border-color: #bbf7d0;
  color: #15803d;
}
.btnReject {
  border-color: #fecaca;
  color: #dc2626;
}
</style>
