<template>
  <AppBaseList :title="title" isCard>
    <template v-slot:actions>
      <AppButton style="color: white;" :to="{ name: 'casurid.institutionsCreate' }" label="core.new" variant="primary"></AppButton>
    </template>

    <template v-slot:content>
      <AppDatatable :name="name" :service="getInstitutionsWithPaginationService" :params="params">
        <template v-slot:filters>
          <AppFilter v-model="cityId" :filter-name="`${name}.cityId`">
            <label for="cityId">Ciudad</label>
            <v-select
              input-id="cityId"
              v-model="cityId"
              :filterable="false"
              @search="searchMunicipalities"
              :options="municipalities.value"
              label="MunicipalityRegionName"
              :reduce="(municipality) => municipality.id"
              multiple
            >
            </v-select>
          </AppFilter>

          <AppFilter v-model="statusId" :filter-name="`${name}.statusId`">
            <label for="statusId">Estado</label>
            <v-select input-id="statusId" v-model="statusId" :options="status.value" label="name" :reduce="(status) => status.id" multiple> </v-select>
          </AppFilter>
        </template>

        <AppDatatableColumn label="Ciudad" field="city" :sortable="true" v-slot="{ row }">
          {{ row.city }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Nombre" field="name" :sortable="true" v-slot="{ row }">
          {{ row.name }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Email" field="email" :sortable="true" v-slot="{ row }">
          {{ row.email }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Teléfono" field="phone" :sortable="true" v-slot="{ row }">
          {{ row.phone }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Estado" field="isClient" :sortable="true" v-slot="{ row }">
          {{ row.isClient ? 'Cliente' : 'Interesado' }}
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }">
          <AppButtonGroup>
            <AppButtonEdit
              :to="{
                name: 'casurid.institutionsEdit',
                params: { institutionId: row.id },
              }"
            ></AppButtonEdit>

            <AppButton
              variant="primary"
              outlined
              :to="{
                name: 'casurid.institutionsContentPlan',
                params: { institutionId: row.id },
              }"
              v-tooltip="'Plan de Contenidos'"
              icon="calendar-week"
            >
            </AppButton>

            <AppButtonDelete @click="confirmDelete(row)"></AppButtonDelete>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>

      <AppModal v-model="showModalDelete" @close="showModalDelete = false">
        <AppConfirmDeleteModal v-if="showModalDelete" entity="institución" @confirmDelete="deleteContent"> </AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { debounce } from 'ts-debounce';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';

import { GetInstitutionsWithPaginationService } from '../services/getInstitutionsWithPagination.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetMunicipalitiesService } from '../services/getMunicipalities.service';
import { DeleteInstitutionService } from '../services/deleteInstitution.service';

import { MunicipalityDto } from '../../../shared/dto/municipality.dto';
import { StatusDto } from '../dtos/status.dto';
import { useHeaderStore } from '../../../stores/header.store';

const getMunicipalitiesService = new GetMunicipalitiesService();
const updateDatatableService = new UpdateDatatableService();
const deleteInstitutionService = new DeleteInstitutionService();

export default defineComponent({
  name: 'InstitucionesPage',
  components: {
    AppDatatableColumn,
    AppButton,
    AppFilter,
    AppBaseList,
    AppDatatable,
    AppButtonDelete,
    AppButtonEdit,
    AppConfirmDeleteModal,
    AppModal,
    AppButtonGroup,
  },
  setup() {
    const title = 'Instituciones';
    const name = 'institutions';
    useMeta({
      title,
    });

    const { t } = useI18n();
    const getInstitutionsWithPaginationService = new GetInstitutionsWithPaginationService();

    const municipalities: { value: MunicipalityDto[] } = reactive({
      value: [],
    });
    const status: { value: StatusDto[] } = reactive({
      value: [],
    });

    const cityId = ref();
    const statusId = ref();
    const showModalDelete = ref(false);
    const currentContent: { value: any } = reactive({
      value: null,
    });

    const routes = [
      {
        name: 'Instituciones',
      },
    ];

    onMounted(async () => {
      status.value = [
        {
          id: 0,
          name: 'Interesado',
        },
        {
          id: 1,
          name: 'Cliente',
        },
      ];
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Institución', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    });

    const params = computed(() => {
      let status: any;

      if (statusId.value != 0 && statusId.value != 1) {
        status = null;
      } else {
        status = statusId.value ? 'isClient' : 'isNotClient';
      }

      return {
        cityId: cityId.value,
        status: status,
      };
    });

    const searchMunicipalities = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);
        const response = await getMunicipalities(search);
        municipalities.value = response.data;
        loading(false);
      }
    }, 800);

    const getMunicipalities = (search: string) => {
      return getMunicipalitiesService.run({
        search,
        page: 1,
        perPage: 25,
      });
    };

    const updateTable = () => {
      updateDatatableService.run();
    };

    const confirmDelete = async (content: any) => {
      currentContent.value = content;
      showModalDelete.value = true;
    };

    const deleteContent = async () => {
      try {
        await deleteInstitutionService.run(currentContent.value.id);
        showModalDelete.value = false;
        updateTable();
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      title,
      name,
      params,
      routes,
      t,
      cityId,
      statusId,
      municipalities,
      status,
      showModalDelete,
      getInstitutionsWithPaginationService,
      searchMunicipalities,
      confirmDelete,
      deleteContent,
    };
  },
});
</script>

<style scoped>
@media screen and (max-width: 1200px) {
  th,
  td {
    font-size: 1.4vw;
  }
}
</style>
