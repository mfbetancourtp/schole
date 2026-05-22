<template>
  <AppBaseList title="Convenios Institucionales">
    <template #actions>
      <AppCheckPermission permission="institutionalAgreements.agreements.create">
        <AppButton variant="primary" @click="openCreate" class="btnAdd">
          <AppIcon icon="plus" />
          Crear Convenio
        </AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <div class="agreementsPage">
        <!-- Encabezado de sección -->
        <div class="mb-4">
          <h1 class="h3 mb-0">Convenios Institucionales</h1>
          <p class="small text-muted">
            Gestione los convenios vigentes con instituciones aliadas y su
            <span class="fw-bold" style="color: var(--color-primary)">disponibilidad de cupos</span>
          </p>
        </div>

        <!-- Tarjetas de estadísticas -->
        <AgreementStatsCards :stats="stats" />

        <!-- Tabla de convenios -->
        <AppDatatable v-if="filterCountries.length" name="agreements" :service="getInstitutionalAgreementsService" :params="sanitizedFilterParams" :default-per-page="10" default-sort-direction="desc">
          <template #filters>
            <AppFilter v-model="filterParams.agreementsTypesId" filter-name="agreements.agreementsTypesId">
              <label>Tipo de convenio</label>
              <AppAutocomplete :options="agreementTypes" label="name" :reduce="(t: any) => t.id" v-model="filterParams.agreementsTypesId" input-id="agreementsTypesId" />
            </AppFilter>

            <AppFilter v-model="filterParams.agreementStatus" filter-name="agreements.agreementStatus">
              <label>Estado</label>
              <AppAutocomplete :options="['Activo', 'Borrador', 'Finalizado', 'Cerrado']" :reduce="(o: any) => o" v-model="filterParams.agreementStatus" input-id="agreementStatus" />
            </AppFilter>

            <AppFilter v-model="filterParams.countryId" filter-name="agreements.countryId">
              <label>País</label>
              <AppAutocomplete :options="filterCountries" label="name" :reduce="(c: any) => c.id" v-model="filterParams.countryId" input-id="countryId" />
            </AppFilter>

            <AppFilter v-model="filterParams.startDateFrom" filter-name="agreements.startDateFrom">
              <label>Vigencia desde</label>
              <AppInput v-model="filterParams.startDateFrom" type="date" />
            </AppFilter>

            <AppFilter v-model="filterParams.startDateTo" filter-name="agreements.startDateTo">
              <label>Vigencia hasta</label>
              <AppInput v-model="filterParams.startDateTo" type="date" />
            </AppFilter>
          </template>

          <AppDatatableColumn field="code" label="Código" sortable width="160" v-slot="props">
            <span class="codeCell">{{ props.row.code }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn field="name" label="Nombre del Convenio" sortable v-slot="props">
            <span class="nameCell">{{ props.row.name }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn field="agreementsTypesId" label="Tipo" sortable position="centered" width="180" v-slot="props">
            <span class="tipoBadge">{{ props.row.agreementsType?.name ?? props.row.agreementsTypesId }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn field="institutionPartner" label="Institución Aliada" v-slot="props">
            <span class="institutionCell">{{ props.row.institutionPartner }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn field="countryId" label="País" sortable position="centered" v-slot="props">
            <span class="small text-gray-700">{{ filterCountries.find((c) => c.id === (props.row.country?.id ?? props.row.countryId))?.name ?? props.row.country?.name ?? '-' }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn field="starDay" label="Vigencia" sortable v-slot="props">
            <div class="vigenciaCell">
              <AppIcon icon="calendar-alt" />
              <span>{{ formatDate(props.row.starDay) }} – {{ formatDate(props.row.endDate) }}</span>
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn field="maximumCapacity" label="Cupos" sortable position="centered" width="100" v-slot="props">
            <span class="cuposCell">
              <span class="cuposCell__total">{{ props.row.maximumCapacity }}</span>
            </span>
          </AppDatatableColumn>

          <AppDatatableColumn field="agreementStatus" label="Estado" sortable position="centered" v-slot="props">
            <span class="statusBadge" :class="statusClass(props.row.agreementStatus)">
              {{ props.row.agreementStatus }}
            </span>
          </AppDatatableColumn>

          <AppDatatableColumn label="Acciones" position="centered" v-slot="props">
            <div class="actionsCell">
              <AppButton outlined icon="eye" v-tooltip="'Ver detalle'" @click="openView(props.row)" />
              <AppButton outlined icon="file-alt" v-tooltip="'Ver postulaciones'" @click="viewApplications(props.row)" />
              <AppCheckPermission permission="institutionalAgreements.agreements.edit">
                <AppButton outlined icon="pencil-alt" v-tooltip="'Editar'" @click="editAgreement(props.row)" />
              </AppCheckPermission>
              <AppCheckPermission permission="institutionalAgreements.agreements.update">
                <AppButton outlined icon="sync-alt" v-tooltip="'Cambiar estado'" @click="openStatusModal(props.row)" />
              </AppCheckPermission>
              <AppCheckPermission permission="institutionalAgreements.agreements.delete">
                <AppButton outlined icon="trash" class="btnAction--danger" v-tooltip="'Eliminar'" @click="openDeleteModal(props.row)" />
              </AppCheckPermission>
            </div>
          </AppDatatableColumn>
        </AppDatatable>

        <!-- Modal: Confirmar eliminación -->
        <AppModal v-model="deleteModal">
          <AppConfirmDeleteModal v-if="deleteModal" entity="convenio institucional" @confirmDelete="deleteAgreement" />
        </AppModal>

        <!-- Modal: Cambiar estado -->
        <AppModal v-model="statusModal">
          <AgreementStatusModal v-if="statusModal" :agreement="statusAgreement" @confirmStatus="confirmStatusChange" />
        </AppModal>

        <!-- Drawer: Crear / Editar convenio -->
        <AgreementFormDrawer :isVisible="drawerVisible" :agreementData="drawerEditData" @update:isVisible="drawerVisible = $event" @save="handleSave" />

        <!-- Drawer: Ver detalle del convenio -->
        <AgreementDetailDrawer
          :isVisible="detailDrawerVisible"
          :agreement="detailAgreement"
          :agreementTypes="agreementTypes"
          @update:isVisible="detailDrawerVisible = $event"
          @edit="handleDetailEdit"
        />
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, reactive, computed } from 'vue';
import { useMeta } from 'vue-meta';
import { useRouter } from 'vue-router';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import AgreementStatsCards from '../components/AgreementStatsCards.vue';
import AgreementFormDrawer from '../components/AgreementFormDrawer.vue';
import AgreementDetailDrawer from '../components/AgreementDetailDrawer.vue';
import AgreementStatusModal from '../components/AgreementStatusModal.vue';

import { InstitutionalAgreementDto, InstitutionalAgreementStatus } from '../dtos/institutionalAgreement.dto';
import { GetInstitutionalAgreementsService } from '../services/getInstitutionalAgreements.service';
import { GetInstitutionalAgreementByIdService } from '../services/getInstitutionalAgreementById.service';
import { GetInstitutionalAgreementStatsService } from '../services/getInstitutionalAgreementStats.service';
import { InstitutionalAgreementStatsDto } from '../dtos/institutionalAgreement.dto';
import { DeleteInstitutionalAgreementService } from '../services/deleteInstitutionalAgreement.service';
import { UpdateInstitutionalAgreementDetailService } from '../services/updateInstitutionalAgreementDetail.service';
import { GetAgreementTypesService } from '../services/getAgreementTypes.service';
import { FindAllCountriesForSelectService } from '../../../shared/services/findAllCountriesForSelect.service';
import { useHeaderStore } from '../../../stores/header.store';

const getInstitutionalAgreementsService = new GetInstitutionalAgreementsService();
const getInstitutionalAgreementByIdService = new GetInstitutionalAgreementByIdService();
const getInstitutionalAgreementStatsService = new GetInstitutionalAgreementStatsService();
const deleteInstitutionalAgreementService = new DeleteInstitutionalAgreementService();
const updateInstitutionalAgreementDetailService = new UpdateInstitutionalAgreementDetailService();
const getAgreementTypesService = new GetAgreementTypesService();
const findAllCountriesForSelectService = new FindAllCountriesForSelectService();

interface SelectOption {
  id: number;
  name: string;
}

export default defineComponent({
  name: 'AgreementsPage',
  components: {
    AppBaseList,
    AppCheckPermission,
    AppButton,
    AppIcon,
    AppDatatable,
    AppDatatableColumn,
    AppModal,
    AppConfirmDeleteModal,
    AppFilter,
    AppInput,
    AppAutocomplete,
    AgreementStatsCards,
    AgreementFormDrawer,
    AgreementDetailDrawer,
    AgreementStatusModal,
  },
  setup() {
    const router = useRouter();
    const title = 'Convenios Institucionales';
    useMeta({ title });

    const stats = ref<InstitutionalAgreementStatsDto>({
      activeAgreements: 0,
      draftAgreements: 0,
      totalApplications: 0,
      availableSpots: 0,
    });

    const agreementTypes = ref<SelectOption[]>([]);
    const filterCountries = ref<SelectOption[]>([]);

    // Solo los filtros — el datatable maneja page/perPage/sort/order internamente
    const filterParams = reactive({
      agreementsTypesId: undefined as number | undefined,
      agreementStatus: undefined as InstitutionalAgreementStatus | undefined,
      countryId: undefined as number | undefined,
      startDateFrom: '' as string | undefined,
      startDateTo: '' as string | undefined,
      _refresh: 0,
    });

    const sanitizedFilterParams = computed(() => ({
      ...filterParams,
      startDateFrom: filterParams.startDateFrom || undefined,
      startDateTo: filterParams.startDateTo || undefined,
    }));

    const deleteModal = ref(false);
    const currentAgreement = ref<InstitutionalAgreementDto | null>(null);

    const statusModal = ref(false);
    const statusAgreement = ref<InstitutionalAgreementDto | null>(null);

    const drawerVisible = ref(false);
    const drawerEditData = ref<InstitutionalAgreementDto | null>(null);

    const detailDrawerVisible = ref(false);
    const detailAgreement = ref<InstitutionalAgreementDto | null>(null);

    const loadStats = async () => {
      try {
        stats.value = await getInstitutionalAgreementStatsService.run();
      } catch {
        // stats cards keep previous values on error
      }
    };

    const refreshTable = () => {
      filterParams._refresh++;
    };

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Acuerdos Institucionales', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
      } catch (e) {
        console.error('Error setting header:', e);
      }
      await loadStats();

      // Load filter options
      const [typesRes, countriesRes] = await Promise.allSettled([getAgreementTypesService.run({ perPage: 100, isActive: 1 }), findAllCountriesForSelectService.run({ perPage: 300 })]);

      if (typesRes.status === 'fulfilled') {
        agreementTypes.value = (typesRes.value.data || []).map((t: any) => ({
          id: t.id,
          name: t.name,
        }));
      }

      if (countriesRes.status === 'fulfilled') {
        const data = countriesRes.value.data || countriesRes.value;
        filterCountries.value = Array.isArray(data)
          ? data.map((c: any) => {
              try {
                const t = typeof c.translations === 'string' ? JSON.parse(c.translations) : c.translations;
                return { id: c.id, name: t?.es || c.name };
              } catch {
                return { id: c.id, name: c.name };
              }
            })
          : [];
      }
    });

    const clearFilters = () => {
      filterParams.agreementsTypesId = undefined;
      filterParams.agreementStatus = undefined;
      filterParams.countryId = undefined;
      filterParams.startDateFrom = '';
      filterParams.startDateTo = '';
    };

    const openView = async (row: InstitutionalAgreementDto) => {
      try {
        detailAgreement.value = await getInstitutionalAgreementByIdService.run(row.id);
      } catch {
        detailAgreement.value = row;
      }
      detailDrawerVisible.value = true;
    };

    const handleDetailEdit = async (row: InstitutionalAgreementDto) => {
      try {
        drawerEditData.value = await getInstitutionalAgreementByIdService.run(row.id);
      } catch {
        drawerEditData.value = row;
      }
      drawerVisible.value = true;
    };

    const openCreate = () => {
      drawerEditData.value = null;
      drawerVisible.value = true;
    };

    const editAgreement = async (row: InstitutionalAgreementDto) => {
      try {
        drawerEditData.value = await getInstitutionalAgreementByIdService.run(row.id);
      } catch {
        drawerEditData.value = row;
      }
      drawerVisible.value = true;
    };

    const handleSave = async () => {
      refreshTable();
      await loadStats();
    };

    const openDeleteModal = (row: InstitutionalAgreementDto) => {
      currentAgreement.value = row;
      deleteModal.value = true;
    };

    const openStatusModal = (row: InstitutionalAgreementDto) => {
      statusAgreement.value = row;
      statusModal.value = true;
    };

    const confirmStatusChange = async (newStatus: InstitutionalAgreementStatus) => {
      if (!statusAgreement.value || !newStatus) return;
      try {
        const full = await getInstitutionalAgreementByIdService.run(statusAgreement.value.id);
        await updateInstitutionalAgreementDetailService.run(full.id, {
          agreementsTypesId: full.agreementsTypesId,
          code: full.code,
          name: full.name,
          institutionPartner: full.institutionPartner,
          countryId: full.countryId,
          starDay: full.starDay,
          endDate: full.endDate,
          facultyId: full.facultyId,
          programId: full.programId,
          beneficiariesTypesId: full.beneficiariesTypesId,
          maximumAverage: full.maximumAverage,
          minimumSemester: full.minimumSemester,
          maximumSemester: full.maximumSemester,
          requiresEnrollment: full.requiresEnrollment,
          requiresNoDisciplinary: full.requiresNoDisciplinary,
          requiresNoBlocks: full.requiresNoBlocks,
          municipalityId: full.municipalityId,
          descriptionPublic: full.descriptionPublic,
          comments: full.comments,
          maximumCapacity: full.maximumCapacity,
          agreementStatus: newStatus,
          documents:
            full.documents?.map((d) => ({
              id: d.id,
              name: d.name,
              required: d.required,
            })) ?? [],
        });
        refreshTable();
        await loadStats();
      } catch {
        // interceptor maneja el toast de error
      } finally {
        statusModal.value = false;
        statusAgreement.value = null;
      }
    };

    const deleteAgreement = async () => {
      if (!currentAgreement.value) return;
      try {
        await deleteInstitutionalAgreementService.run(currentAgreement.value.id);
        refreshTable();
        await loadStats();
      } catch {
        // interceptor maneja el toast de error
      } finally {
        deleteModal.value = false;
        currentAgreement.value = null;
      }
    };

    const viewApplications = (row: InstitutionalAgreementDto) => {
      router.push({
        name: 'institutionalAgreements.agreements.applications',
        params: { id: row.id },
      });
    };

    const formatDate = (dateStr: string): string => {
      if (!dateStr) return '-';
      const datePart = dateStr.substring(0, 10);
      const [year, month, day] = datePart.split('-');
      if (!year || !month || !day) return '-';
      return `${parseInt(day)}/${parseInt(month)}/${year}`;
    };

    const statusClass = (status: InstitutionalAgreementStatus | string): string => {
      const map: Record<string, string> = {
        Activo: 'statusBadge--active',
        Borrador: 'statusBadge--draft',
        Finalizado: 'statusBadge--finished',
        Cerrado: 'statusBadge--closed',
      };
      return map[status] ?? '';
    };

    return {
      title,
      stats,
      getInstitutionalAgreementsService,
      filterParams,
      sanitizedFilterParams,
      agreementTypes,
      filterCountries,
      deleteModal,
      currentAgreement,
      statusModal,
      statusAgreement,
      openStatusModal,
      confirmStatusChange,
      drawerVisible,
      drawerEditData,
      detailDrawerVisible,
      detailAgreement,
      viewApplications,
      clearFilters,
      openView,
      openCreate,
      editAgreement,
      handleSave,
      handleDetailEdit,
      openDeleteModal,
      deleteAgreement,
      formatDate,
      statusClass,
    };
  },
});
</script>

<style scoped>
.agreementsPage {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btnAdd {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
}

/* Celdas de tabla */
.codeCell {
  font-size: 0.9rem;
  font-weight: 700;
  font-family: monospace;
  color: var(--color-primary);
  white-space: nowrap;
}

.nameCell {
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--color-dark, #111827);
}

.institutionCell {
  font-size: 0.85rem;
  color: var(--color-gray-600, #6b7280);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 240px;
}

.vigenciaCell {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--color-gray-600, #6b7280);
  white-space: nowrap;
}

.cuposCell {
  font-size: 0.9rem;
  font-weight: 600;
}

.cuposCell__total {
  color: #6b7280;
}

/* Tipo badge */
.tipoBadge {
  display: inline-block;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1.5px solid #bfdbfe;
}

/* Status badge */
.statusBadge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.statusBadge--active {
  background: #dcfce7;
  color: #16a34a;
}
.statusBadge--draft {
  background: #fef3c7;
  color: #d97706;
}
.statusBadge--finished {
  background: #f3f4f6;
  color: #6b7280;
}
.statusBadge--closed {
  background: #fee2e2;
  color: #dc2626;
}

/* Acciones */
.actionsCell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  flex-wrap: nowrap;
}

.btnAction--danger {
  border-color: #fecaca;
  color: #dc2626;
}
</style>
