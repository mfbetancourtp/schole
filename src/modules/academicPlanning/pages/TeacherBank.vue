<template>
  <AppBaseList :title="title" :routes="routes">
    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="teacherBank">
        <AppCard>
          <template #body>
            <div class="row g-3 align-items-end teacherBank__selectorsRow">
              <div class="col-12 col-md-3 col-xl-2 teacherBank__selectorCol">
                <AppFormField label="Periodo académico">
                  <AppAutocomplete
                    class="teacherBank__topFilter"
                    :options="periodOptions"
                    :clearable="false"
                    :reduce="(option: SelectOption<number>) => option.id"
                    v-model="selectedAcademicPeriodId"
                    @search="handlePeriodSearch"
                  />
                </AppFormField>
              </div>
            </div>

            <div class="row g-3">
              <div v-for="card in summaryCards" :key="card.label" class="col-12 col-md-6 col-xl-3">
                <AppStatCard :label="card.label" :value="card.value" :caption="card.caption" :variant="card.variant" />
              </div>
            </div>
          </template>
        </AppCard>

        <div>
          <AppDatatable
            name="academic-planning-teacher-bank"
            :service="service"
            :params="params"
            :default-per-page="10"
            default-sort="id"
            default-sort-direction="asc"
            :show-filter-steps="true"
            @filter="applyPendingFilters"
            @filter-open="syncPendingFilters"
            @filter-cancel="syncPendingFilters"
          >
            <template #additionalContent>
              <div class="teacherBank__sectionTitle teacherBank__sectionTitle--between">
                <div>
                  <AppIcon icon="users" class="me-2" />
                  Banco de docentes
                </div>

                <AppBadge :label="`${teacherContractTotal} coincidencias`" variant="ghost" />
              </div>
            </template>

            <template #filters>
              <AppFilter>
                <AppFormField label="Tipo de contrato">
                  <AppAutocomplete
                    v-model="pendingContract"
                    :options="contractOptions"
                    input-id="teacher-bank-contract"
                    label="name"
                    :reduce="(option: SelectOption<number | 'all'>) => option.id"
                    :clearable="false"
                    :append-to-body="false"
                    placeholder="Tipo de contrato"
                  />
                </AppFormField>
              </AppFilter>

              <AppFilter>
                <AppFormField label="Disponibilidad">
                  <AppAutocomplete
                    input-id="teacher-bank-availability"
                    :options="availabilityOptions"
                    label="name"
                    :reduce="(option: SelectOption<TeacherAvailabilityApiState | 'all'>) => option.id"
                    :clearable="false"
                    :append-to-body="false"
                    placeholder="Disponibilidad"
                    v-model="pendingAvailability"
                  />
                </AppFormField>
              </AppFilter>
            </template>

            <AppDatatableColumn label="Nombre docente" field="fullName" sortable :width="280" v-slot="{ row }">
              <button type="button" class="teacherBank__rowLink" @click="openTeacherDetail(row)">
                <div class="teacherBank__teacherCell">
                  <AppAvatar :name="row.fullName" size="sm" />
                  <div>
                    <div class="fw-semibold text-dark">{{ row.fullName }}</div>
                    <small class="text-muted">
                      {{ row.identification ? `Identificación ${row.identification}` : `Carga actual de ${row.assignedHours} horas` }}
                    </small>
                  </div>
                </div>
              </button>
            </AppDatatableColumn>

            <AppDatatableColumn label="Tipo de contrato" field="contractTypeId" sortable v-slot="{ row }">
              {{ row.contractType?.name || '-' }}
            </AppDatatableColumn>

            <AppDatatableColumn label="Horas asignadas" field="assignedHours" sortable v-slot="{ row }">
              <div class="teacherBank__hours">
                <span>{{ row.assignedHours }}h / {{ row.maxHours }}h</span>
                <div class="teacherBank__progress">
                  <div
                    class="teacherBank__progressBar"
                    :class="`teacherBank__progressBar--${mapApiAvailabilityToLocalState(row.status)}`"
                    :style="{
                      width: `${getTeacherLoadPercentage(row)}%`,
                    }"
                  ></div>
                </div>
              </div>
            </AppDatatableColumn>

            <AppDatatableColumn label="Horas disponibles" field="availableHours" sortable v-slot="{ row }">
              <strong :class="`teacherBank__available--${mapApiAvailabilityToLocalState(row.status)}`"> {{ row.availableHours }}h </strong>
            </AppDatatableColumn>

            <AppDatatableColumn label="Estado" field="status" sortable v-slot="{ row }">
              <AppBadge :label="getAvailabilityLabel(row.status, row.statusLabel)" :variant="getAvailabilityVariant(row.status)" />
            </AppDatatableColumn>

            <AppDatatableColumn label="Acciones" :width="90" position="center" v-slot="{ row }">
              <AppButton type="button" icon="eye" outlined v-tooltip="'Ver detalle'" @click.stop="openTeacherDetail(row)" />
            </AppDatatableColumn>
          </AppDatatable>
        </div>
      </div>

      <TeacherBankDetailDrawer
        :isVisible="isDrawerVisible"
        :teacher-user-id="selectedTeacherUserId"
        :teacher-id="selectedTeacherId"
        :teacher-summary="selectedTeacher"
        :academic-period-id="selectedAcademicPeriodId"
        @update:isVisible="isDrawerVisible = $event"
        @saved="refreshTable"
      />
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import TeacherBankDetailDrawer from '../components/TeacherBankDetailDrawer.vue';

import type {
  AcademicLoadContractType,
  AcademicLoadPeriod,
  SelectOption,
  TeacherAvailabilityApiState,
  TeacherAvailabilityState,
  TeacherContractItem,
  TeacherBankStatsData,
  TeacherBankTeacher,
} from '../dtos/academicLoadManagement.dto';
import { getTeacherAvailabilityLabel, getTeacherAvailabilityVariant } from '../mocks/academicLoadManagement';
import { GetPlanningAcademicPeriodsService } from '../services/getPlanningAcademicPeriods.service';
import { GetContractTypesService } from '../services/getContractTypes.service';
import { GetTeacherContractsService } from '../services/getTeacherContracts.service';
import { GetTeacherBankStatsService } from '../services/getTeacherBankStats.service';
import { useHeaderStore } from '../../../stores/header.store';
import { useCheckDataTableStore } from '../../../stores/checkDataTable.store';

const getAcademicPeriodsService = new GetPlanningAcademicPeriodsService();
const getContractTypesService = new GetContractTypesService();
const getTeacherBankStatsService = new GetTeacherBankStatsService();

export default defineComponent({
  name: 'TeacherBankPage',
  components: {
    AppAutocomplete,
    AppAvatar,
    AppBadge,
    AppBaseList,
    AppButton,
    AppCard,
    AppDatatable,
    AppDatatableColumn,
    AppFilter,
    AppFormField,
    AppIcon,
    AppLoading,
    AppStatCard,
    TeacherBankDetailDrawer,
  },
  setup() {
    const { t } = useI18n();
    const title = 'Banco de docentes';
    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    const headerStorage = useHeaderStore();
    const checkDataTableStore = useCheckDataTableStore();
    const service = new GetTeacherContractsService();
    const loading = ref(true);

    const periodOptions = ref<SelectOption<number>[]>([]);
    const selectedAcademicPeriodId = ref<number | null>(null);
    const selectedContract = ref<number | 'all'>('all');
    const pendingContract = ref<number | 'all'>('all');
    const selectedAvailability = ref<TeacherAvailabilityApiState | 'all'>('all');
    const pendingAvailability = ref<TeacherAvailabilityApiState | 'all'>('all');
    const isDrawerVisible = ref(false);
    const selectedTeacher = ref<TeacherBankTeacher | null>(null);
    const selectedTeacherUserId = ref<number | null>(null);
    const selectedTeacherId = ref<number | null>(null);
    const teacherBankStats = ref<TeacherBankStatsData | null>(null);
    const contractTypeOptions = ref<SelectOption<number>[]>([]);

    const mapAcademicPeriodToOption = (academicPeriod: AcademicLoadPeriod): SelectOption<number> => ({
      id: academicPeriod.id,
      name: academicPeriod.code || academicPeriod.name,
    });

    const mapContractTypeToOption = (contractType: AcademicLoadContractType): SelectOption<number> => ({
      id: contractType.id,
      name: contractType.name,
    });

    const mapApiAvailabilityToLocalState = (state: TeacherAvailabilityApiState | null | undefined): TeacherAvailabilityState => {
      if (state === 'available') return 'disponible';
      if (state === 'near_limit') return 'cercano';

      return 'completo';
    };

    const isApiAvailabilityState = (state: TeacherAvailabilityApiState | TeacherAvailabilityState | null | undefined): state is TeacherAvailabilityApiState =>
      state === 'available' || state === 'near_limit' || state === 'no_availability';

    const resolveTeacherIdentifier = (teacherContract: TeacherContractItem) => teacherContract.teacherId ?? teacherContract.peopleId ?? teacherContract.userId ?? null;

    const getTeacherLoadPercentage = (teacher: Pick<TeacherContractItem, 'assignedHours' | 'maxHours'>) => {
      if (!teacher.maxHours) return 0;

      return Math.min((teacher.assignedHours / teacher.maxHours) * 100, 100);
    };

    const mapTeacherContractToTeacherDetail = (teacherContract: TeacherContractItem): TeacherBankTeacher => ({
      id: resolveTeacherIdentifier(teacherContract) ?? 0,
      contractRecordId: teacherContract.id,
      teacherId: resolveTeacherIdentifier(teacherContract),
      academicPeriodId: teacherContract.academicPeriodId,
      contractTypeId: teacherContract.contractTypeId,
      peopleId: teacherContract.peopleId,
      userId: teacherContract.userId,
      avatar: teacherContract.avatar,
      identification: teacherContract.identification,
      nombre: teacherContract.fullName,
      tipoContrato: teacherContract.contractType?.name || '',
      horasAsignadas: teacherContract.assignedHours,
      horasDisponibles: teacherContract.availableHours,
      horasMaximas: teacherContract.maxHours,
      estado: mapApiAvailabilityToLocalState(teacherContract.status),
      statusLabel: teacherContract.statusLabel,
      programa: '',
      asignaturas: [],
    });

    const syncSelectedAcademicPeriod = (preferredAcademicPeriodId?: number | null) => {
      if (!periodOptions.value.length) {
        selectedAcademicPeriodId.value = null;
        return;
      }

      const preferredAcademicPeriod = preferredAcademicPeriodId ? periodOptions.value.find((academicPeriod) => academicPeriod.id === preferredAcademicPeriodId) : null;

      if (preferredAcademicPeriod) {
        selectedAcademicPeriodId.value = preferredAcademicPeriod.id;
        return;
      }

      const currentAcademicPeriod = periodOptions.value.find((academicPeriod) => academicPeriod.id === selectedAcademicPeriodId.value);

      if (currentAcademicPeriod) {
        selectedAcademicPeriodId.value = currentAcademicPeriod.id;
        return;
      }

      selectedAcademicPeriodId.value = periodOptions.value[0].id;
    };

    const fetchPeriodOptions = async (search?: string) => {
      const academicPeriods = await getAcademicPeriodsService.run({
        active: 1,
        sort: 'id',
        order: 'DESC',
        page: 1,
        perPage: 10,
        search: search || undefined,
      });
      return academicPeriods;
    };

    const loadAcademicPeriods = async () => {
      try {
        const academicPeriods = await fetchPeriodOptions();
        periodOptions.value = academicPeriods.map(mapAcademicPeriodToOption);
        const defaultAcademicPeriod = academicPeriods.find((ap) => ap.active === 1) || academicPeriods[0];
        syncSelectedAcademicPeriod(defaultAcademicPeriod?.id ?? null);
      } catch (error) {
        console.log(error);
        periodOptions.value = [];
        selectedAcademicPeriodId.value = null;
      }
    };

    const handlePeriodSearch = async (query: string, loading: (state: boolean) => void) => {
      loading(true);
      try {
        const academicPeriods = await fetchPeriodOptions(query);
        const newOptions = academicPeriods.map(mapAcademicPeriodToOption);

        // Always keep the currently selected period in the list so it never gets deselected
        if (selectedAcademicPeriodId.value !== null && !newOptions.some((o) => o.id === selectedAcademicPeriodId.value)) {
          const currentOption = periodOptions.value.find((o) => o.id === selectedAcademicPeriodId.value);
          if (currentOption) newOptions.unshift(currentOption);
        }

        periodOptions.value = newOptions;
      } catch (error) {
        console.log(error);
      } finally {
        loading(false);
      }
    };

    const loadTeacherBankStats = async (academicPeriodId: number | null) => {
      if (!academicPeriodId) {
        teacherBankStats.value = null;
        return;
      }

      try {
        teacherBankStats.value = await getTeacherBankStatsService.run({
          academicPeriodId,
        });
      } catch (error) {
        console.log(error);
        teacherBankStats.value = null;
      }
    };

    const loadContractTypes = async () => {
      try {
        const contractTypes = await getContractTypesService.run({
          noPag: true,
          type: 'academic_load_rules',
        });

        contractTypeOptions.value = contractTypes.map(mapContractTypeToOption);
      } catch (error) {
        console.log(error);
        contractTypeOptions.value = [];
      }
    };

    const fallbackStatusCounts = [
      {
        value: 'available' as const,
        label: 'Disponible',
        count: 0,
      },
      {
        value: 'near_limit' as const,
        label: 'Cercano al límite',
        count: 0,
      },
      {
        value: 'no_availability' as const,
        label: 'Sin disponibilidad',
        count: 0,
      },
    ];

    const contractOptions = computed<SelectOption<number | 'all'>[]>(() => [{ id: 'all', name: 'Todos los contratos' }, ...contractTypeOptions.value]);

    const availabilityOptions = computed<SelectOption<TeacherAvailabilityApiState | 'all'>[]>(() => {
      const dynamicOptions = teacherBankStats.value?.statusOptions?.length
        ? teacherBankStats.value.statusOptions.map((statusOption) => ({
            id: statusOption.value,
            name: statusOption.label,
          }))
        : fallbackStatusCounts.map((statusOption) => ({
            id: statusOption.value,
            name: statusOption.label,
          }));

      return [{ id: 'all', name: 'Toda la disponibilidad' }, ...dynamicOptions];
    });

    const params = computed(() => ({
      academicPeriodId: selectedAcademicPeriodId.value ?? undefined,
      contractTypeId: typeof selectedContract.value === 'number' ? selectedContract.value : undefined,
      status: selectedAvailability.value !== 'all' ? selectedAvailability.value : undefined,
      order: 'DESC',
      sort: 'id',
    }));

    const teacherContractTotal = computed(() => {
      if (!selectedAcademicPeriodId.value) return 0;

      return Number(checkDataTableStore.isCheckData?.dataTable?.total ?? checkDataTableStore.isCheckData?.dataTable?.pagination?.total ?? 0);
    });

    const syncPendingFilters = () => {
      pendingContract.value = selectedContract.value;
      pendingAvailability.value = selectedAvailability.value;
    };

    const applyPendingFilters = () => {
      selectedContract.value = pendingContract.value;
      selectedAvailability.value = pendingAvailability.value;
    };

    const summaryCards = computed(() => {
      const statusOptions = teacherBankStats.value?.statusOptions?.length ? teacherBankStats.value.statusOptions : fallbackStatusCounts;
      const totalTeachers = teacherBankStats.value?.total ?? teacherContractTotal.value;

      return [
        {
          label: 'Total docentes',
          value: totalTeachers,
          variant: 'white',
        },
        ...statusOptions.map((statusOption) => ({
          label: statusOption.label,
          value: statusOption.count,
          variant: statusOption.value === 'available' ? 'green' : statusOption.value === 'near_limit' ? 'yellow' : 'red',
        })),
      ];
    });

    const refreshTable = () => {
      document.dispatchEvent(new Event('updateDatatable', { bubbles: true }));
      void loadTeacherBankStats(selectedAcademicPeriodId.value);
    };

    const openTeacherDetail = (teacher: TeacherContractItem) => {
      const resolvedTeacherId = resolveTeacherIdentifier(teacher);

      selectedTeacher.value = mapTeacherContractToTeacherDetail(teacher);
      selectedTeacherUserId.value = teacher.userId ?? null;
      selectedTeacherId.value = resolvedTeacherId;
      isDrawerVisible.value = true;
    };

    const getAvailabilityLabel = (state: TeacherAvailabilityApiState | TeacherAvailabilityState | null | undefined, fallbackLabel?: string) => {
      if (!state) return fallbackLabel || 'Sin contrato';

      return getTeacherAvailabilityLabel(isApiAvailabilityState(state) ? mapApiAvailabilityToLocalState(state) : state);
    };
    const getAvailabilityVariant = (state: TeacherAvailabilityApiState | TeacherAvailabilityState | null | undefined) => {
      if (!state) return 'ghost';

      return getTeacherAvailabilityVariant(isApiAvailabilityState(state) ? mapApiAvailabilityToLocalState(state) : state);
    };

    onMounted(async () => {
      headerStorage.module = { name: 'Planeación académica', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      try {
        await Promise.all([loadAcademicPeriods(), loadContractTypes()]);
      } finally {
        loading.value = false;
      }
    });

    watch(periodOptions, () => {
      syncSelectedAcademicPeriod();
    });

    watch(selectedAcademicPeriodId, (newAcademicPeriodId) => {
      if (newAcademicPeriodId === null) {
        syncSelectedAcademicPeriod();
        teacherBankStats.value = null;
        return;
      }

      void loadTeacherBankStats(newAcademicPeriodId);
    });

    return {
      loading,
      availabilityOptions,
      contractOptions,
      getAvailabilityLabel,
      getAvailabilityVariant,
      getTeacherLoadPercentage,
      handlePeriodSearch,
      isDrawerVisible,
      openTeacherDetail,
      refreshTable,
      selectedTeacherId,
      selectedTeacherUserId,
      pendingAvailability,
      pendingContract,
      periodOptions,
      params,
      routes,
      applyPendingFilters,
      selectedAvailability,
      selectedContract,
      selectedAcademicPeriodId,
      selectedTeacher,
      service,
      summaryCards,
      syncPendingFilters,
      teacherContractTotal,
      title,
      mapApiAvailabilityToLocalState,
    };
  },
});
</script>

<style scoped>
/* stat styles handled by AppStatCard */

.teacherBank__sectionTitle {
  display: flex;
  align-items: center;
  color: #0f172a;
}

.teacherBank__overviewCard :deep(.o-card-title) {
  display: none;
}

.teacherBank__overviewCard :deep(.o-card-body) {
  gap: 1.5rem;
  padding: 1.25rem 1.25rem 1.5rem;
}

.teacherBank__selectorsRow {
  align-items: end;
}

.teacherBank__summaryRow {
  margin-top: 0;
}

.teacherBank__selectorCol {
  flex: 0 0 auto;
  min-width: 220px;
  max-width: 250px;
}

.teacherBank__topFilter {
  display: block;
  width: 100%;
}

.teacherBank__topFilter :deep(.v-select) {
  width: 100%;
}

.teacherBank__topFilter :deep(.vs__dropdown-toggle) {
  width: 100%;
}

.teacherBank__topFilter :deep(.vs__selected-options) {
  min-width: 0;
  flex-wrap: nowrap;
  overflow: hidden;
}

.teacherBank__topFilter :deep(.vs__selected) {
  display: block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.teacherBank__topFilter :deep(.vs__search) {
  min-width: 0;
  flex: 1 1 auto;
}

.teacherBank__topFilter :deep(.vs__dropdown-menu) {
  min-width: 100%;
}

.teacherBank__sectionTitle--between {
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.teacherBank__filtersPanel {
  display: grid;
  gap: 0.75rem;
}

.teacherBank__search {
  position: relative;
}

.teacherBank__filterInput :deep(.o-form-input) {
  min-height: 44px;
  padding-left: 2.4rem;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
}

.teacherBank__searchIcon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  z-index: 1;
}

.teacherBank__filterActions {
  display: flex;
  justify-content: flex-end;
}

.teacherBank__teacherCell {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 220px;
}

.teacherBank__hours {
  display: grid;
  gap: 0.55rem;
  min-width: 160px;
}

.teacherBank__progress {
  width: 100%;
  height: 0.55rem;
  background: rgba(148, 163, 184, 0.22);
  border-radius: 999px;
  overflow: hidden;
}

.teacherBank__progressBar {
  height: 100%;
  border-radius: inherit;
}

.teacherBank__progressBar--disponible {
  background: #22c55e;
}

.teacherBank__progressBar--cercano {
  background: #f59e0b;
}

.teacherBank__progressBar--completo {
  background: #ef4444;
}

.teacherBank__available--disponible {
  color: #16a34a;
}

.teacherBank__available--cercano {
  color: #d97706;
}

.teacherBank__available--completo {
  color: #dc2626;
}

.teacherBank__rowLink {
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
  cursor: pointer;
  width: 100%;
}

.teacherBank__rowLink:hover .teacherBank__teacherCell {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .teacherBank__selectorCol {
    min-width: 0;
    max-width: 100%;
  }

  .teacherBank__sectionTitle--between,
  .teacherBank__teacherCell {
    align-items: flex-start;
    flex-direction: column;
  }
}
.teacherBank {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
