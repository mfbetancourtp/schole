<template>
  <AppLoading v-if="loading"></AppLoading>
  <div class="content" v-else-if="profileId === 4 || profileId === 2">
    <div>
      <BaseReport :title="title" :v$="v$" :routes="routes" :service="service" :params="params" :show-btn-generate="false">
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
                  <div v-if="currentFile.value.disabledSend === 1" class="message">¡Bloqueado! Por favor contactarse con el área de contabilidad.</div>
                  <div v-else-if="currentFile.value.state === null" class="message">El boletín de calificaciones no ha sido publicado</div>
                  <iframe v-else-if="currentFile.value.disabledSend === 0" :src="currentFile.value?.url" class="responsive-iframe"></iframe>
                  <div v-else>No hay archivo que mostrar.</div>
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
      </BaseReport>
    </div>
  </div>

  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params" :show-btn-generate="false">
    <!-- Form -->
    <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :permission="permission" :v$="v$" />
    <!-- 
    <div class="form-row">
      <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$" />
      <FilterStudentClassification :options="filters.studentCategories" :v$="v$" />
    </div> -->

    <!-- <div class="form-row">
      <AppFormField :form-control="v$.form.decimalNumber" label="reports.filters.numberOfDecimals">
        <input id="decimalNumber" class="form-control" type="number" v-model="v$.form.decimalNumber.$model" />
      </AppFormField>
      <FilterSubjectClassification :options="filters.subjectCategories" :v$="v$" />
    </div> -->

    <!-- <FilterShowFields :options="filters.options" :v$="v$" /> -->

    <!-- btns form -->
    <div class="responsive-buttons">
      <AppButton class="buttons" label="Listar bloqueados" native-type="button" @click="listStudents(true)" variant="primary" />
      <AppButton class="buttons" label="reports.filters.listStudents" native-type="button" @click="listStudents(false)" variant="primary" />
      <AppButton class="buttons" label="reports.filters.generateAll" :disabled="!showListStudents" native-type="button" @click="generateAll()" variant="primary" />
      <!-- <AppButton class="buttons" label="Publicar todos" :disabled="!showListStudents" native-type="button" @click="publicAll()" variant="primary" /> -->
      <AppButton class="buttons" label="reports.filters.sendGenerated" :disabled="!showListStudents" native-type="button" @click="sendMailAll()" variant="primary" />
      <div class="dropdown">
        <AppButton
          class="buttons dropdown-toggle"
          label="Descargar todos"
          :disabled="!showListStudents"
          native-type="button"
          variant="primary"
          data-bs-toggle="dropdown"
          data-bs-auto-close="true"
          aria-expanded="false"
        />
        <ul class="dropdown-menu">
          <li>
            <button
              class="dropdown-item"
              @click="
                downloadAll('pdf');
                $event.target.closest('.dropdown').querySelector('.dropdown-toggle').click();
              "
            >
              PDF
            </button>
          </li>
          <li>
            <button
              class="dropdown-item"
              @click="
                downloadAll('zip');
                $event.target.closest('.dropdown').querySelector('.dropdown-toggle').click();
              "
            >
              Zip
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- ReportProgress -->
    <div class="mt-2" v-if="reportId">
      <ReportProgress :report-id="reportId" @finish-generation="refreshData()" />
    </div>

    <!-- dataTable -->
    <div v-if="showListStudents" class="mt-2 table-responsive">
      <AppDatatable :service="service" :params="params" :name="name">
        <AppDatatableColumn :label="'core.generalTerms.academic.student.singular'" field="student" :sortable="true" v-slot="{ row }">
          {{ row.student }}
        </AppDatatableColumn>

        <AppDatatableColumn :label="'academicPrograms.levels.singular'" field="levels" :sortable="true" v-slot="{ row }">
          {{ row.levelName }}
        </AppDatatableColumn>

        <AppDatatableColumn :label="'academicPrograms.degrees.singular'" field="degrees" :sortable="true" v-slot="{ row }"> {{ row.degreeName }} {{ row.groupName }} </AppDatatableColumn>

        <AppDatatableColumn :label="'reports.filters.status'" field="status" :sortable="true" v-slot="{ row }">
          <div class="tw-leading-5 tw-truncate tw-font-light">
            <span v-if="row.report?.disabledSend" class="bg-danger text-white rounded-pill ps-2 pe-2">Bloqueado</span>

            <span
              v-else
              v-bind:class="{
                'bg-dark': row.status == 'Pendiente',
                'bg-warning': row.report.state == 'Publicado' && !row.report.isSent && row.status == 'Generado',
                'bg-success': row.status == 'Generado' && !row.report.isSent,
                'bg-primary': row.report.isSent,
              }"
              class="text-white rounded-pill ps-2 pe-2"
            >
              {{ !row.report.isSent ? (row.report.state ? row.report.state : row.status) : 'Enviado' }}
            </span>
          </div>
        </AppDatatableColumn>

        <AppDatatableColumn :label="'core.actions'" v-slot="{ row }">
          <AppButtonGroup size="sm">
            <AppButton @click="generateIndividualReport(row)" v-tooltip="t('Generar reporte')" v-if="!row.report?.url" variant="primary" icon="file-alt" outlined></AppButton>

            <AppButton v-tooltip="t('Volver a generar reporte')" @click="generateIndividualReport(row)" v-if="row.report?.url" variant="primary" icon="sync-alt" outlined></AppButton>

            <AppButton v-if="row.report.disabledSend" @click="lockUnlockReport(row)" v-tooltip="t('Desbloquear')" variant="primary" icon="ban" outlined></AppButton>

            <AppButton v-if="!row.report.disabledSend && row.report?.url" @click="lockUnlockReport(row)" v-tooltip="t('Bloquear')" icon="check-circle" variant="primary" outlined></AppButton>

            <AppButton
              v-if="row.report?.url && !row.report?.disabledSend"
              v-tooltip="t('Enviar reporte por email')"
              @click="sendIndividualMail(row.id)"
              variant="primary"
              icon="envelope"
              outlined
            ></AppButton>

            <AppButton
              v-tooltip="t('academicAdministration.subjectAssignmentsCourse.report')"
              v-if="row.report?.url && !row.report?.disabledSend"
              :href="row.report.url"
              variant="primary"
              target="_blank"
              icon="eye"
              outlined
            >
            </AppButton>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>

      <AppModal v-model="sendMailModal">
        <ConfirmSendMailReportObservation v-if="sendMailModal" :filters="filtersAux.value" @close="closeSendMailModalModal"> </ConfirmSendMailReportObservation>
      </AppModal>
      <AppModal v-model="openModal">
        <SubjectPositionFormEdit v-if="openModal" :data="currentMatriculateSubjectPeriod" @close="closeModalForm" />
      </AppModal>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, defineComponent, onMounted, reactive, ref, Ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import BaseReport from '../components/BaseReport.vue';
import ReportProgress from '../components/ReportProgress.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import FilterAcademicPeriodWithLevels from '../components/FilterAcademicPeriodWithLevels.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import SubjectPositionFormEdit from '../components/SubjectPositionFormEdit.vue';
import SelectionStudentsByParent from '../../administration/components/SelectionStudentsByParent.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersCardByGroupService, IGetFiltersCardByGroupService } from '../services/filters/getFiltersCardByGroup.service';
import { LockUnlockReportService } from '../services/filters/lockUnlockReport.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';

import { GetInitDataService } from '../../../shared/services/getInitData.service';
import { GetReportsService } from '../services/filters/getReports.service';
import { GetTutorStudentsService } from '../../administration/services/getTutorStudents.service';
import { UpdateReportStoreService } from '../services/reports/updateReportStore.service';
import { GetPublishMassiveReportStoreService } from '../services/reports/getpublishMassiveReportStore.service';
import { useHeaderStore } from '../../../stores/header.store';
import { GetMatriculatesForObserverReport } from '../services/filters/getMatriculatesForObserverReport';
import { GenerateObserverReportByMatriculateService } from '../services/reports/generateObserverReportByMatriculate.service';
import { GetObserverReportForAllMatriculatesService } from '../services/reports/generateObserverReportForAllMatriculates';
import { DownloadObserverReportsService } from '../services/reports/downloadObserverReports';
import ConfirmSendMailReportObservation from '../components/ConfirmSendMailReportObservation.vue';

const getTutorStudentsService = new GetTutorStudentsService();
const generateObserverReportByMatriculateService = new GenerateObserverReportByMatriculateService();
const getObserverReportForAllMatriculatesService = new GetObserverReportForAllMatriculatesService();
const getFiltersCardByGroupService = new GetFiltersCardByGroupService();
const lockUnlockReportService = new LockUnlockReportService();
const updateDatatableService = new UpdateDatatableService();
const downloadObserverReportsService = new DownloadObserverReportsService();
const getInitDataService = new GetInitDataService();
const getReportsService = new GetReportsService();
const updateReportStoreService = new UpdateReportStoreService();
const getpublishMassiveReportStoreService = new GetPublishMassiveReportStoreService();
const getMatriculatesForObserverReport = new GetMatriculatesForObserverReport();

export default defineComponent({
  name: 'ObserverReport',
  components: {
    FilterAcademicPeriodWithLevels,
    AppEmptyResponse,
    SelectionStudentsByParent,
    AppDatatableColumn,
    AppButtonGroup,
    ReportProgress,
    AppDatatable,
    AppLoading,
    BaseReport,
    AppButton,
    AppModal,
    SubjectPositionFormEdit,
    AppCard,
    ConfirmSendMailReportObservation,
  },

  setup() {
    const { t } = useI18n();
    const name = 'reports.observerReport';
    const title = 'reports.observerReport';
    const permission = 'reports.discipline.observer';
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
          periodId: {},
          convertTo: { required },
          studentCategories: {},
          subjectCategories: {},
          decimalNumber: {},
          itemCode: { required },
          showFields: {},
        },
      },
      { form }
    );

    const service = new GetMatriculatesForObserverReport();
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
      headerStorage.module = { name: 'Home', url: '' };
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
        const response = await getObserverReportForAllMatriculatesService.run(getFilterReports());

        reportId.value = response.reportId;
      } catch (e) {
        console.log(e);
      }
    };

    const generateIndividualReport = async (data: any) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const response = await generateObserverReportByMatriculateService.run({
          userId: data.id,
          itemCode: permission,
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

        const response = await downloadObserverReportsService.run(dataSend);
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
      const service = await getMatriculatesForObserverReport.run(params);
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
