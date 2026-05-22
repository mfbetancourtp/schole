<template>
  <AppBaseList :title="title" isCard>
    <template v-slot:actions>
      <AppButton style="color: white;" label="core.new" :to="{ name: 'competenceEvaluation.configureEvaluationsCreate' }"></AppButton>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <AppDatatable v-else name="configureEvaluations" :service="service" :params="params">
        <template #filters>
          <AppFilter v-model="unitOrganizationalId" filter-name="configureEvaluations.unitOrganizationalId">
            <label for="unitOrganizationalId">{{ t('competenceEvaluation.configureEvaluations.filters.organizationalUnit') }}</label>

            <AppAutocomplete input-id="unitOrganizationalId" v-model="unitOrganizationalId" :options="organizationalUnits"></AppAutocomplete>
          </AppFilter>

          <AppFilter v-model="academicPeriodId" filter-name="configureEvaluations.academicPeriodId">
            <label for="academicPeriodId">{{ t('competenceEvaluation.configureEvaluations.filters.validity') }}</label>

            <AppAutocomplete input-id="academicPeriodId" v-model="academicPeriodId" :options="academicPeriods"></AppAutocomplete>
          </AppFilter>

          <AppFilter v-model="startDate" filter-name="configureEvaluations.startDate">
            <label for="startDate">{{ t('core.time.since') }}</label>

            <input v-model="startDate" id="startDate" class="form-control" type="date" />
          </AppFilter>

          <AppFilter v-model="endDate" filter-name="configureEvaluations.endDate">
            <label for="endDate">{{ t('core.time.until') }}</label>

            <input v-model="endDate" id="endDate" class="form-control" type="date" />
          </AppFilter>
        </template>

        <AppDatatableColumn label="competenceEvaluation.configureEvaluations.dataTable.organizationalUnit" v-slot="{ row }" field="configureEvaluations.organizationalUnit" :sortable="true">
          {{ row.OrganizationalUnitName }}
        </AppDatatableColumn>
        <AppDatatableColumn label="competenceEvaluation.configureEvaluations.dataTable.period" v-slot="{ row }" field="configureEvaluations.period" :sortable="true">
          {{ dayjs(row.startDate).format('D MMM') }} -
          {{ dayjs(row.endDate).format('D MMM YYYY') }}
        </AppDatatableColumn>
        <AppDatatableColumn
          label="competenceEvaluation.configureEvaluations.dataTable.numberScheduled"
          v-slot="{ row }"
          field="configureEvaluations.numberScheduled"
          :sortable="true"
          :position="'centered'"
        >
          {{ row.numberScheduled }}
        </AppDatatableColumn>
        <AppDatatableColumn
          label="competenceEvaluation.configureEvaluations.dataTable.numberDeveloped"
          v-slot="{ row }"
          field="configureEvaluations.numberDeveloped"
          :sortable="true"
          :position="'centered'"
        >
          {{ row.numberDeveloped }}
        </AppDatatableColumn>
        <AppDatatableColumn
          label="competenceEvaluation.configureEvaluations.dataTable.numberEvaluated"
          v-slot="{ row }"
          field="configureEvaluations.numberEvaluated"
          :sortable="true"
          :position="'centered'"
        >
          {{ row.numberEvaluated }}
        </AppDatatableColumn>
        <AppDatatableColumn label="competenceEvaluation.configureEvaluations.dataTable.status" v-slot="{ row }" field="configureEvaluations.status" :sortable="true" :position="'centered'">
          <span v-if="row.active" class="badge rounded-pill text-bg-primary bg-success">{{ t('core.active') }}</span>
          <span v-else class="badge rounded-pill text-bg-primary bg-dark">{{ t('core.inactive') }}</span>
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }">
          <AppButtonGroup size="sm">
            <AppButtonEdit
              :to="{
                name: 'competenceEvaluation.configureEvaluationsEdit',
                params: { corporateEvaluationPeriodId: row.id },
              }"
            ></AppButtonEdit>

            <AppButtonDelete @click="openConfirmDelete(row.id)"></AppButtonDelete>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="competenceEvaluation.configureEvaluations.singular" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import dayjs from 'dayjs';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { AcademicPeriodDto } from '../dtos/configureEvaluations.dto';
import { OrganizationalInitDto } from '../dtos/configureEvaluations.dto';

import { GetAcademicPeriodsService } from '../services/getAcademicPeriods.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetOrganizationalUnitsService } from '../services/getOrganizationalUnits.service';
import { DeleteCorporateEvaluationPeriodsService } from '../services/deleteCorporateEvaluationPeriods.service';
import { GetCorporateEvaluationPeriodsWithPaginationService } from '../services/getCorporateEvaluationPeriodsWithPagination.service';
import { useHeaderStore } from '../../../stores/header.store';

const deleteCorporateEvaluationPeriodsService = new DeleteCorporateEvaluationPeriodsService();
const getOrganizationalUnitsService = new GetOrganizationalUnitsService();
const getAcademicPeriodsService = new GetAcademicPeriodsService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'ConfigureEvaluations',
  components: {
    AppConfirmDeleteModal,
    AppDatatableColumn,
    AppAutocomplete,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppDatatable,
    AppBaseList,
    AppLoading,
    AppFilter,
    AppButton,
    AppModal,
  },

  setup() {
    const { t } = useI18n();
    const title = 'competenceEvaluation.configureEvaluations.title';

    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    const service = new GetCorporateEvaluationPeriodsWithPaginationService();

    const organizationalUnits: Ref<OrganizationalInitDto[]> = ref([]);
    const academicPeriods: Ref<AcademicPeriodDto[]> = ref([]);

    const corporateEvaluationPeriodId = ref();
    const unitOrganizationalId = ref();
    const academicPeriodId = ref();
    const startDate = ref();
    const endDate = ref();

    const loading = ref(true);
    const modalDelete = ref(false);

    const params = computed(() => ({
      unitOrganizationalId: unitOrganizationalId.value,
      academicPeriodId: academicPeriodId.value,
      startDate: startDate.value,
      endDate: endDate.value,
    }));

    onMounted(async () => {
      try {
        academicPeriods.value = await getAcademicPeriodsService.run();
        const response = await getOrganizationalUnitsService.run();

        organizationalUnits.value = response.data;

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Evaluación de Desempeño', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const openConfirmDelete = async (currentCorporateEvaluationPeriodId: number) => {
      corporateEvaluationPeriodId.value = currentCorporateEvaluationPeriodId;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      await deleteCorporateEvaluationPeriodsService.run(corporateEvaluationPeriodId.value);
      updateDatatableService.run();

      corporateEvaluationPeriodId.value = null;
      modalDelete.value = false;
    };

    return {
      loading,
      routes,
      title,
      t,

      unitOrganizationalId,
      organizationalUnits,
      academicPeriodId,
      academicPeriods,
      modalDelete,
      startDate,
      service,
      endDate,
      params,

      openConfirmDelete,
      confirmDelete,

      dayjs,
    };
  },
});
</script>

<style scoped></style>
