<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params" :show-btn-generate="false">
    <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :permission="permission" :v$="v$"> </FilterAcademicPeriodWithLevels>

    <div class="form-row">
      <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>
    </div>

    <div class="form-row">
      <FilterSubjectClassification :options="filters.subjectCategories" :v$="v$"></FilterSubjectClassification>
    </div>
    <div class="responsive-buttons">
      <AppButton class="buttons" :label="'reports.filters.listStudents'" :native-type="'button'" @click="listStudents(false)" variant="primary"></AppButton>
    </div>

    <div class="mt-2" v-if="reportId">
      <ReportProgress :report-id="reportId" @finish-generation="refreshData()"></ReportProgress>
    </div>

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
            <span v-if="row.report?.disabledSend" class="bg-warning text-white rounded-pill ps-2 pe-2">Bloqueado</span>

            <span
              v-else
              v-bind:class="{
                'bg-dark': row.status == 'Pendiente',
                'bg-success': row.status == 'Generado' && !row.report.isSent,
                'bg-primary': row.report.isSent,
              }"
              class="text-white rounded-pill ps-2 pe-2"
            >
              {{ !row.report.isSent ? row.status : 'Enviado' }}
            </span>
          </div>
        </AppDatatableColumn>

        <AppDatatableColumn :label="'core.actions'" v-slot="{ row }">
          <AppButtonGroup size="sm">
            <AppButton @click="generateIndividualReport(row)" v-tooltip="t('Generar reporte')" v-if="!row.report?.url" variant="primary" icon="file-alt" outlined></AppButton>
            <AppButton v-tooltip="t('Volver a generar reporte')" @click="generateIndividualReport(row)" v-if="row.report?.url" variant="primary" icon="sync-alt" outlined></AppButton>

            <AppButton
              v-tooltip="t('academicAdministration.subjectAssignmentsCourse.report')"
              v-if="row.report?.url"
              :href="row.report.url"
              variant="primary"
              target="_blank"
              icon="eye"
              outlined
            ></AppButton>
            <AppButton
              v-if="row.report?.url && !row.report?.disabledSend"
              v-tooltip="t('Enviar reporte por email')"
              @click="sendIndividualMail(row.id)"
              variant="primary"
              icon="envelope"
              outlined
            ></AppButton>
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
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';

import BaseReport from '../components/BaseReport.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';
import FilterAcademicPeriodWithLevels from '../components/FilterAcademicPeriodWithLevels.vue';
import ConfirmSendMailCertificateNotes from '../components/ConfirmSendMailCertificateNotes.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import ReportProgress from '../components/ReportProgress.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersStudentPerformanceService } from '../services/filters/getFiltersStudentPerformance.service';
import { GetFiltersBookGradeService, IGetFiltersBookGradeService } from '../services/filters/getFiltersBookGrade.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetListStudentsGradeBookService } from '../services/filters/getListStudentsGradeBook.service';
import { GenerateAllReportsBookGradeService } from '../services/reports/generateAllReportsBookGrade.service';
import { GenerateCertificationNotesPerStudentService } from '../services/reports/generateCertificationNotesPerStudent.service';
import { DownloadBookGradeService } from '../services/reports/downloadBookGrade.service';
import { useHeaderStore } from '../../../stores/header.store';

const generateCertificationNotesPerStudentService = new GenerateCertificationNotesPerStudentService();
const generateAllReportsBookGradeService = new GenerateAllReportsBookGradeService();
const getFiltersBookGradeService = new GetFiltersBookGradeService();
const updateDatatableService = new UpdateDatatableService();
const downloadBookGradeService = new DownloadBookGradeService();

export default defineComponent({
  name: 'CertificateMatriculateByUser',
  components: {
    FilterAcademicPeriodWithLevels,
    FilterStudentClassification,
    FilterSubjectClassification,
    ConfirmSendMailCertificateNotes,
    AppDatatableColumn,
    AppButtonGroup,
    ReportProgress,
    AppDatatable,
    AppLoading,
    BaseReport,
    AppButton,
    AppModal,
  },

  setup() {
    const { t } = useI18n();
    const name = 'CertificateMatriculateByUser';
    const title = 'Certificado de Notas por Estudiante';
    const permission = 'reports.control.certificateMatriculateByUser';
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
    const reportId = ref();
    const currentMatriculateSubjectPeriod: Ref<any> = ref(null);
    const openModal = ref(false);

    const lockStudents: { value: boolean } = reactive({
      value: false,
    });
    const filtersAux: { value: any } = reactive({
      value: null,
    });
    const loading = ref(true);
    const filters = ref<IGetFiltersBookGradeService>({
      subjectCategories: [],
      studentCategories: [],
      academicPeriods: [],
      typeBulletin: 3,
    });

    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      degreeId: null,
      groupId: null,
      convertTo: 'pdf',
      studentCategories: [],
      subjectCategories: [],
      itemCode: permission,
      typeBulletin: 3,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: {},
          groupId: {},
          convertTo: { required },
          studentCategories: {},
          subjectCategories: {},
          itemCode: { required },
          typeBulletin: {},
        },
      },
      { form }
    );

    const service = new GetListStudentsGradeBookService();
    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      degreeId: form.degreeId,
      groupId: form.groupId,
      studentCat: form.studentCategories,
      subjectCat: form.subjectCategories,
      itemCode: permission,
      typeBulletin: form.typeBulletin,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersBookGradeService.run();

      loading.value = false;
    });

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
        const response = await generateAllReportsBookGradeService.run(getFilterReports());

        reportId.value = response.reportId;
      } catch (e) {
        console.log(e);
      }
    };

    const generateIndividualReport = async (data: any) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const response = await generateCertificationNotesPerStudentService.run({
          ...getFilterReports(),
          userId: data.userId,
          matriculateId: data.id,
        });

        reportId.value = response.reportId;
      } catch (e) {
        console.log(e);
      }
    };

    const getFilterReports = () => {
      const data = { ...form };
      return {
        academicPeriodId: data.academicPeriodId,
        levelId: data.levelId,
        degreeId: data.degreeId,
        groupId: data.groupId,
        convertTo: 'pdf',
        studentCategories: data.studentCategories,
        subjectCategoriesIds: data.subjectCategories,
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
          studentCategoriesIds: filter.studentCategories,
          itemCode: filter.itemCode,
          typeBulletin: filter.typeBulletin,
        };

        const response = await downloadBookGradeService.run(dataSend);
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

    return {
      service,
      t,
      params,
      routes,
      title,
      v$,
      generateAll,
      generateIndividualReport,
      sendMailAll,
      sendIndividualMail,
      closeSendMailModalModal,
      closeModalForm,
      downloadAll,
      listStudents,
      showListStudents,
      reportId,
      refreshData,
      name,
      sendMailModal,
      filtersAux,

      permission,
      loading,
      filters,
    };
  },
});
</script>

<style scoped></style>
