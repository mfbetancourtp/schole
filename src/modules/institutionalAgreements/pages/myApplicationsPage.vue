<template>
  <AppBaseList title="Mis Postulaciones a Convenios">
    <template #actions>
      <AppButton outlined @click="goToAvailable" style="color: white">
        <AppIcon icon="search" />
        Explorar convenios
      </AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="myApplicationsPage">
        <!-- Page intro -->
        <div>
          <h1 class="h3 mb-0">Mis Postulaciones a Convenios</h1>
          <p class="small text-muted">Consulta el estado y avance de tus postulaciones a convenios institucionales.</p>
        </div>

        <!-- 4 stat cards -->
        <div class="statsRow">
          <div class="statCard statCard--blue">
            <div class="statCard__iconWrap statCard__iconWrap--blue">
              <AppIcon icon="paper-plane" />
            </div>
            <div class="statCard__info">
              <span class="statCard__value">{{ appStats.totalApplications }}</span>
              <span class="statCard__label">Postulaciones enviadas</span>
            </div>
          </div>

          <div class="statCard statCard--orange">
            <div class="statCard__iconWrap statCard__iconWrap--orange">
              <AppIcon icon="clock" />
            </div>
            <div class="statCard__info">
              <span class="statCard__value">{{ appStats.inReview }}</span>
              <span class="statCard__label">En revisión</span>
            </div>
          </div>

          <div class="statCard statCard--green">
            <div class="statCard__iconWrap statCard__iconWrap--green">
              <AppIcon icon="check-circle" />
            </div>
            <div class="statCard__info">
              <span class="statCard__value">{{ appStats.approved }}</span>
              <span class="statCard__label">Aprobadas</span>
            </div>
          </div>

          <div class="statCard statCard--red">
            <div class="statCard__iconWrap statCard__iconWrap--red">
              <AppIcon icon="times-circle" />
            </div>
            <div class="statCard__info">
              <span class="statCard__value">{{ appStats.rejected }}</span>
              <span class="statCard__label">Rechazadas</span>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="d-flex gap-3 flex-wrap align-items-end">
          <AppFilter filter-name="myApplications.search">
            <label>Buscar</label>
            <input type="search" class="form-control" v-model="searchQuery" placeholder="Nombre del convenio o institución..." />
          </AppFilter>
          <AppFilter v-model="statusFilter" filter-name="myApplications.status">
            <label>Estado</label>
            <AppAutocomplete :options="statusOptions" :reduce="(o: any) => o" v-model="statusFilter" input-id="statusFilter" />
          </AppFilter>
          <AppFilter v-model="typeFilter" filter-name="myApplications.type">
            <label>Tipo de convenio</label>
            <AppAutocomplete :options="typeOptions" v-model="typeFilter" :reduce="(o: any) => o.value" label="label" input-id="typeFilter" />
          </AppFilter>
          <AppFilter v-model="countryFilter" filter-name="myApplications.country">
            <label>País</label>
            <AppAutocomplete :options="countryOptions" v-model="countryFilter" :reduce="(o: any) => o.id" label="name" input-id="countryFilter" />
          </AppFilter>
          <AppButton v-if="hasActiveFilters" outlined @click="clearFilters">
            <AppIcon icon="times" />
            Limpiar filtros
          </AppButton>
        </div>

        <!-- Application cards grid -->
        <div class="cardsGrid" v-if="filteredApplications.length > 0">
          <div class="appCard" v-for="app in filteredApplications" :key="app.id">
            <!-- Card header -->
            <div class="appCard__header">
              <span class="appCard__programName">{{ app.agreementName || `Convenio #${app.agreementsInstitutionalId}` }}</span>
              <div class="appCard__headerActions">
                <AppButton outlined @click="viewDetail(app)">
                  <AppIcon icon="eye" />
                  Ver detalle
                </AppButton>
                <AppButton v-if="app.status === 'Pendiente de documentos'" class="btnUpload" @click="uploadDocs(app)">
                  <AppIcon icon="upload" />
                  Subir documentos
                </AppButton>
              </div>
            </div>

            <!-- Meta info -->
            <div class="appCard__meta">
              <span class="metaItem" v-if="app.institutionPartner">
                <AppIcon icon="university" />
                {{ app.institutionPartner }}
              </span>
              <span class="metaItem" v-if="app.countryName">
                <AppIcon icon="map-marker-alt" />
                {{ app.countryName }}
              </span>
              <span class="metaItem" v-if="app.estimatedStartDate">
                <AppIcon icon="calendar-alt" />
                Inicio estimado: {{ formatDate(app.estimatedStartDate) }}
              </span>
              <span class="metaItem" v-if="app.estimatedDuration">
                <AppIcon icon="clock" />
                {{ app.estimatedDuration }}
              </span>
            </div>

            <!-- Badges: type + status -->
            <div class="appCard__types">
              <span v-if="app.typeName" class="typeBadge typeBadge--default">
                {{ app.typeName }}
              </span>
              <span class="statusBadge" :class="statusBadgeClass(app.status)">
                {{ app.status }}
              </span>
            </div>

            <!-- Pendiente de documentos alert -->
            <div class="missingDocsAlert" v-if="app.status === 'Pendiente de documentos'">
              <AppIcon icon="exclamation-triangle" class="missingDocsAlert__icon" />
              <span>Tienes documentos pendientes de carga. Por favor súbelos para continuar con el proceso.</span>
            </div>

            <!-- Divider -->
            <div class="appCard__divider"></div>

            <!-- Progress -->
            <div class="appCard__progress">
              <div class="progressHeader">
                <span class="progressHeader__label">Progreso del proceso</span>
                <span class="progressHeader__pct" :class="progressPctClass(app.status)">{{ progressPct(app.status) }}%</span>
              </div>
              <div class="progressBar">
                <div class="progressBar__fill" :class="progressBarClass(app.status)" :style="{ width: progressPct(app.status) + '%' }"></div>
              </div>

              <!-- Steps track -->
              <div class="progressSteps">
                <template v-for="(step, idx) in progressSteps(app.status)" :key="idx">
                  <div
                    class="progressStep"
                    :class="{
                      'progressStep--done': step.completed,
                      'progressStep--current': step.current,
                    }"
                  >
                    <div class="progressStep__dot">
                      <AppIcon v-if="step.completed" icon="check" />
                    </div>
                    <span class="progressStep__label">{{ step.label }}</span>
                  </div>
                  <div
                    v-if="idx < 3"
                    class="progressStep__connector"
                    :class="{
                      'progressStep__connector--done': progressSteps(app.status)[idx + 1]?.completed || progressSteps(app.status)[idx + 1]?.current,
                    }"
                  ></div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div class="emptyState" v-else-if="applications.length === 0 || filteredApplications.length === 0">
          <AppIcon icon="folder-open" class="emptyState__icon" />
          <span class="emptyState__text">No se encontraron postulaciones con los filtros seleccionados.</span>
        </div>

        <!-- Confirm withdraw modal -->
        <AppModal v-model="withdrawModal">
          <AppConfirmDeleteModal v-if="withdrawModal" entity="postulación" @confirmDelete="doWithdraw" />
        </AppModal>

        <!-- Detail drawer -->
        <MyApplicationDetailDrawer :isVisible="showDetailDrawer" :application="selectedApplication" @update:isVisible="showDetailDrawer = $event" @cancel="confirmWithdraw($event)" />
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useRouter } from 'vue-router';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import MyApplicationDetailDrawer from '../components/MyApplicationDetailDrawer.vue';

import { ApplicationWithRelationsDto, AgreementsApplicationStatus, AgreementsApplicationStatsDto } from '../dtos/agreementsApplication.dto';
import { GetAgreementsApplicationsListService } from '../services/getAgreementsApplicationsList.service';
import { GetAgreementsApplicationStatsService } from '../services/getAgreementsApplicationStats.service';
import { DeleteAgreementsApplicationService } from '../services/deleteAgreementsApplication.service';
import { GetAgreementTypesService } from '../services/getAgreementTypes.service';
import { FindAllCountriesForSelectService } from '../../../shared/services/findAllCountriesForSelect.service';
import { useHeaderStore } from '../../../stores/header.store';

const getAgreementsApplicationsListService = new GetAgreementsApplicationsListService();
const getAgreementsApplicationStatsService = new GetAgreementsApplicationStatsService();
const deleteAgreementsApplicationService = new DeleteAgreementsApplicationService();
const getAgreementTypesService = new GetAgreementTypesService();
const findAllCountriesForSelectService = new FindAllCountriesForSelectService();

export default defineComponent({
  name: 'MyApplicationsPage',
  components: {
    AppBaseList,
    AppLoading,
    AppButton,
    AppIcon,
    AppFilter,
    AppAutocomplete,
    AppModal,
    AppConfirmDeleteModal,
    MyApplicationDetailDrawer,
  },
  setup() {
    useMeta({ title: 'Mis Postulaciones' });
    const router = useRouter();

    const loading = ref(true);
    const applications = ref<ApplicationWithRelationsDto[]>([]);
    const appStats = ref<AgreementsApplicationStatsDto>({
      totalApplications: 0,
      inReview: 0,
      approved: 0,
      rejected: 0,
    });

    const showDetailDrawer = ref(false);
    const selectedApplication = ref<ApplicationWithRelationsDto | null>(null);

    const withdrawModal = ref(false);
    const withdrawTarget = ref<ApplicationWithRelationsDto | null>(null);

    const searchQuery = ref('');
    const statusFilter = ref<AgreementsApplicationStatus | ''>('');
    const typeFilter = ref<number | null>(null);
    const countryFilter = ref<number | null>(null);

    const statusOptions: AgreementsApplicationStatus[] = ['Pendiente', 'Aprobada', 'Rechazada', 'Pendiente de documentos'];
    const typeOptions = ref<{ label: string; value: number }[]>([]);
    const countryOptions = ref<{ id: number; name: string }[]>([]);

    // Resolve display-friendly fields from API response relations
    const resolveFields = (app: ApplicationWithRelationsDto) => {
      const rel = (app as any).agreementsInstitutional;
      const name = app.agreementName || rel?.name;
      return {
        agreementsInstitutionalId: app.agreementsInstitutionalId || rel?.id,
        agreementName: name || `Convenio #${app.agreementsInstitutionalId ?? rel?.id ?? app.id}`,
        institutionPartner: app.institutionPartner || rel?.institutionPartner || '',
        countryName: app.countryName || rel?.country?.name || '',
        countryId: (app as any).countryId || rel?.country?.id || null,
        typeName: app.typeName || rel?.agreementsType?.name || '',
        agreementsTypesId: (app as any).agreementsTypesId || rel?.agreementsType?.id || null,
      };
    };

    const filteredApplications = computed(() => {
      const q = searchQuery.value.toLowerCase().trim();
      const s = statusFilter.value;
      const t = typeFilter.value;
      const c = countryFilter.value;
      return applications.value.filter((a: any) => {
        const matchSearch = !q || (a.agreementName || '').toLowerCase().includes(q) || (a.institutionPartner || '').toLowerCase().includes(q);
        const matchStatus = !s || a.status === s;
        const matchType = !t || a.agreementsTypesId === t;
        const matchCountry = !c || a.countryId === c;
        return matchSearch && matchStatus && matchType && matchCountry;
      });
    });

    const loadApplications = async () => {
      const res = await getAgreementsApplicationsListService.run({
        perPage: 100,
        page: 1,
      });
      const data: ApplicationWithRelationsDto[] = (res as any).data || [];
      applications.value = data.map((a) => ({ ...a, ...resolveFields(a) }));
    };

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Convenios Institucionales', url: '' };
        headerStorage.moduleItem = { name: 'Mis Postulaciones', url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
      } catch (e) {
        console.error('Error setting header:', e);
      }

      await Promise.allSettled([
        loadApplications(),
        getAgreementsApplicationStatsService.run().then((s) => {
          appStats.value = s;
        }),
        getAgreementTypesService.run({ perPage: 100 }).then((r) => {
          typeOptions.value = ((r as any).data || []).map((t: any) => ({
            label: t.name,
            value: t.id,
          }));
        }),
        findAllCountriesForSelectService.run({ perPage: 300 }).then((r) => {
          const raw = (r as any).data || r || [];
          countryOptions.value = raw.map((c: any) => {
            try {
              const t = typeof c.translations === 'string' ? JSON.parse(c.translations) : c.translations;
              return { id: c.id, name: t?.es || c.name };
            } catch {
              return { id: c.id, name: c.name };
            }
          });
        }),
      ]);

      // Re-mapear nombres de país con traducción al español ahora que countryOptions está cargado
      applications.value = applications.value.map((a: any) => ({
        ...a,
        countryName: countryOptions.value.find((c) => c.id === a.countryId)?.name || a.countryName,
      }));

      loading.value = false;
    });

    const clearFilters = () => {
      searchQuery.value = '';
      statusFilter.value = '';
      typeFilter.value = null;
      countryFilter.value = null;
    };

    const hasActiveFilters = computed(() => !!searchQuery.value || !!statusFilter.value || !!typeFilter.value || !!countryFilter.value);

    const goToAvailable = () => {
      router.push({ name: 'institutionalAgreements.availableAgreements' });
    };

    const viewDetail = (app: ApplicationWithRelationsDto) => {
      selectedApplication.value = app;
      showDetailDrawer.value = true;
    };

    const uploadDocs = (app: ApplicationWithRelationsDto) => {
      // TODO: abrir modal de carga de documentos usando CreateOrUpdateAgreementsApplicationDocumentService
    };

    const confirmWithdraw = (app: ApplicationWithRelationsDto) => {
      withdrawTarget.value = app;
      withdrawModal.value = true;
    };

    const doWithdraw = async () => {
      if (!withdrawTarget.value) return;
      try {
        await deleteAgreementsApplicationService.run(withdrawTarget.value.id);
        applications.value = applications.value.filter((a) => a.id !== withdrawTarget.value!.id);
        appStats.value = await getAgreementsApplicationStatsService.run();
      } catch {
        // interceptor maneja el toast de error
      } finally {
        withdrawModal.value = false;
        withdrawTarget.value = null;
      }
    };

    // ── Helpers ──

    const progressPct = (status: AgreementsApplicationStatus): number => {
      const map: Record<AgreementsApplicationStatus, number> = {
        Pendiente: 25,
        'Pendiente de documentos': 50,
        Aprobada: 100,
        Rechazada: 100,
      };
      return map[status] ?? 25;
    };

    const progressSteps = (status: AgreementsApplicationStatus) => {
      const isDocsPending = status === 'Pendiente de documentos';
      const isDone = status === 'Aprobada' || status === 'Rechazada';
      return [
        { label: 'Postulación enviada', completed: true, current: false },
        {
          label: 'Revisión inicial',
          completed: isDocsPending || isDone,
          current: status === 'Pendiente',
        },
        {
          label: 'Carga de documentos',
          completed: isDone,
          current: isDocsPending,
        },
        { label: 'Resultado', completed: isDone, current: false },
      ];
    };

    const formatDate = (dateStr?: string): string => {
      if (!dateStr) return '—';
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const [year, month, day] = parts;
      return `${parseInt(day)}/${parseInt(month)}/${year}`;
    };

    const statusBadgeClass = (status: AgreementsApplicationStatus): string => {
      const map: Record<AgreementsApplicationStatus, string> = {
        Pendiente: 'statusBadge--pending',
        'Pendiente de documentos': 'statusBadge--review',
        Aprobada: 'statusBadge--approved',
        Rechazada: 'statusBadge--rejected',
      };
      return map[status] ?? '';
    };

    const progressBarClass = (status: AgreementsApplicationStatus): string => {
      const map: Record<AgreementsApplicationStatus, string> = {
        Aprobada: 'progressBar__fill--green',
        Rechazada: 'progressBar__fill--red',
        'Pendiente de documentos': 'progressBar__fill--blue',
        Pendiente: 'progressBar__fill--orange',
      };
      return map[status] ?? '';
    };

    const progressPctClass = (status: AgreementsApplicationStatus): string => {
      const map: Record<AgreementsApplicationStatus, string> = {
        Aprobada: 'progressHeader__pct--green',
        Rechazada: 'progressHeader__pct--red',
        'Pendiente de documentos': 'progressHeader__pct--blue',
        Pendiente: 'progressHeader__pct--orange',
      };
      return map[status] ?? '';
    };

    return {
      loading,
      applications,
      filteredApplications,
      appStats,
      showDetailDrawer,
      selectedApplication,
      withdrawModal,
      searchQuery,
      statusFilter,
      typeFilter,
      countryFilter,
      statusOptions,
      typeOptions,
      countryOptions,
      hasActiveFilters,
      clearFilters,
      goToAvailable,
      viewDetail,
      uploadDocs,
      confirmWithdraw,
      doWithdraw,
      formatDate,
      statusBadgeClass,
      progressPct,
      progressSteps,
      progressBarClass,
      progressPctClass,
    };
  },
});
</script>

<style scoped>
.myApplicationsPage {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Stat cards ── */
.statsRow {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 900px) {
  .statsRow {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 480px) {
  .statsRow {
    grid-template-columns: 1fr;
  }
}

.statCard {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  min-width: 0;
  overflow: hidden;
  transition: box-shadow 0.15s;
}
.statCard:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
}

.statCard__iconWrap {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.statCard__iconWrap--blue {
  background: #eff6ff;
  color: #2563eb;
}
.statCard__iconWrap--orange {
  background: #fff7ed;
  color: #c2410c;
}
.statCard__iconWrap--green {
  background: #f0fdf4;
  color: #15803d;
}
.statCard__iconWrap--red {
  background: #fee2e2;
  color: #dc2626;
}

.statCard__info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}
.statCard__value {
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.1;
}
.statCard__label {
  font-size: 0.82rem;
  color: #6b7280;
  overflow-wrap: break-word;
  word-break: break-word;
}

/* ── Application cards grid ── */
.cardsGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* ── Application card ── */
.appCard {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.4rem 1.5rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  transition: box-shadow 0.15s;
}
.appCard:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
}

.appCard__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.appCard__headerActions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.appCard__programName {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

/* ── Status badges ── */
.statusBadge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.8rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}
.statusBadge--pending {
  background: #fef3c7;
  color: #d97706;
}
.statusBadge--review {
  background: #eff6ff;
  color: #2563eb;
}
.statusBadge--approved {
  background: #dcfce7;
  color: #16a34a;
}
.statusBadge--rejected {
  background: #fee2e2;
  color: #dc2626;
}

/* ── Card meta ── */
.appCard__meta {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.25rem;
}
.metaItem {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.83rem;
  color: #6b7280;
}

/* ── Type badges ── */
.appCard__types {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.typeBadge {
  display: inline-block;
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 600;
  border: 1.5px solid transparent;
}
.typeBadge--default {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #e5e7eb;
}

/* ── Missing docs alert ── */
.missingDocsAlert {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  font-size: 0.82rem;
  color: #92400e;
  line-height: 1.5;
}
.missingDocsAlert__icon {
  color: #f97316;
  font-size: 0.95rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

/* ── Divider ── */
.appCard__divider {
  width: 100%;
  height: 1px;
  background-color: #e5e7eb;
  flex-shrink: 0;
}

/* ── Progress ── */
.appCard__progress {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.progressHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.progressHeader__label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
}
.progressHeader__pct {
  font-size: 0.88rem;
  font-weight: 800;
}
.progressHeader__pct--blue {
  color: #2563eb;
}
.progressHeader__pct--green {
  color: #16a34a;
}
.progressHeader__pct--red {
  color: #dc2626;
}
.progressHeader__pct--orange {
  color: #d97706;
}

.progressBar {
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}
.progressBar__fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}
.progressBar__fill--blue {
  background: #3b82f6;
}
.progressBar__fill--green {
  background: #22c55e;
}
.progressBar__fill--red {
  background: #ef4444;
}
.progressBar__fill--orange {
  background: #f97316;
}

/* ── Progress steps ── */
.progressSteps {
  display: flex;
  align-items: flex-start;
  margin-top: 0.25rem;
}
.progressStep {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}
.progressStep__dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  color: #9ca3af;
}
.progressStep--done .progressStep__dot {
  background: #dcfce7;
  border-color: #86efac;
  color: #16a34a;
}
.progressStep--current .progressStep__dot {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #2563eb;
  box-shadow: 0 0 0 3px #dbeafe;
}
.progressStep__label {
  font-size: 0.68rem;
  color: #9ca3af;
  text-align: center;
  max-width: 68px;
  line-height: 1.3;
  white-space: normal;
  word-break: break-word;
}
.progressStep--done .progressStep__label {
  color: #374151;
}
.progressStep--current .progressStep__label {
  color: #2563eb;
  font-weight: 600;
}
.progressStep__connector {
  flex: 1;
  height: 2px;
  background: #e5e7eb;
  margin-top: 13px;
  min-width: 12px;
}
.progressStep__connector--done {
  background: #86efac;
}

/* ── Action buttons ── */
.btnUpload {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

/* ── Empty state ── */
.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 1rem;
  gap: 0.75rem;
  color: #9ca3af;
}
.emptyState__icon {
  font-size: 2.5rem;
}
.emptyState__text {
  font-size: 0.9rem;
  text-align: center;
}
</style>
