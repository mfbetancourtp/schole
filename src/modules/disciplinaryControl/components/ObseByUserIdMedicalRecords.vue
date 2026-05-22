<template>
  <template v-if="dataDasboard">
    <TableDashboard :cardsDataProp="cardsDatas" />
  </template>

  <AppCard>
    <template #body>
      <div class="d-flex justify-content-end">
        <AppCheckPermission :permission="`${permission}.create`">
          <AppButton :outlined="false" :label="'core.newFemale'" @click="toggleDrawer()" />
        </AppCheckPermission>
      </div>

      <AppDatatable :service="service" :params="params" :name="name" :enableSearchFilter="false">
        <template #filters>
          <AppFilter v-model="wellnessAreaId" filter-name="observerByUserId.medicalRecords.wellnessAreaId">
            <AppFormField label="core.generalTerms.academic.wellnessAreas.plural" capitalize>
              <AppAutocomplete v-model="wellnessAreaId" :options="wellnessAreasList" input-id="wellnessAreaId" />
            </AppFormField>
          </AppFilter>

          <div class="d-flex gap-1 align-items-end">
            <AppFilter v-model="dateStart" filter-name="observerByUserId.medicalRecords.dateStart">
              <AppFormField :label="'Inicia'">
                <input type="date" class="form-control" v-model="dateStart" />
              </AppFormField>
            </AppFilter>

            <AppFilter v-model="dateEnd" filter-name="observerByUserId.medicalRecords.dateEnd">
              <AppFormField :label="'Termina'">
                <input type="date" class="form-control" v-model="dateEnd" />
              </AppFormField>
            </AppFilter>
          </div>
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

            <AppCheckPermission :permission="`${permission}.edit`">
              <AppButtonEdit @click="toggleDrawer(row)" />
            </AppCheckPermission>

            <AppCheckPermission :permission="`${permission}.delete`">
              <AppButtonDelete @click="openModalDelete(row.id)" />
            </AppCheckPermission>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>
    </template>
  </AppCard>

  <ObseByUserMediRecoFormDrawer v-model:isVisible="isVisibleDrawer" :medicalRecord="currentMedicalRecord" :wellnessAreasList="wellnessAreasList" :userId="userId" @reload-data="updateDatatable()" />

  <AppModal v-model="seeDetailModal" :size="'lg'">
    <template v-if="currentMedicalRecord && seeDetailModal">
      <MedicalRecordDetail :medicalRecord="currentMedicalRecord" />
    </template>
  </AppModal>

  <AppModal v-model="modalDelete">
    <template v-if="modalDelete">
      <AppConfirmDeleteModal entity="access.medicalRecord.singular" @confirmDelete="deleteMedicalRecord" />
    </template>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, computed, onMounted, PropType } from 'vue';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import TableDashboard from '../../administration/components/TableDashboard.vue';
import MedicalRecordDetail from '../../access/components/MedicalRecordDetail.vue';
import ObseByUserMediRecoFormDrawer from '../components/ObseByUserMediRecoFormDrawer.vue';

import { MedicalRecordDto } from '../../access/dtos/medicalRecord.dto';

import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';

import { DeleteMedicalRecordService } from '../../access/services/deleteMedicalRecord.service';
import { GetWellnessAreasService } from '../../institutionalConfiguration/services/getWellnessAreas.service';
import { GetMedicalRecordsWithPaginationService } from '../../access/services/getMedicalRecordsWithPagination.service';
import { GetMedicalRecordsDashboardService } from '../../institutionalConfiguration/services/getMedicalRecordsDashboard.service';

const getWellnessAreasService = new GetWellnessAreasService();
const getMedicalRecordsDashboardService = new GetMedicalRecordsDashboardService();

const deleteMedicalRecordService = new DeleteMedicalRecordService();
const updateDatatableService = new UpdateDatatableService();

dayjs.extend(timezone);
dayjs.extend(utc);

export default defineComponent({
  name: 'ObseByUserIdMedicalRecords',
  components: {
    ObseByUserMediRecoFormDrawer,
    AppConfirmDeleteModal,
    MedicalRecordDetail,
    AppDatatableColumn,
    AppCheckPermission,
    AppAutocomplete,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppDatatable,
    AppFormField,
    AppButton,
    AppFilter,
    AppModal,
    AppCard,

    TableDashboard,
  },

  props: {
    userId: {
      type: Number as PropType<number>,
      required: true,
    },
    permission: {
      type: String as PropType<string>,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();

    const service = new GetMedicalRecordsWithPaginationService();
    const name = 'access.medicalRecord.title';
    const params = computed(() => {
      return {
        wellnessAreaId: wellnessAreaId.value,
        dateSince: dateStart.value,
        dateUntil: dateEnd.value,
        userId: props.userId,
        order: 'desc',
      };
    });

    const currentMedicalRecord: Ref<MedicalRecordDto | null> = ref(null);
    const wellnessAreasList = ref<any[]>([]);
    const cardsDatas = ref([{}]);
    const dataDasboard = ref();

    const wellnessAreaId = ref<number | null>(null);
    const dateStart = ref<string | null>(null);
    const dateEnd = ref<string | null>(null);

    const loading = ref(true);
    const modalDelete = ref(false);
    const seeDetailModal = ref(false);
    const isVisibleDrawer = ref(false);
    const formMedicalRecordModal = ref(false);

    onMounted(async () => {
      try {
        wellnessAreasList.value = await getWellnessAreasService.run();
        await getDataDashboard();

        let localfilters: any = localStorage.getItem('filters') ?? '';
        let localfiltersKey = 'observerByUserId.medicalRecords';

        if (localfilters) {
          localfilters = JSON.parse(localfilters);

          wellnessAreaId.value = localfilters[`${localfiltersKey}.wellnessAreaId`] ? Number(localfilters[`${localfiltersKey}.wellnessAreaId`]) : null;
          dateStart.value = localfilters[`${localfiltersKey}.dateStart`] ? localfilters[`${localfiltersKey}.dateStart`] : null;
          dateEnd.value = localfilters[`${localfiltersKey}.dateEnd`] ? localfilters[`${localfiltersKey}.dateEnd`] : null;
        }
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const getDataDashboard = async () => {
      dataDasboard.value = await getMedicalRecordsDashboardService.run({
        userId: props.userId,
      });

      const cardsData = [
        {
          title: dataDasboard.value[0].wellnessAreaName,
          data: dataDasboard.value[0].medicalRecords,
          icon: 'totalWellnessAreas',
          border: 'border-right: 1px solid #9ea1a5;',
        },
      ];

      const startingIndex = 1;
      for (let i = startingIndex; i < dataDasboard.value.length; i++) {
        const item = dataDasboard.value[i];

        cardsData.push({
          title: item.wellnessAreaName,
          data: item.medicalRecords,
          icon: 'WellnessAreas',
          border: '',
        });
      }

      cardsDatas.value = cardsData;
    };

    const limitText = (text: string) => {
      const characterLimit = 50;
      let newText = text.substring(0, characterLimit);

      if (text.length > characterLimit) newText += '...';

      return newText;
    };

    const updateDatatable = async () => {
      currentMedicalRecord.value = null;

      await getDataDashboard();
      updateDatatableService.run();
    };

    const toggleDrawer = (medicalRecord: MedicalRecordDto | null = null) => {
      currentMedicalRecord.value = medicalRecord;
      isVisibleDrawer.value = !isVisibleDrawer.value;
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
      console.log('currentMedicalRecord.value', currentMedicalRecord.value);
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
      dayjs,
      t,

      isVisibleDrawer,
      loading,

      service,
      params,
      name,

      wellnessAreaId,
      dataDasboard,
      cardsDatas,
      dateStart,
      dateEnd,

      formMedicalRecordModal,
      currentMedicalRecord,
      wellnessAreasList,
      seeDetailModal,
      modalDelete,

      deleteMedicalRecord,
      openSeeDetailModal,
      updateDatatable,
      openModalDelete,
      toggleDrawer,
      limitText,
    };
  },
});
</script>
