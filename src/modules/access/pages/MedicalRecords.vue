<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButton style="color: white;" :label="'core.newFemale'" @click="openFormMedicalRecordModal()" />
    </template>

    <template #content>
      <TableDashboard v-if="dataDasboard" :cardsDataProp="cardsDatas"></TableDashboard>
      <AppDatatable :service="service" :params="params" :name="title">
        <template #filters>
          <AppFilter v-model="wellnessAreaId" filter-name="academic.wellnessAreaId">
            <AppFormField label="core.generalTerms.academic.wellnessAreas.plural" capitalize>
              <AppAutocomplete v-model="wellnessAreaId" :options="wellnessAreasList" input-id="wellnessAreaId" />
            </AppFormField>
            <div class="d-flex gap-1 align-items-end">
                <AppFormField :label="'Inicia'">
                  <input type="date" class="form-control" v-model="dateStart" />
                </AppFormField>

                <AppFormField :label="'Termina'">
                  <input type="date" class="form-control" v-model="dateEnd" />
                </AppFormField>
              </div>
          </AppFilter>
        </template>
        <AppDatatableColumn label="core.generalTerms.academic.student.singular" field="student" :sortable="true" v-slot="{ row }">
          {{ row.user.people.names }} {{ row.user.people.lastnames }}
        </AppDatatableColumn>

        <AppDatatableColumn label="access.medicalRecord.form.annotations" field="annotations" :sortable="true" v-slot="{ row }">
          {{ limitText(row.annotations) }}
        </AppDatatableColumn>

        <AppDatatableColumn label="core.generalTerms.academic.wellnessAreas.plural" field="wellnessAreaName" :sortable="true" v-slot="{ row }">
          {{ row.wellnessAreaName }}
        </AppDatatableColumn>

        <AppDatatableColumn label="access.medicalRecord.form.consultationDate" field="consultationDate" :sortable="true" v-slot="{ row }">
          {{ dayjs.tz(row.consultationDate, dayjs.tz.guess()).format('YYYY/MM/DD h:mm A') }}
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }" label="core.actions">
          <AppButtonGroup>
            <AppButton v-tooltip="'core.seeDetail'" icon="eye" outlined @click="openSeeDetailModal(row)" />

            <AppButtonEdit @click="openFormMedicalRecordModal(row)" />

            <AppButtonDelete @click="openModalDelete(row.id)" />
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>

      <AppModal v-model="formMedicalRecordModal" :size="'lg'">
        <template v-if="formMedicalRecordModal">
          <MedicalRecordsForm :medicalRecord="currentMedicalRecord" :wellnessAreasList="wellnessAreasList" @close="closeFormMedicalRecordModal" />
        </template>
      </AppModal>

      <AppModal v-model="seeDetailModal" :size="'lg'">
        <template v-if="currentMedicalRecord && seeDetailModal">
          <MedicalRecordDetail :medicalRecord="currentMedicalRecord " />
        </template>
      </AppModal>

      <AppModal v-model="modalDelete">
        <template v-if="modalDelete">
          <AppConfirmDeleteModal entity="access.medicalRecord.singular" @confirmDelete="deleteMedicalRecord" />
        </template>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import MedicalRecordsForm from '../components/MedicalRecordsForm.vue';
import MedicalRecordDetail from '../components/MedicalRecordDetail.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { MedicalRecordDto } from '../dtos/medicalRecord.dto';

import { DeleteMedicalRecordService } from '../services/deleteMedicalRecord.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetMedicalRecordsWithPaginationService } from '../services/getMedicalRecordsWithPagination.service';
import { useHeaderStore } from '../../../stores/header.store';

import { GetWellnessAreasService } from '../../institutionalConfiguration/services/getWellnessAreas.service';
import { GetMedicalRecordsDashboardService } from '../../institutionalConfiguration/services/getMedicalRecordsDashboard.service';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import TableDashboard from '../../administration/components/TableDashboard.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';

const getWellnessAreasService = new GetWellnessAreasService();
const getMedicalRecordsDashboardService = new GetMedicalRecordsDashboardService();

const deleteMedicalRecordService = new DeleteMedicalRecordService();
const updateDatatableService = new UpdateDatatableService();

dayjs.extend(timezone);
dayjs.extend(utc);

export default defineComponent({
  name: 'MedicalRecords',
  components: {
    AppConfirmDeleteModal,
    MedicalRecordDetail,
    AppDatatableColumn,
    MedicalRecordsForm,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppDatatable,
    AppBaseList,
    AppButton,
    AppModal,
    AppAutocomplete,
    AppFormField,
    TableDashboard,
    AppFilter
},

  setup() {
    const { t } = useI18n();
    const title = 'access.medicalRecord.title';
    const service = new GetMedicalRecordsWithPaginationService();

    useMeta({ title: t(title) });
    const headerStorage = useHeaderStore();
    
    const currentMedicalRecord: Ref<MedicalRecordDto | null> = ref(null);

    const formMedicalRecordModal = ref(false);
    const seeDetailModal = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);
    const wellnessAreasList = ref<any[]>([]);
    const wellnessAreaId= ref<number | null>(null);
    const dateStart = ref();
    const dateEnd = ref();
    const dataDasboard = ref();
    const cardsDatas = ref([{}]);

    

    

    const limitText = (text: string) => {
      const characterLimit = 50;
      let newText = text.substring(0, characterLimit);

      if (text.length > characterLimit) newText += '...';

      return newText;
    };
    const params = computed(() => {
      return{
      wellnessAreaId: wellnessAreaId.value,
      dateSince: dateStart.value,
      dateUntil: dateEnd.value,
      order: 'desc'
    }});

    onMounted(async () => {
      try {
        headerStorage.module = { name: 'Administración de Usuarios', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      wellnessAreasList.value= await getWellnessAreasService.run();
        await getDataDashboard();
      let localfilters: any = localStorage.getItem('filters') ?? '';
        if (localfilters) {
          localfilters = JSON.parse(localfilters);
          wellnessAreaId.value = localfilters['wellnessAreas.wellnessAreaId'] ? Number(localfilters['wellnessAreas.wellnessAreaId']) : null;
          dateStart.value = localfilters['dateSince.dateStart'] ? Number(localfilters['dateSince.dateStart']) : null;
          dateEnd.value = localfilters['dateUntil.dateEnd'] ? Number(localfilters['dateUntil.dateEnd']) : null;

        }
      } catch (e) {
        console.log("error",e);
        
      }
      loading.value = false
    });
    const getDataDashboard = async () => {
      dataDasboard.value = await getMedicalRecordsDashboardService.run();
      const cardsData = [{
          title: dataDasboard.value[0].wellnessAreaName,
          data: dataDasboard.value[0].medicalRecords,
          icon: 'totalWellnessAreas',
          border: 'border-right: 1px solid #9ea1a5;',
        },];

      const startingIndex = 1;
      for (let i = startingIndex; i < dataDasboard.value.length; i++) {
      const item = dataDasboard.value[i];
        cardsData.push(
          
        {
          title: item.wellnessAreaName,
          data: item.medicalRecords,
          icon: 'WellnessAreas',
          border: '',
        }
        );
      }
      cardsDatas.value = cardsData;
    };

    const openFormMedicalRecordModal = (medicalRecord: MedicalRecordDto | null = null) => {
      currentMedicalRecord.value = medicalRecord;
      formMedicalRecordModal.value = true;
      
    };
    const closeFormMedicalRecordModal = async () => {
      formMedicalRecordModal.value = false;
      currentMedicalRecord.value = null;
      await getDataDashboard();
      updateDatatableService.run();
    };

    const openSeeDetailModal = (medicalRecord: MedicalRecordDto) => {
      currentMedicalRecord.value = medicalRecord;
      seeDetailModal.value = true;
    };

    const openModalDelete = (medicalRecord: MedicalRecordDto) => {
      currentMedicalRecord.value = medicalRecord;
      modalDelete.value = true;
    };
    const deleteMedicalRecord = async () => {
      console.log("currentMedicalRecord.value",currentMedicalRecord.value);
      try {
        if (currentMedicalRecord.value) {
          await deleteMedicalRecordService.run(currentMedicalRecord.value);
        }

        currentMedicalRecord.value = null;
        modalDelete.value = false;
        await getDataDashboard();
        updateDatatableService.run();
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      service,
      title,
      t,

      formMedicalRecordModal,
      currentMedicalRecord,
      wellnessAreasList,
      seeDetailModal,
      modalDelete,

      closeFormMedicalRecordModal,
      openFormMedicalRecordModal,
      deleteMedicalRecord,
      openSeeDetailModal,
      openModalDelete,
      limitText,
      params,
      wellnessAreaId,
      dateStart,
      dateEnd,
      cardsDatas,
      dataDasboard,
      dayjs,
    };
  },
});
</script>
