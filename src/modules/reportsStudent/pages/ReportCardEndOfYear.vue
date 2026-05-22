<template>
   <div class="content">
    <BaseReport
      :title="title"
      :v$="v$"
      :routes="routes"
      :service="service"
      :params="params"
      :show-btn-generate="false"
    >
      <!-- 1) Si está cargando, muestro el spinner -->
      <AppLoading v-if="loading" />

      <!-- 2) Cuando ya no carga, muestro el resto -->
      <template v-else>

        <SelectionStudentsByParent
          v-if="data.matriculates.matriculateParentId"
          @update-student-user-id="updateStudentUserId"
        ></SelectionStudentsByParent>
        <AppEmptyResponse
          v-if="!reports.length"
          :showImage="true"
        ></AppEmptyResponse>
        <div v-else class="row">
          <section class="content-button col-12 col-sm-4 col-md-3">
            <AppCard
              v-for="(dat, index) in reports"
              :key="index"
            >
              <template #body>
                <button @click="changeCurrentFile(dat)">

                  <h5>{{ dat.value }} {{ dat.periodName }}</h5>
                </button>
              </template>
            </AppCard>
          </section>

          <section class="content-document col-12 col-sm-8 col-md-9">
            <AppLoading v-if="loadingStep"></AppLoading>

            <AppCard v-else class="appcard-container">
              <template #body>
                <div class="text-center" style="color: #aaa">
                  <!-- <div
                    v-if="currentFile.value.disabledSend === 1"
                    class="message"
                  >
                    ¡Bloqueado! Por favor contactarse con el área de
                    contabilidad.
                  </div> -->
                  <AppEmptyResponse v-if="currentFile.value.disabledSend === 1" :show-image="true"  :title="'¡Bloqueado! Por favor contactarse con el área de contabilidad.'" :subtitle="false"
                  ></AppEmptyResponse>
                  <!-- <div
                    v-else-if="currentFile.value.state === null"
                    class="message"
                  >
                    El boletín de calificaciones no ha sido publicado
                  </div> -->
                  <AppEmptyResponse
                    AppEmptyResponse v-else-if="currentFile.value.state === null" :show-image="true"  :title="'El boletín de calificaciones no ha sido publicado'" :subtitle="false"
                  ></AppEmptyResponse>
                  <iframe
                    v-else-if="currentFile.value.disabledSend === 0"
                    :src="currentFile.value?.url"
                    style="width: 100%; height: 61rem; border: none"
                  ></iframe>
                  <!-- <div v-else>No hay archivo que mostrar.</div>
                    -->
                  <AppEmptyResponse v-else :show-image="true"  :title="'No hay archivo que mostrar'" :subtitle="false"
                  ></AppEmptyResponse>
                </div>
              </template>
              <template #footer>
                <div class="d-flex flex-row-reverse">
                  <div class="d-flex align-items-center gap-2">
                    <AppButton
                      :disabled="
                        currentFile.value.disabledSend === 1 ||
                        currentFile.value.state === null
                      "
                      :href="currentFile.value?.url"
                      :label="'Descargar'"
                      variant="primary"
                      target="_blank"
                      outlined
                    >
                    </AppButton>
                  </div>
                </div>
              </template>
            </AppCard>
          </section>
        </div>
        </template>
      </BaseReport>
  </div>

  
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, defineComponent, onMounted, reactive, ref, Ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import BaseReport from '../components/BaseReport.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import SelectionStudentsByParent from '../../administration/components/SelectionStudentsByParent.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetStudentsByAcademicPeriodIdService } from '../services/filters/getStudentsByAcademicPeriodId.service';
import { GetInitDataService } from '../../../shared/services/getInitData.service';
import { GetReportsService } from '../services/filters/getReports.service';
import { GetTutorStudentsService } from '../../administration/services/getTutorStudents.service';
import { UpdateReportStoreService } from '../services/reports/updateReportStore.service';
import { GetPublishMassiveReportStoreService } from '../services/reports/getpublishMassiveReportStore.service';
import { useHeaderStore } from '../../../stores/header.store';

const getTutorStudentsService = new GetTutorStudentsService();

const updateDatatableService = new UpdateDatatableService();
const getInitDataService = new GetInitDataService();
const getReportsService = new GetReportsService();
const updateReportStoreService = new UpdateReportStoreService();
const getpublishMassiveReportStoreService =
  new GetPublishMassiveReportStoreService();
const getStudentsByAcademicPeriodIdService =
  new GetStudentsByAcademicPeriodIdService();

export default defineComponent({
  name: 'ReportCardEndOfYear',
  components: {
    AppLoading,
    BaseReport,
    AppButton,
    AppEmptyResponse,
    SelectionStudentsByParent,
    AppCard,
  },

  setup() {
    const { t } = useI18n();
    const name = 'reportCard';
    const title = 'reports.reportCardEndOfYear';
    const permission = 'reports.cards.reportCardEndOfYear';
    const routes: BreadCrumbsType[] = [
      {
        name: 'reports.name',
        url: {
          name: 'reports.list',
        },
      },
      {
        name: title,
      },
    ];

    const showListStudents = ref(false);
    const sendMailModal = ref(false);
    const loading = ref(true);
    const reportId = ref();
    const currentMatriculateSubjectPeriod: Ref<any> = ref(null);
    const openModal = ref(false);
    const data = ref();
    const reports = ref<any[]>([]);
    const studentByTutors = ref<any>([]);
    const currentFile: { value: any } = reactive({
      value: null,
    });
    const loadingStep = ref(false);

    const lockStudents: { value: boolean } = reactive({
      value: false,
    });
    const filtersAux: { value: any } = reactive({
      value: null,
    });


    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      degreeId: null,
      groupId: null,
      periodId: null,
      convertTo: 'pdf',
      studentCategories: [],
      subjectCategories: [],
      decimalNumber: null,
      itemCode: permission,
      showFields: [],
      typeBulletin: 1,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: { required },
          groupId: { required },
          convertTo: { required },
          studentCategories: {},
          subjectCategories: {},
          decimalNumber: {},
          itemCode: { required },
          showFields: { required },
          typeBulletin: {},
        },
      },
      { form }
    );

    const service = new GetStudentsByAcademicPeriodIdService();
    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      degreeId: form.degreeId,
      groupId: form.groupId,
      studentCat: form.studentCategories,
      subjectCat: form.subjectCategories,
      disabledSend: lockStudents.value ? 'disabled' : '',
      itemCode: permission,
      options: form.showFields,
      typeBulletin: form.typeBulletin,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Mis informes', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      studentByTutors.value = await getTutorStudentsService.run();
      data.value = await getInitDataService.run();
      if (
        data.value.matriculates.matriculateId ||
        data.value.matriculates.matriculateParentId
      ) {
        const dataSend: any = {
          itemCode: permission,
          typeBulletin: 1,
          matriculateId:
            data.value.matriculates.matriculateId ??
            studentByTutors.value[0].matriculateId,
        };
        reports.value = await getReportsService.run(dataSend);
        currentFile.value = reports.value[0];
      }
      loading.value = false;
    });

    const updateStudentUserId = async (studentUserId: any) => {
      if (studentUserId) {
        const params = {
          matriculateId:
            studentByTutors.value.find(
              (item: any) => item.people.userId === studentUserId
            ).matriculateId ?? '',
          itemCode: permission,
          typeBulletin: 1,
        };

        reports.value = await getReportsService.run(params);
        currentFile.value = reports.value[0];
      }
    };

    const listStudents = async (lock: boolean) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      reportId.value = null;
      lockStudents.value = lock;
      showListStudents.value = true;

      setTimeout(() => {
        refreshData();
      }, 100);
    };






    const refreshData = () => {
      updateDatatableService.run();
    };

    const downloadAll = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {

        

      } catch (e) {
        console.log(e);
      }
    };

    const publicAll = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      const params = {
        academicPeriodId: form.academicPeriodId,
        levelId: form.levelId,
        degreeId: form.degreeId,
        groupId: form.groupId,
        studentCat: form.studentCategories,
        subjectCat: form.subjectCategories,
        disabledSend: lockStudents.value ? 'disabled' : '',
        itemCode: permission,
        options: form.showFields,
        typeBulletin: form.typeBulletin,
      };

      const response = await getpublishMassiveReportStoreService.run(params);
      const service = await getStudentsByAcademicPeriodIdService.run(params);

      refreshData();
    };

    const publicIndividualReport = async (dataId: number) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      try {
        await updateReportStoreService.run(dataId, 'Publicado');
        refreshData();
      } catch (error) {
        console.log(error);
      }
    };

    const changeCurrentFile = (file: any) => {
      currentFile.value = file;
    };
    const getProfileIdFromLocalStorage = () => {
      const profileId = localStorage.getItem('profileId');
      return profileId ? parseInt(profileId) : null;
    };
    const profileId = ref(getProfileIdFromLocalStorage());

    return {
      service,
      params,
      routes,
      title,
      name,
      v$,
      t,

      showListStudents,
      sendMailModal,
      filtersAux,
      permission,
      reportId,
      loading,
      currentFile,
      loadingStep,
      changeCurrentFile,
      profileId,

      publicIndividualReport,
      currentMatriculateSubjectPeriod,
      listStudents,
      downloadAll,
      refreshData,
      openModal,
      publicAll,
      updateStudentUserId,
      data,
      reports,
      studentByTutors,
    };
  },
});
</script>

<style scoped>
.position {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
}

.button-position {
  display: flex;
  padding: 5px;
  align-items: center;
}

.responsive-buttons {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  /* justify-content: flex-end; */
  align-items: center;
  gap: 10px;
}
.content-button {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}
@media (max-width: 500px) {
  .responsive-buttons {
    flex-direction: column;
  }

  .buttons {
    width: 100%;
  }
}

@media (max-width: 800px) {
  .content {
    display: flex;
    flex-direction: column;
  }

  .card {
    width: 100%;
  }
}
.appcard-container {
  height: unset;
}
</style>
