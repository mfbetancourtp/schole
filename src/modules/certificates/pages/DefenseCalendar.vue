<template>
  <AppBaseList :title="t('Calendario de Sustentaciones')">
    <template #actions>
      <AppButton @click="openNewDefenseDrawer" :label="t('Nueva Sustentación')" variant="light" icon-left="plus" />
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="defense-calendar">
        <!-- Welcome -->
        <div class="defense-calendar__welcome">
          <h2 class="defense-calendar__title">
            {{ t('Calendario de Sustentaciones') }}
          </h2>
          <p class="defense-calendar__subtitle">
            {{ t('Gestione fechas, horarios y modalidades de sustentación') }}
          </p>
        </div>

        <!-- Summary cards -->
        <div class="defense-calendar__stats">
          <AppStatCard :label="t('Programadas')" :value="data.summary.scheduled" :caption="t('Total')" icon="calendar-alt" variant="white" />
          <AppStatCard :label="t('Completadas')" :value="data.summary.completed" :caption="t('Total')" icon="calendar-check" variant="white" />
          <AppStatCard :label="t('Canceladas')" :value="data.summary.cancelled" :caption="t('Total')" icon="calendar-times" variant="white" />
          <AppStatCard :label="t('Presenciales')" :value="data.summary.inPerson" :caption="t('Total')" icon="map-marker-alt" variant="white" />
          <AppStatCard :label="t('Virtuales')" :value="data.summary.virtual" :caption="t('Total')" icon="video" variant="white" />
        </div>

        <!-- Defenses section -->
        <AppCardDashboard class="defense-calendar__list-card">
          <template #title>
            <div class="list-header">
              <h3 class="list-header__title">{{ t('Sustentaciones') }}</h3>
              <p class="list-header__subtitle">
                {{ t('Haga clic en una sustentación para ver o editar detalles') }}
              </p>
            </div>
          </template>

          <template #body>
            <!-- Tabs -->
            <ul class="nav nav-tabs mb-3">
              <li v-for="tab in statusTabs" :key="tab.value" class="nav-item">
                <button type="button" class="nav-link" :class="{ active: activeTab === tab.value }" @click="activeTab = tab.value">{{ t(tab.label) }} ({{ tab.count }})</button>
              </li>
            </ul>

            <!-- Defense cards -->
            <div class="list-items">
              <DefenseCard v-for="defense in filteredDefenses" :key="defense.id" :defense="defense" @click="openDetailDrawer" />
            </div>

            <!-- Empty state -->
            <AppEmptyResponse v-if="filteredDefenses.length === 0" title="No se encontraron sustentaciones" subtitle="Intente cambiar el filtro activo" :show-image="false" size="xs" />
          </template>
        </AppCardDashboard>
      </div>

      <!-- Detail drawer -->
      <AppDrawer :isVisible="drawerVisible" @update:isVisible="drawerVisible = $event" size="md">
        <template #head>
          <div class="drawer-head">
            <span class="drawer-head__title">
              {{ isNewDefense ? t('Programar Nueva Sustentación') : t('Detalles de Sustentación') }}
            </span>
            <span v-if="!isNewDefense && defenseDetail" class="drawer-head__subtitle">
              {{ defenseDetail.title }}
            </span>
          </div>
        </template>
        <template #body>
          <AppLoading v-if="drawerLoading" />
          <NewDefenseDrawer v-else-if="isNewDefense || isEditing" ref="newDefenseRef" :projectOptions="projectOptions" :initialForm="editingInitialForm" :disableProject="isEditing" />
          <DefenseDetailDrawer v-else-if="defenseDetail" :detail="defenseDetail" />
        </template>
        <template #footer>
          <!-- New defense footer -->
          <div v-if="isNewDefense" class="drawer-footer">
            <AppButton class="drawer-footer__edit" :label="t('Programar')" variant="primary" @click="handleCreateDefense" />
            <AppButton class="drawer-footer__close" :label="t('Cancelar')" variant="secondary" outlined @click="drawerVisible = false" />
          </div>
          <!-- Edit footer -->
          <div v-else-if="isEditing" class="drawer-footer">
            <AppButton class="drawer-footer__edit" :label="t('Guardar')" variant="primary" @click="handleUpdateDefense" />
            <AppButton class="drawer-footer__close" :label="t('Cancelar')" variant="secondary" outlined @click="cancelEdit" />
          </div>
          <!-- Detail footer -->
          <div v-else-if="defenseDetail" class="drawer-footer">
            <AppButton class="drawer-footer__edit" :label="t('Editar')" variant="primary" icon-left="edit" @click="startEdit" />
            <AppButton class="drawer-footer__close" :label="t('Cerrar')" variant="secondary" outlined @click="drawerVisible = false" />
          </div>
        </template>
      </AppDrawer>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';
import InstitutionsStore from '../../../shared/stores/institutions.store';
import { InstitutionsService } from '../../../shared/services/institutions.service';
import type { InstitutionDto } from '../../../shared/dto/institution.dto';

// Shared components
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';

import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';

// Module components
import DefenseCard from '../components/DefenseCard.vue';
import DefenseDetailDrawer from '../components/DefenseDetailDrawer.vue';
import NewDefenseDrawer from '../components/NewDefenseDrawer.vue';

// Services & types
import { GetDefenseCalendarService } from '../services/getDefenseCalendar.service';
import { GetDefenseCalendarStatsService } from '../services/getDefenseCalendarStats.service';
import { CreateOrUpdateDefenseCalendarService } from '../services/createOrUpdateDefenseCalendar.service';
import type {
  DefenseCalendarData,
  DefenseCalendarItemApi,
  DefenseCalendarStatusApi,
  DefenseCalendarFormatApi,
  CreateOrUpdateDefenseCalendarBodyDto,
  DefenseListItem,
  DefenseDetail,
  ProjectOption,
  DefenseStatus,
  DefenseModality,
  NewDefenseForm,
} from '../dtos/defenseCalendar.dto';

type TabValue = 'scheduled' | 'completed' | 'cancelled' | 'all';

export default defineComponent({
  name: 'DefenseCalendar',
  components: {
    AppBaseList,
    AppLoading,
    AppCardDashboard,
    AppDrawer,
    AppButton,
    AppStatCard,
    AppEmptyResponse,
    DefenseCard,
    DefenseDetailDrawer,
    NewDefenseDrawer,
  },
  setup() {
    const { t } = useI18n();
    useMeta({ title: 'Calendario de Sustentaciones' });

    const loading = ref(true);
    const data = ref<DefenseCalendarData>({
      summary: {
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        virtual: 0,
        inPerson: 0,
      },
      defenses: [],
    });
    const activeTab = ref<TabValue>('scheduled');

    const rawDefenses = ref<DefenseCalendarItemApi[]>([]);

    // Drawer state
    const drawerVisible = ref(false);
    const drawerLoading = ref(false);
    const defenseDetail = ref<DefenseDetail | null>(null);
    const isNewDefense = ref(false);
    const isEditing = ref(false);
    const projectOptions = ref<ProjectOption[]>([]);
    const newDefenseRef = ref<InstanceType<typeof NewDefenseDrawer> | null>(null);
    const editingInitialForm = ref<Partial<NewDefenseForm> | null>(null);
    const editingDefenseId = ref<number | null>(null);

    const institutionId = computed<number | null>(() => InstitutionsStore.state.selectedInstitution?.id ?? null);

    const ensureSelectedInstitution = () => {
      if (InstitutionsStore.state.selectedInstitution) return;

      const institutionsService = new InstitutionsService();
      const selected = institutionsService.getSelectedInstitution();
      if (selected) {
        InstitutionsStore.methods.setSelectedInstitution(selected);
        return;
      }

      const institutions = institutionsService.getInstitutions() as InstitutionDto[];
      if (institutions.length > 0) {
        InstitutionsStore.methods.setSelectedInstitution(institutions[0]);
      }
    };

    const mapStatus = (status: DefenseCalendarStatusApi | string): DefenseStatus => {
      const normalized = String(status).toLowerCase();
      if (normalized.includes('program')) return 'scheduled';
      if (normalized.includes('complet')) return 'completed';
      if (normalized.includes('cancel')) return 'cancelled';
      return 'scheduled';
    };

    const mapModality = (format: DefenseCalendarFormatApi | string): DefenseModality => (String(format).toLowerCase().includes('presen') ? 'inPerson' : 'virtual');

    const formatMonthShort = (date: Date) => date.toLocaleString('es-ES', { month: 'short' }).replace('.', '').toUpperCase();

    const pad2 = (n: number) => String(n).padStart(2, '0');

    const buildTimeRange = (time: string, durationMinutes: number) => {
      const [h, m] = time.split(':').map((v) => parseInt(v, 10));
      const startMinutes = h * 60 + m;
      const endMinutes = startMinutes + Math.max(0, durationMinutes);
      const endH = Math.floor(endMinutes / 60) % 24;
      const endM = endMinutes % 60;
      return `${pad2(h)}:${pad2(m)} - ${pad2(endH)}:${pad2(endM)}`;
    };

    const formatDateLong = (date: Date) =>
      date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

    const getPeopleFullName = (people?: { names?: string; lastnames?: string } | null) => {
      if (!people) return '';
      return `${people.names ?? ''} ${people.lastnames ?? ''}`.trim();
    };

    const getStudentLabel = (dto: DefenseCalendarItemApi) => {
      const leaderPeople = dto.applicationProject.user?.people ?? dto.applicationProject.users?.[0]?.people ?? null;
      const leader = getPeopleFullName(leaderPeople);

      const extraCount = dto.applicationProject.members?.length ?? 0;
      if (!extraCount) return leader;
      return `${leader} +${extraCount}`;
    };

    const buildProjectOptionsFromCalendar = (): ProjectOption[] => {
      const optionsById = new Map<number, string>();

      rawDefenses.value.forEach((item) => {
        const projectId = item.applicationProject?.id;
        if (!projectId) return;

        const name = item.applicationProject?.name ?? (item as any)?.title ?? `Proyecto #${projectId}`;
        const student = getStudentLabel(item);
        const label = student ? `${name} - ${student}` : name;

        if (!optionsById.has(projectId)) {
          optionsById.set(projectId, label);
        }
      });

      return Array.from(optionsById.entries()).map(([id, label]) => ({
        id,
        label,
      }));
    };

    const mapToListItem = (dto: DefenseCalendarItemApi): DefenseListItem => {
      const dateObj = new Date(`${dto.date}T${dto.time}`);
      const modality = mapModality(dto.format ?? dto.modality ?? 'Virtual');
      const location = modality === 'inPerson' ? dto.space?.name ?? dto.space?.code ?? 'Presencial' : dto.meetingLink ? 'Reunión virtual' : 'Virtual';

      return {
        id: dto.id,
        title: dto.applicationProject?.name ?? (dto as any)?.title ?? '',
        studentName: getStudentLabel(dto),
        status: mapStatus(dto.status),
        modality,
        date: dto.date,
        dayNumber: dateObj.getDate(),
        monthShort: formatMonthShort(dateObj),
        timeRange: buildTimeRange(dto.time, dto.duration),
        location,
        meetingLink: dto.meetingLink ?? undefined,
      };
    };

    const mapToDetail = (dto: DefenseCalendarItemApi): DefenseDetail => {
      const dateObj = new Date(`${dto.date}T${dto.time}`);
      const tutorPeople = dto.applicationProject.tutor?.people ?? dto.applicationProject.users?.[1]?.people ?? null;
      const tutor = getPeopleFullName(tutorPeople);

      const modality = mapModality(dto.format ?? dto.modality ?? 'Virtual');
      const location = modality === 'inPerson' ? dto.space?.name ?? dto.space?.code ?? 'Presencial' : 'Virtual';

      return {
        id: dto.id,
        title: dto.applicationProject?.name ?? (dto as any)?.title ?? '',
        status: mapStatus(dto.status),
        studentName: getStudentLabel(dto),
        tutorName: tutor,
        date: formatDateLong(dateObj),
        timeRange: buildTimeRange(dto.time, dto.duration),
        modality,
        location,
        meetingLink: dto.meetingLink ?? undefined,
        jury: [],
      };
    };

    const statusTabs = computed(() => {
      return [
        {
          value: 'scheduled' as TabValue,
          label: 'Programadas',
          count: data.value.summary.scheduled,
        },
        {
          value: 'completed' as TabValue,
          label: 'Completadas',
          count: data.value.summary.completed,
        },
        {
          value: 'cancelled' as TabValue,
          label: 'Canceladas',
          count: data.value.summary.cancelled,
        },
        {
          value: 'all' as TabValue,
          label: 'Todas',
          count: data.value.summary.scheduled + data.value.summary.completed + data.value.summary.cancelled,
        },
      ];
    });

    const filteredDefenses = computed(() => {
      return data.value.defenses;
    });

    const statusParam = computed<DefenseCalendarStatusApi | undefined>(() => {
      if (activeTab.value === 'scheduled') return 'Programada';
      if (activeTab.value === 'completed') return 'Completada';
      if (activeTab.value === 'cancelled') return 'Cancelada';
      return undefined;
    });

    const openDetailDrawer = async (defense: DefenseListItem) => {
      isNewDefense.value = false;
      isEditing.value = false;
      editingInitialForm.value = null;
      editingDefenseId.value = null;
      drawerVisible.value = true;
      drawerLoading.value = true;
      const raw = rawDefenses.value.find((d) => d.id === defense.id) ?? null;
      defenseDetail.value = raw ? mapToDetail(raw) : null;
      drawerLoading.value = false;
    };

    const openNewDefenseDrawer = async () => {
      isNewDefense.value = true;
      isEditing.value = false;
      editingInitialForm.value = null;
      editingDefenseId.value = null;
      defenseDetail.value = null;
      drawerVisible.value = true;
      drawerLoading.value = true;
      projectOptions.value = buildProjectOptionsFromCalendar();
      drawerLoading.value = false;
    };

    const startEdit = async () => {
      const id = defenseDetail.value?.id;
      const raw = rawDefenses.value.find((d) => d.id === id) ?? null;
      if (!raw) return;

      const modality = mapModality(raw.format ?? raw.modality ?? 'Virtual');
      const status = mapStatus(raw.status);

      isNewDefense.value = false;
      isEditing.value = true;
      editingDefenseId.value = raw.id;

      projectOptions.value = [
        {
          id: raw.applicationProject.id,
          label: raw.applicationProject?.name ?? (raw as any)?.title ?? `Proyecto #${raw.applicationProject.id}`,
        },
      ];

      editingInitialForm.value = {
        projectId: raw.applicationProject.id,
        date: raw.date,
        startTime: raw.time,
        duration: Math.max(0, Number(raw.duration ?? 0)) / 60,
        status,
        modality,
        meetingLink: raw.meetingLink ?? '',
      };
    };

    const cancelEdit = () => {
      isEditing.value = false;
      editingInitialForm.value = null;
      editingDefenseId.value = null;
    };

    const handleCreateDefense = async () => {
      const formData = (newDefenseRef.value as any)?.getFormData?.() as NewDefenseForm | undefined;
      if (!formData?.projectId) {
        return;
      }

      const statusMap: Record<DefenseStatus, DefenseCalendarStatusApi> = {
        scheduled: 'Programada',
        completed: 'Completada',
        cancelled: 'Cancelada',
      };

      const formatMap: Record<DefenseModality, DefenseCalendarFormatApi> = {
        inPerson: 'Presencial',
        virtual: 'Virtual',
      };

      const payload: CreateOrUpdateDefenseCalendarBodyDto = {
        applicationProjectsId: formData.projectId,
        date: formData.date,
        time: formData.startTime,
        duration: Math.max(0, Number(formData.duration ?? 0)) * 60,
        status: statusMap[formData.status],
        format: formatMap[formData.modality],
        spaceId: null,
        meetingLink: formData.meetingLink?.trim() ? formData.meetingLink.trim() : null,
      };

      const service = new CreateOrUpdateDefenseCalendarService();
      await service.run(payload, institutionId.value ? { institutionId: institutionId.value } : undefined);
      drawerVisible.value = false;
      await loadData();
    };

    const handleUpdateDefense = async () => {
      const formData = (newDefenseRef.value as any)?.getFormData?.() as NewDefenseForm | undefined;
      if (!formData?.projectId) {
        return;
      }

      const statusMap: Record<DefenseStatus, DefenseCalendarStatusApi> = {
        scheduled: 'Programada',
        completed: 'Completada',
        cancelled: 'Cancelada',
      };

      const formatMap: Record<DefenseModality, DefenseCalendarFormatApi> = {
        inPerson: 'Presencial',
        virtual: 'Virtual',
      };

      const payload: CreateOrUpdateDefenseCalendarBodyDto = {
        id: editingDefenseId.value ?? undefined,
        applicationProjectsId: formData.projectId,
        date: formData.date,
        time: formData.startTime,
        duration: Math.max(0, Number(formData.duration ?? 0)) * 60,
        status: statusMap[formData.status],
        format: formatMap[formData.modality],
        spaceId: null,
        meetingLink: formData.meetingLink?.trim() ? formData.meetingLink.trim() : null,
      };

      const service = new CreateOrUpdateDefenseCalendarService();
      await service.run(payload, institutionId.value ? { institutionId: institutionId.value } : undefined);
      isEditing.value = false;
      editingInitialForm.value = null;
      editingDefenseId.value = null;
      drawerVisible.value = false;
      await loadData();
    };

    const loadData = async () => {
      ensureSelectedInstitution();
      loading.value = true;
      try {
        const id = institutionId.value;
        if (!id) {
          rawDefenses.value = [];
          data.value = {
            summary: {
              scheduled: 0,
              completed: 0,
              cancelled: 0,
              virtual: 0,
              inPerson: 0,
            },
            defenses: [],
          };
          return;
        }

        const calendarService = new GetDefenseCalendarService();
        const statsService = new GetDefenseCalendarStatsService();

        const [items, stats] = await Promise.all([calendarService.run({ institutionId: id, status: statusParam.value }), statsService.run(id)]);
        rawDefenses.value = items;
        data.value = {
          summary: stats,
          defenses: items.map(mapToListItem),
        };
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Grados y títulos', url: '' };
      headerStorage.moduleItem = {
        name: 'Calendario de Sustentaciones',
        url: '',
      };
      headerStorage.moduleSubItem = { name: '', url: '' };
      loadData();
    });

    watch(
      () => institutionId.value,
      (next, prev) => {
        if (next && next !== prev) {
          loadData();
        }
      }
    );

    watch(
      () => activeTab.value,
      (next, prev) => {
        if (next !== prev) {
          loadData();
        }
      }
    );

    return {
      t,
      loading,
      data,
      activeTab,
      statusTabs,
      filteredDefenses,
      drawerVisible,
      drawerLoading,
      defenseDetail,
      isNewDefense,
      isEditing,
      projectOptions,
      newDefenseRef,
      editingInitialForm,
      openDetailDrawer,
      openNewDefenseDrawer,
      startEdit,
      cancelEdit,
      handleCreateDefense,
      handleUpdateDefense,
    };
  },
});
</script>

<style scoped>
.defense-calendar {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 10px 0;
}

/* Welcome */
.defense-calendar__welcome {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.defense-calendar__title {
  font-family: 'Roboto', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.defense-calendar__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 0;
}

/* Stats */
.defense-calendar__stats {
  display: flex;
  gap: 24px;
}

.defense-calendar__stats > * {
  flex: 1;
  min-width: 0;
}

/* List card */
.defense-calendar__list-card {
  width: 100%;
}

.list-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-header__title {
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.list-header__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  margin: 0;
}

/* Nav tabs */
.defense-calendar__list-card :deep(.nav.nav-tabs) {
  width: 100%;
}

/* List items */
.list-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

/* Drawer */
.drawer-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drawer-head__title {
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-light);
}

.drawer-head__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: var(--color-light);
}

.drawer-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.drawer-footer__edit {
  width: 50%;
}

.drawer-footer__close {
  width: 50%;
}
</style>
