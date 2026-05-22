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

        <SelectionStudentsByParent v-if="data.matriculates.matriculateParentId" @update-student-user-id="updateStudentUserId" />
        <AppEmptyResponse v-if="!reports.length" :showImage="true" />
        <div v-else class="row">
          <section class="content-button col-12 col-sm-4 col-md-3">
            <AppCard v-for="(dat, index) in reports" :key="index">
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
                  <!-- <div v-if="currentFile.value.disabledSend === 1" class="message">¡Bloqueado! Por favor contactarse con el área de contabilidad.</div> -->
            
                <AppEmptyResponse v-if="currentFile.value.disabledSend === 1" :show-image="true"  :title="'¡Bloqueado! Por favor contactarse con el área de contabilidad.'" :subtitle="false"
                ></AppEmptyResponse>

                  <!-- <div v-else-if="currentFile.value.state === null" class="message">El boletín de calificaciones no ha sido publicado</div> -->
                <AppEmptyResponse v-else-if="currentFile.value.state === null" :show-image="true"  :title="'El boletín de calificaciones no ha sido publicado'" :subtitle="false"
                ></AppEmptyResponse>
                  <iframe v-else-if="currentFile.value.disabledSend === 0" :src="currentFile.value?.url" class="responsive-iframe"></iframe>
                  <!-- <div v-else>No hay archivo que mostrar.</div> -->
                   <AppEmptyResponse v-else :show-image="true"  :title="'No hay archivo que mostrar'" :subtitle="false"
                  ></AppEmptyResponse>
                </div>
              </template>
              <template #footer>
                <div class="d-flex flex-row-reverse p-2">
                  <div class="d-flex align-items-center gap-2">
                    <AppButton
                      :disabled="currentFile.value.disabledSend === 1 || currentFile.value.state === null"
                      :href="currentFile.value?.url"
                      label="Descargar"
                      variant="primary"
                      target="_blank"
                      outlined
                    />
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
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import SelectionStudentsByParent from '../../administration/components/SelectionStudentsByParent.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersCardByGroupService, IGetFiltersCardByGroupService } from '../services/filters/getFiltersCardByGroup.service';
import { LockUnlockReportService } from '../services/filters/lockUnlockReport.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetStudentsByPeriodIdService } from '../services/filters/getStudentsByPeriodId.service';
import { GenerateReportCardsByLevelService } from '../services/reports/generateReportCardsByLevel.service';
import { GenerateReportCardPerStudentService } from '../services/reports/generateReportCardPerStudent.service';
import { DownloadReportCardsService } from '../services/reports/downloadReportCards.service';
import { GetInitDataService } from '../../../shared/services/getInitData.service';
import { GetReportsService } from '../services/filters/getReports.service';
import { GetTutorStudentsService } from '../../administration/services/getTutorStudents.service';
import { Console } from 'console';
import { UpdateReportStoreService } from '../services/reports/updateReportStore.service';
import { GetPublishMassiveReportStoreService } from '../services/reports/getpublishMassiveReportStore.service';
import { State } from 'linkifyjs';
import { useHeaderStore } from '../../../stores/header.store';

const getTutorStudentsService = new GetTutorStudentsService();
const generateReportCardPerStudentService = new GenerateReportCardPerStudentService();
const generateReportCardsByLevelService = new GenerateReportCardsByLevelService();
const getFiltersCardByGroupService = new GetFiltersCardByGroupService();
const lockUnlockReportService = new LockUnlockReportService();
const updateDatatableService = new UpdateDatatableService();
const downloadReportCardsService = new DownloadReportCardsService();
const getInitDataService = new GetInitDataService();
const getReportsService = new GetReportsService();
const updateReportStoreService = new UpdateReportStoreService();
const getpublishMassiveReportStoreService = new GetPublishMassiveReportStoreService();
const getStudentsByPeriodIdService = new GetStudentsByPeriodIdService();

export default defineComponent({
  name: 'ReportCard',
  components: {
    AppEmptyResponse,
    SelectionStudentsByParent,
    AppLoading,
    BaseReport,
    AppButton,
    AppCard,
  },

  setup() {
    const { t } = useI18n();
    const name = 'reportCard';
    const title = 'reports.reportCard';
    const permission = 'reports.cards.reportCard';
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
    const studentByTutors = ref<any>([]);
    const reports = ref<any[]>([]);

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

    const filters = ref<IGetFiltersCardByGroupService>({
      subjectCategories: [],
      studentCategories: [],
      academicPeriods: [],
      options: {},
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
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: {},
          groupId: {},
          periodId: { required },
          convertTo: { required },
          studentCategories: {},
          subjectCategories: {},
          decimalNumber: {},
          itemCode: { required },
          showFields: { required },
        },
      },
      { form }
    );

    const service = new GetStudentsByPeriodIdService();
    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      degreeId: form.degreeId,
      groupId: form.groupId,
      periodId: form.periodId,
      studentCat: form.studentCategories,
      subjectCat: form.subjectCategories,
      disabledSend: lockStudents.value ? 'disabled' : '',
      itemCode: permission,
      options: form.showFields,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Mis informes', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      data.value = await getInitDataService.run();

      filters.value = await getFiltersCardByGroupService.run();
      if ('lockedOption' in filters.value.options) {
        filters.value.options.lockedOption = false;
      }

      studentByTutors.value = await getTutorStudentsService.run();
      if (data.value.matriculates.matriculateId || data.value.matriculates.matriculateParentId) {
        const dataSend: any = {
          itemCode: permission,
          typeBulletin: 0,
          matriculateId: data.value.matriculates.matriculateId ?? studentByTutors.value[0].matriculateId,
        };
        reports.value = await getReportsService.run(dataSend);
        currentFile.value = reports.value[0];
      }
      loading.value = false;
    });

    const updateStudentUserId = async (studentUserId: any) => {
      if (studentUserId) {
        const params = {
          matriculateId: studentByTutors.value.find((item: any) => item.people.userId === studentUserId).matriculateId ?? '',
          itemCode: permission,
          typeBulletin: 0,
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

    const generateAll = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const response = await generateReportCardsByLevelService.run(getFilterReports());

        reportId.value = response.reportId;
      } catch (e) {
        console.log(e);
      }
    };

    const generateIndividualReport = async (data: any) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const response = await generateReportCardPerStudentService.run({
          ...getFilterReports(),
          userId: data.userId,
          matriculateId: data.id,
        });

        reportId.value = response.reportId;
      } catch (e) {
        console.log(e);
      }
    };

    const lockUnlockReport = async (element: any) => {
      if (!element.report) {
        return;
      }

      element.disabledButton = true;

      try {
        await lockUnlockReportService.run(element.report.id, !element.report.disabledSend);
        refreshData();
      } catch (e) {
        console.log(e);
      }

      element.disabledButton = false;
    };

    const getFilterReports = () => {
      const data = { ...form };
      return {
        academicPeriodId: data.academicPeriodId,
        levelId: data.levelId,
        degreeId: data.degreeId,
        groupId: data.groupId,
        periodId: data.periodId,
        convertTo: 'pdf',
        studentCategories: data.studentCategories,
        subjectCategoriesIds: data.subjectCategories,
        decimalNumber: data.decimalNumber,
        itemCode: permission,
        options: data.showFields,
      };
    };

    const sendMailAll = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      filtersAux.value = {
        ...getFilterReports(),
      };

      sendMailModal.value = true;
    };
    const sendIndividualMail = async (matriculateId: number) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      filtersAux.value = {
        ...getFilterReports(),
        matriculateId,
      };

      sendMailModal.value = true;
    };
    const closeSendMailModalModal = () => {
      sendMailModal.value = false;
      refreshData();
    };

    const openFormModalEditPositionSubjectPeriods = async (matriculateSubjectPeriod: any) => {
      currentMatriculateSubjectPeriod.value = matriculateSubjectPeriod;

      openModal.value = true;
    };
    const closeModalForm = async () => {
      openModal.value = false;
      await listStudents(false);
      currentMatriculateSubjectPeriod.value;
    };

    const refreshData = () => {
      updateDatatableService.run();
    };

    const downloadAll = async (typeFile = 'pdf') => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const filter = getFilterReports();

        const dataSend = {
          academicPeriodId: filter.academicPeriodId,
          levelId: filter.levelId,
          degreeId: filter.degreeId,
          groupId: filter.groupId,
          periodId: filter.periodId,
          studentCategoriesIds: filter.studentCategories,
          itemCode: filter.itemCode,
          typeFile: typeFile,
        };

        const response = await downloadReportCardsService.run(dataSend);
        // const url = response.file;
        reportId.value = response.reportId;

        // if (url) {
        //   const link = document.createElement('a');
        //   link.href = url;
        //   document.body.appendChild(link);
        //   link.click();
        // }
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
        periodId: form.periodId,
        studentCat: form.studentCategories,
        subjectCat: form.subjectCategories,
        disabledSend: lockStudents.value ? 'disabled' : '',
        itemCode: permission,
        options: form.showFields,
      };

      const response = await getpublishMassiveReportStoreService.run(params);
      console.log('data', response);
      const service = await getStudentsByPeriodIdService.run(params);
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
      filters,
      currentFile,
      changeCurrentFile,
      loadingStep,

      generateIndividualReport,
      publicIndividualReport,
      closeSendMailModalModal,
      openFormModalEditPositionSubjectPeriods,
      currentMatriculateSubjectPeriod,
      closeModalForm,
      sendIndividualMail,
      lockUnlockReport,
      listStudents,
      downloadAll,
      refreshData,
      sendMailAll,
      publicAll,
      openModal,
      generateAll,
      updateStudentUserId,
      data,
      reports,
      profileId,
      studentByTutors,
    };
  },
});
</script>

<style scoped>
/* Ajustes generales de grid */
.content .row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -0.5rem;
}
.content .row > section {
  padding: 0 0.5rem;
}

/* Altura del iframe */
.responsive-iframe {
  width: 100%;
  height: calc(100vh - 200px); /* Ajusta 200px según header/footer */
  border: none;
}

/* Botones responsivos */
.responsive-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.buttons {
  flex: 1 1 auto;
}

/* Filas de filtros */
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.form-row > * {
  flex: 1 1 200px;
}

/* Reutiliza tus estilos existentes */
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
.message {
  padding-top: 150px;
  justify-content: center;
}
.appcard-container {
  height: unset;
}
.content-button {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}
/* Media queries */
@media (max-width: 800px) {
  .content {
    display: flex;
    flex-direction: column;
  }
}
@media (max-width: 576px) {
  .form-row,
  .responsive-buttons {
    flex-direction: column;
  }
  .buttons {
    width: 100%;
  }
}
</style>
