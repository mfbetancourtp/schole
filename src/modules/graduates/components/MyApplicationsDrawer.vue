<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="lg">
    <template #head>
      <AppDrawerHeader
        variant="view"
        icon="clipboard-list"
        title="Mis postulaciones"
        :subtitle="`${myApplications.length} postulación${myApplications.length !== 1 ? 'es' : ''} · ${savedVacancies.length} guardada${savedVacancies.length !== 1 ? 's' : ''}`"
      />
    </template>

    <template #body>
      <div class="drawer-section">
        <!-- Tabs -->
        <ul class="nav nav-tabs mb-3" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-postulaciones" role="tab">
              Postulaciones
              <span v-if="myApplications.length > 0" class="badge bg-secondary ms-1">{{ myApplications.length }}</span>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-guardadas" role="tab">
              Guardadas
              <span v-if="savedVacancies.length > 0" class="badge bg-primary ms-1">{{ savedVacancies.length }}</span>
            </button>
          </li>
        </ul>

        <div class="tab-content">
          <!-- Tab: Postulaciones -->
          <div class="tab-pane fade show active" id="tab-postulaciones" role="tabpanel">
            <AppLoading v-if="loading" />

            <template v-else>
              <div class="ma-stats">
                <div class="ma-stat-item">
                  <span class="ma-stat-num">{{ statTotal }}</span>
                  <span class="ma-stat-label">Total</span>
                </div>
                <div class="ma-stat-item">
                  <span class="ma-stat-num ma-stat-num--blue">{{ statEnProceso }}</span>
                  <span class="ma-stat-label">En proceso</span>
                </div>
                <div class="ma-stat-item">
                  <span class="ma-stat-num ma-stat-num--green">{{ statAvanzadas }}</span>
                  <span class="ma-stat-label">Avanzadas</span>
                </div>
                <div class="ma-stat-item">
                  <span class="ma-stat-num ma-stat-num--red">{{ statNoSeleccionado }}</span>
                  <span class="ma-stat-label">No seleccionado</span>
                </div>
              </div>

              <div v-if="myApplications.length === 0" class="ma-empty">
                <AppIcon icon="folder-open" class="ma-empty-icon" />
                <p>Aún no tienes postulaciones registradas.</p>
              </div>

              <div v-else class="ma-list">
                <div v-for="app in myApplications" :key="app.id" class="ma-card">
                  <div class="ma-card-logo">
                    <img v-if="app.companyLogo" :src="app.companyLogo" :alt="app.company" />
                    <span v-else class="ma-logo-placeholder">{{ app.company?.[0] ?? app.vacancyTitle?.[0] ?? '?' }}</span>
                  </div>
                  <div class="ma-card-info">
                    <p class="ma-card-title">
                      {{ app.vacancyTitle || `Vacante #${app.vacancyId}` }}
                    </p>
                    <p class="ma-card-company">
                      {{ app.company || 'Empresa' }}<span v-if="app.city"> · {{ app.city }}</span>
                    </p>
                    <div class="ma-card-meta">
                      <span><AppIcon icon="calendar-alt" /> {{ formatDate(app.appliedAt) }}</span>
                      <span v-if="app.modality"><AppIcon icon="building" /> {{ app.modality }}</span>
                    </div>
                  </div>
                  <div class="ma-card-right">
                    <span
                      class="ma-status-badge"
                      :style="{
                        backgroundColor: statusColor(app.status) + '22',
                        color: statusColor(app.status),
                      }"
                    >
                      {{ statusLabel(app.status) }}
                    </span>
                    <button
                      v-if="app.status !== 'rechazado' && app.status !== 'retirado'"
                      class="ma-withdraw-btn"
                      :disabled="withdrawingId === app.id"
                      @click="doWithdraw(app)"
                      title="Retirar postulación"
                    >
                      <AppIcon :icon="withdrawingId === app.id ? 'circle-notch' : 'times'" />
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Tab: Guardadas -->
          <div class="tab-pane fade" id="tab-guardadas" role="tabpanel">
            <div v-if="savedVacancies.length === 0" class="ma-empty">
              <AppIcon icon="bookmark" class="ma-empty-icon" />
              <p>No tienes vacantes guardadas.<br />Usa el icono <AppIcon icon="bookmark" /> en cualquier vacante para guardarla aquí.</p>
            </div>

            <div v-else class="ma-list">
              <div v-for="v in savedVacancies" :key="v.id" class="ma-card">
                <div class="ma-card-logo">
                  <img v-if="v.companyLogo" :src="v.companyLogo" :alt="v.company" />
                  <span v-else class="ma-logo-placeholder">{{ v.company?.[0] ?? '?' }}</span>
                </div>
                <div class="ma-card-info">
                  <p class="ma-card-title">{{ v.title }}</p>
                  <p class="ma-card-company">
                    {{ v.company }}<span v-if="v.city"> · {{ v.city }}</span>
                  </p>
                  <div class="ma-card-meta">
                    <span v-if="v.modality"><AppIcon icon="building" /> {{ modalityLabel(v.modality) }}</span>
                    <span v-if="v.contractType"><AppIcon icon="file-contract" /> {{ contractLabel(v.contractType) }}</span>
                  </div>
                </div>
                <div class="ma-card-right">
                  <div class="ma-saved-actions">
                    <AppButton outlined variant="secondary" size="sm" nativeType="button" @click="$emit('view', v)"> <AppIcon icon="eye" /> Ver </AppButton>
                    <span v-if="appliedIds.has(v.id)" class="ma-applied-badge"> <AppIcon icon="check-circle" /> Postulado </span>
                    <AppButton v-else variant="primary" size="sm" nativeType="button" @click="$emit('apply', v)"> <AppIcon icon="paper-plane" /> Postularme </AppButton>
                  </div>
                  <button class="ma-withdraw-btn" @click="$emit('unsave', v)" title="Eliminar de guardados">
                    <AppIcon icon="bookmark" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="d-flex align-items-center justify-content-end w-100">
        <AppButton outlined variant="secondary" nativeType="button" @click="$emit('update:isVisible', false)">Cerrar</AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, PropType } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import { ApplicationDto, ApplicationStatus, APPLICATION_STATUS_LABEL, APPLICATION_STATUS_COLOR, mapApiApplication } from '../dtos/application.dto';
import { VacancyDto, Modality, ContractType } from '../dtos/vacancy.dto';
import { GetApplicationsService } from '../services/getApplications.service';
import { WithdrawApplicationService } from '../services/withdrawApplication.service';
import { GetCompaniesService } from '../services/getCompanies.service';
import { GetJobVacanciesApplicationsStatsService } from '../services/getJobVacanciesApplicationsStats.service';
import { useUserStore } from '../../../stores/user';
import { ToastService } from '../../../shared/services/toast.service';

const MODALITY_LABEL: Record<Modality, string> = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido',
};

const CONTRACT_LABEL: Record<ContractType, string> = {
  'full-time': 'Tiempo completo',
  'part-time': 'Medio tiempo',
  contract: 'Contrato',
  internship: 'Pasantía',
  freelance: 'Freelance',
};

export default defineComponent({
  name: 'MyApplicationsDrawer',
  components: { AppDrawer, AppDrawerHeader, AppButton, AppIcon, AppLoading },
  props: {
    isVisible: { type: Boolean, required: true },
    savedVacancies: {
      type: Array as PropType<VacancyDto[]>,
      default: () => [],
    },
    appliedIds: {
      type: Object as PropType<Set<number>>,
      default: () => new Set(),
    },
  },
  emits: ['update:isVisible', 'withdraw', 'unsave', 'view', 'apply'],
  setup(props, { emit }) {
    const userStore = useUserStore();
    const toast = new ToastService();
    const getApplicationsService = new GetApplicationsService();
    const withdrawService = new WithdrawApplicationService();
    const companiesService = new GetCompaniesService();
    const statsService = new GetJobVacanciesApplicationsStatsService();

    const loading = ref(false);
    const myApplications = ref<ApplicationDto[]>([]);
    const withdrawingId = ref<number | null>(null);
    const statsMap = ref<Map<string, number>>(new Map());

    const statTotal = computed(() => Array.from(statsMap.value.values()).reduce((s, v) => s + v, 0));
    const statEnProceso = computed(() => (statsMap.value.get('En revisión') ?? 0) + (statsMap.value.get('Preseleccionado') ?? 0));
    const statAvanzadas = computed(() => (statsMap.value.get('Entrevista') ?? 0) + (statsMap.value.get('Oferta') ?? 0));
    const statNoSeleccionado = computed(() => statsMap.value.get('No seleccionado') ?? 0);

    const loadMyApplications = async () => {
      loading.value = true;
      try {
        const peopleId = userStore.user?.people?.id;
        const [res, companies, statsRaw] = await Promise.all([getApplicationsService.run({ peopleId }), companiesService.run({}).catch(() => []), statsService.run(peopleId!).catch(() => [])]);

        statsMap.value = new Map<string, number>((statsRaw ?? []).map((s: any) => [s.applicationStatus, s.total] as [string, number]));

        const companiesMap = new Map<number, string>((companies ?? []).map((c: any) => [c.id, c.name] as [number, string]));

        myApplications.value = (res?.data ?? []).map((a: any) => {
          const mapped = mapApiApplication(a);
          if (!mapped.company && a.jobVacancy?.companyId) {
            mapped.company = companiesMap.get(a.jobVacancy.companyId) ?? '';
          }
          return mapped;
        });
      } catch {
        myApplications.value = [];
      } finally {
        loading.value = false;
      }
    };

    watch(
      () => props.isVisible,
      (visible) => {
        if (visible) loadMyApplications();
      }
    );

    const statusLabel = (status: ApplicationStatus) => APPLICATION_STATUS_LABEL[status] ?? status;
    const statusColor = (status: ApplicationStatus) => APPLICATION_STATUS_COLOR[status] ?? '#6c757d';
    const modalityLabel = (m: Modality) => MODALITY_LABEL[m] ?? m;
    const contractLabel = (c: ContractType) => CONTRACT_LABEL[c] ?? c;

    const formatDate = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

    const doWithdraw = async (app: ApplicationDto) => {
      withdrawingId.value = app.id;
      try {
        await withdrawService.run(app.id);
        emit('withdraw', app);
        await loadMyApplications();
      } catch {
        // interceptor muestra el error del backend
      } finally {
        withdrawingId.value = null;
      }
    };

    return {
      loading,
      myApplications,
      withdrawingId,
      statTotal,
      statEnProceso,
      statAvanzadas,
      statNoSeleccionado,
      statusLabel,
      statusColor,
      modalityLabel,
      contractLabel,
      formatDate,
      doWithdraw,
    };
  },
});
</script>

<style scoped>
.drawer-section {
  padding: 20px;
}

.ma-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.ma-stat-item {
  flex: 1;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 12px 8px;
  text-align: center;
}
.ma-stat-num {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #374151;
  line-height: 1;
}
.ma-stat-num--blue {
  color: #2563eb;
}
.ma-stat-num--green {
  color: #16a34a;
}
.ma-stat-num--red {
  color: #dc3545;
}
.ma-stat-label {
  display: block;
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 4px;
}

.ma-empty {
  text-align: center;
  padding: 40px 16px;
  color: #9ca3af;
}
.ma-empty-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
  display: block;
}

.ma-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ma-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  transition: box-shadow 0.15s;
}
.ma-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}
.ma-card-logo {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #dee2e6;
}
.ma-card-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.ma-logo-placeholder {
  font-size: 1.1rem;
  font-weight: 700;
  color: #6c757d;
}
.ma-card-info {
  flex: 1;
}
.ma-card-title {
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 3px;
  font-size: 0.9rem;
}
.ma-card-company {
  color: #6c757d;
  font-size: 0.82rem;
  margin: 0 0 6px;
}
.ma-card-meta {
  display: flex;
  gap: 12px;
  font-size: 0.78rem;
  color: #9ca3af;
}
.ma-card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}
.ma-status-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}
.ma-withdraw-btn {
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #9ca3af;
  padding: 2px 7px;
  cursor: pointer;
  font-size: 0.78rem;
  transition: all 0.15s;
}
.ma-withdraw-btn:hover:not(:disabled) {
  border-color: #dc3545;
  color: #dc3545;
}
.ma-withdraw-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ma-saved-actions {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.ma-applied-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
</style>
