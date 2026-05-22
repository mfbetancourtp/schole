<template>
  <AppLoading v-if="loading"></AppLoading>
  <div class="content" v-else-if="profileId === 4 || profileId === 2">
    <div>
      <BaseReport :title="title" :v$="v$" :routes="routes" :service="service" :params="params" :show-btn-generate="false">
        <SelectionStudentsByParent v-if="data.matriculates.matriculateParentId" @update-student-user-id="updateStudentUserId"></SelectionStudentsByParent>
        <AppEmptyResponse v-if="!reports.length" :showImage="true"></AppEmptyResponse>
        <div v-else class="row">
          <section class="content-button col-3">
            <AppCard
              v-for="(dat, index) in reports"
              v-bind:class="{ 'borde-left': currentFile.value?.id == dat.id }"
              @click="changeCurrentFile(dat)"
              class="card-hover mt-1 mb-1 pointer card"
              :key="index"
            >
              <template #body>
                <h5>{{ dat.value }} {{ dat.periodName }}</h5>
              </template>
            </AppCard>
          </section>

          <section class="content-document col-9">
            <AppLoading v-if="loadingStep"></AppLoading>

            <AppCard v-else class="h-100">
              <template #body>
                <div class="text-center" style="color: #aaa">
                  <div v-if="currentFile.value.disabledSend === 1" class="message">¡Bloqueado! Por favor contactarse con el área de contabilidad.</div>
                  <div v-else-if="currentFile.value.state === null" class="message">El boletín de calificaciones no ha sido publicado</div>
                  <iframe v-else-if="currentFile.value.disabledSend === 0" :src="currentFile.value?.url" style="width: 100%; height: 61rem; border: none"></iframe>
                  <div v-else>No hay archivo que mostrar.</div>
                </div>
              </template>
              <template #footer>
                <div class="d-flex flex-row-reverse">
                  <div class="d-flex align-items-center gap-2">
                    <AppButton
                      :disabled="currentFile.value.disabledSend === 1 || currentFile.value.state === null"
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
      </BaseReport>
    </div>
  </div>

  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params" :show-btn-generate="false">
    <!-- Form -->
    <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :permission="permission" :v$="v$"> </FilterAcademicPeriodWithLevels>
    <div class="form-row">
      <AppFormField :form-control="v$.form.certificateTemplateId" :label="t('degreesAndTitles.certificate.singular')">
        <AppAutocompleteRemote
          input-id="certificateTemplateId"
          :service="getCertificatesTemplatesWithPaginateService"
          :paramsService="{
            perPage: 10,
          }"
          :init="v$.form.certificateTemplateId.$model ?? null"
          v-model="v$.form.certificateTemplateId.$model"
          label="name"
          @loading-finished="loading = false"
          :reduce="(o: any) => o.id"
        ></AppAutocompleteRemote>
      </AppFormField>
      <AppFormField> </AppFormField>
    </div>

    <AppFormField> </AppFormField>
    <!-- btns form -->
    <div class="responsive-buttons">
      <AppButton class="buttons" :label="'reports.filters.listStudents'" :native-type="'button'" @click="listStudents(false)" variant="primary"></AppButton>
    </div>

    <!-- ReportProgress -->
    <div class="mt-2" v-if="reportId">
      <ReportProgress :report-id="reportId" @finish-generation="refreshData()"></ReportProgress>
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
        <ConfirmSendMailCertificateNotes v-if="sendMailModal" :filters="filtersAux.value" @close="closeSendMailModalModal"> </ConfirmSendMailCertificateNotes>
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
import FilterAcademicPeriodWithLevels from '../components/FilterAcademicPeriodWithLevels.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import ConfirmSendMailCertificateNotes from '../components/ConfirmSendMailCertificateNotes.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import SelectionStudentsByParent from '../../administration/components/SelectionStudentsByParent.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { LockUnlockReportEndOfYearService } from '../services/filters/lockUnlockReportEndOfYear.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetStudentsPeaceSafetyService } from '../services/filters/getStudentsPeaceSafety.service';
import { GeneratePeaceSafetyService } from '../services/reports/generatePeaceSafety.service';
import { GeneratePeaceSafetyPerStudentService } from '../services/reports/generatePeaceSafetyPerStudent.service';
import { DownloadPeaceSafetyService } from '../services/reports/downloadPeaceSafety.service';
import { GetFiltersBookGradeService } from '../services/filters/getFiltersBookGrade.service';
import { GetInitDataService } from '../../../shared/services/getInitData.service';
import { GetReportsService } from '../services/filters/getReports.service';
import { GetTutorStudentsService } from '../../administration/services/getTutorStudents.service';
import { UpdateReportStoreService } from '../services/reports/updateReportStore.service';
import { GetPublishMassiveReportStoreService } from '../services/reports/getpublishMassiveReportStore.service';
import { useHeaderStore } from '../../../stores/header.store';
import { GenerateReportTrainingCertificateService } from '../services/reports/generateReportTrainingCertificate.service';
import { GetCertificatesTemplatesWithPaginateService } from '../../certificates/services/getCertificatesTemplatesWithPaginate.service';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocompleteRemote from '../../../shared/components/Forms/AppAutocompleteRemote.vue';

const getTutorStudentsService = new GetTutorStudentsService();
const generateReportTrainingCertificateService = new GenerateReportTrainingCertificateService();
const generatePeaceSafetyService = new GeneratePeaceSafetyService();
const getFiltersBookGradeService = new GetFiltersBookGradeService();
const lockUnlockReportEndOfYear = new LockUnlockReportEndOfYearService();
const updateDatatableService = new UpdateDatatableService();
const downloadPeaceSafetyService = new DownloadPeaceSafetyService();
const getInitDataService = new GetInitDataService();
const getReportsService = new GetReportsService();
const updateReportStoreService = new UpdateReportStoreService();
const getpublishMassiveReportStoreService = new GetPublishMassiveReportStoreService();
const getStudentsPeaceSafetyService = new GetStudentsPeaceSafetyService();
const getCertificatesTemplatesWithPaginateService = new GetCertificatesTemplatesWithPaginateService();

export default defineComponent({
  name: 'ReportTrainingCertificate',
  components: {
    FilterAcademicPeriodWithLevels,
    ConfirmSendMailCertificateNotes,
    AppDatatableColumn,
    AppButtonGroup,
    ReportProgress,
    AppDatatable,
    AppLoading,
    BaseReport,
    AppButton,
    AppModal,
    AppEmptyResponse,
    SelectionStudentsByParent,
    AppCard,
    AppAutocompleteRemote,
    AppFormField,
  },

  setup() {
    const { t } = useI18n();
    const name = 'reportCard';
    const title = 'reports.certificatesTrainingCertificate';
    const permission = 'reports.certificates.trainingCertificate';
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

    const filters = ref<any>({
      typeBulletin: 4,
    });
    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      degreeId: null,
      groupId: null,
      convertTo: 'pdf',
      itemCode: permission,
      typeBulletin: 4,
      certificateTemplateId: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: { required },
          groupId: { required },
          convertTo: { required },
          itemCode: { required },
          typeBulletin: {},
          certificateTemplateId: { required },
        },
      },
      { form }
    );

    const service = new GetStudentsPeaceSafetyService();
    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      degreeId: form.degreeId,
      groupId: form.groupId,
      disabledSend: lockStudents.value ? 'disabled' : '',
      itemCode: permission,
      typeBulletin: form.typeBulletin,
      certificateTemplateId: form.certificateTemplateId,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      // dataCertification.value = response.data;
      filters.value = await getFiltersBookGradeService.run();
      studentByTutors.value = await getTutorStudentsService.run();
      data.value = await getInitDataService.run();
      if (data.value.matriculates.matriculateId || data.value.matriculates.matriculateParentId) {
        const dataSend: any = {
          itemCode: permission,
          typeBulletin: 4,
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
          typeBulletin: 4,
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
        const response = await generatePeaceSafetyService.run(getFilterReports());

        reportId.value = response.reportId;
      } catch (e) {
        console.log(e);
      }
    };

    const generateIndividualReport = async (data: any) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const response = await generateReportTrainingCertificateService.run({
          ...getFilterReports(),
          userId: data.userId,
          matriculateId: data.id,
          certificateTemplateId: form.certificateTemplateId,
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
        await lockUnlockReportEndOfYear.run(element.report.id, !element.report.disabledSend);
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
        convertTo: 'pdf',
        itemCode: permission,
        typeBulletin: data.typeBulletin,
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

    const downloadAll = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const filter = getFilterReports();

        const dataSend = {
          academicPeriodId: filter.academicPeriodId,
          levelId: filter.levelId,
          degreeId: filter.degreeId,
          groupId: filter.groupId,
          itemCode: filter.itemCode,
          typeBulletin: filter.typeBulletin,
        };

        const response = await downloadPeaceSafetyService.run(dataSend);
        const url = response.file;

        if (url) {
          const link = document.createElement('a');
          link.href = url;
          document.body.appendChild(link);
          link.click();
        }
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
        disabledSend: lockStudents.value ? 'disabled' : '',
        itemCode: permission,
        typeBulletin: form.typeBulletin,
      };

      const response = await getpublishMassiveReportStoreService.run(params);
      console.log('data', response);
      const service = await getStudentsPeaceSafetyService.run(params);
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
      profileId,
      permission,
      reportId,
      loading,
      filters,
      currentFile,
      loadingStep,
      changeCurrentFile,

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
      studentByTutors,
      getCertificatesTemplatesWithPaginateService,
    };
  },
});
</script>

<style scoped>
.responsive-buttons {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  /* justify-content: flex-end; */
  align-items: center;
  gap: 10px;
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
</style>
