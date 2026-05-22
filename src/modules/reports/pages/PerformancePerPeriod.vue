<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params" :show-btn-generate="false">
    <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :permission="permission" :v$="v$"></FilterAcademicPeriodWithLevels>

    <div class="form-row">
      <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$"></FilterPeriods>

      <AppFormField :form-control="v$.form.quality" label="reports.filters.quality">
        <input id="quality" class="form-control" type="number" v-model="v$.form.quality.$model" />
      </AppFormField>

      <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>
    </div>

    <div class="form-row">
      <FilterSubjectClassification :options="filters.subjectCategories" :v$="v$"></FilterSubjectClassification>

      <FilterShowFields :options="filters.options" :v$="v$"></FilterShowFields>
    </div>

    <div class="d-flex justify-content-end align-items-center gap-2">
      <AppButton :label="'reports.filters.listStudents'" :native-type="'button'" @click="listStudents()" variant="primary"></AppButton>

      <AppButton :label="'reports.filters.generateAll'" :disabled="!showListStudents" :native-type="'button'" @click="generateAll()" variant="primary"></AppButton>

      <AppButton :label="'reports.filters.sendGenerated'" :disabled="!showListStudents" :native-type="'button'" @click="sendMailAll()" variant="primary"></AppButton>
    </div>

    <div class="mt-2" v-if="reportId">
      <ReportProgress :report-id="reportId" @finish-generation="refreshData()"></ReportProgress>
    </div>

    <div v-if="showListStudents" class="mt-2">
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
            <span
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
            <AppButton @click="generateIndividualReport(row.userId)" v-tooltip="t('Generar reporte')" v-if="!row.report?.url" variant="primary" icon="file-alt" outlined></AppButton>

            <AppButton @click="generateIndividualReport(row.userId)" v-tooltip="t('Volver a generar reporte')" v-if="row.report?.url" variant="primary" icon="sync-alt" outlined></AppButton>

            <AppButton v-tooltip="t('Enviar reporte por email')" @click="sendIndividualMail(row.id)" v-if="row.report?.url" variant="primary" icon="envelope" outlined></AppButton>

            <AppButton
              v-tooltip="t('academicAdministration.subjectAssignmentsCourse.report')"
              v-if="row.report?.url"
              :href="row.report.url"
              variant="primary"
              target="_blank"
              icon="eye"
              outlined
            ></AppButton>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>

      <AppModal v-model="sendMailModal">
        <ConfirmSendMailReportCards v-if="sendMailModal" :filters="filtersAux.value" @close="closeSendMailModalModal"></ConfirmSendMailReportCards>
      </AppModal>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppModal from '../../../shared/components/Modal/AppModal.vue';
import BaseReport from '../components/BaseReport.vue';
import FilterPeriods from '../components/FilterPeriods.vue';
import ReportProgress from '../components/ReportProgress.vue';
import FilterShowFields from '../components/FilterShowFields.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import ConfirmSendMailReportCards from '../components/ConfirmSendMailReportCards.vue';
import FilterAcademicPeriodWithLevels from '../components/FilterAcademicPeriodWithLevels.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersPerformanceByPeriodService, IGetFiltersPerformanceByPeriodService } from '../services/filters/getFiltersPerformanceByPeriod.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetStudentsByPeriodIdService } from '../services/filters/getStudentsByPeriodId.service';
import { GenerateReportPerformancePerPeriodService } from '../services/reports/generateReportPerformancePerPeriod.service';
import { GenerateReportPerformancePerPeriodIndividualService } from '../services/reports/generateReportPerformancePerPeriodIndividual.service';
import { useHeaderStore } from '../../../stores/header.store';

const generateReportPerformancePerPeriodIndividualService = new GenerateReportPerformancePerPeriodIndividualService();
const generateReportPerformancePerPeriodService = new GenerateReportPerformancePerPeriodService();
const getFiltersPerformanceByPeriodService = new GetFiltersPerformanceByPeriodService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'PerformancePerPeriod',
  components: {
    FilterAcademicPeriodWithLevels,
    FilterStudentClassification,
    FilterSubjectClassification,
    AppDatatableColumn,
    FilterShowFields,
    AppButtonGroup,
    ReportProgress,
    FilterPeriods,
    AppFormField,
    AppModal,
    AppDatatable,
    ConfirmSendMailReportCards,
    AppLoading,
    BaseReport,
    AppButton,
  },

  setup() {
    const { t } = useI18n();
    const name = 'performancePerPeriod';
    const title = 'reports.performancePerPeriod';
    const permission = 'reports.cards.performancePerPeriod';
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

    const service = new GetStudentsByPeriodIdService();
    const sendMailModal = ref(false);

    const filtersAux: { value: any } = reactive({
      value: null,
    });

    const reportId = ref();
    const loading = ref(true);
    const showListStudents = ref(false);
    const filters = ref<IGetFiltersPerformanceByPeriodService>({
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
      studentCategories: [],
      subjectCategories: [],
      quality: null,
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
          studentCategories: {},
          subjectCategories: {},
          showFields: { required },
          quality: {},
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      degreeId: form.degreeId,
      groupId: form.groupId,
      periodId: form.periodId,
      studentCat: form.studentCategories,
      subjectCat: form.subjectCategories,
      itemCode: permission,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersPerformanceByPeriodService.run();

      loading.value = false;
    });

    const getFilterReports = () => {
      return {
        academicPeriodId: form.academicPeriodId,
        levelId: form.levelId,
        degreeId: form.degreeId,
        groupId: form.groupId,
        periodId: form.periodId,
        convertTo: 'pdf',
        studentCategoriesIds: form.studentCategories,
        subjectCategoriesIds: form.subjectCategories,
        quality: form.quality,
        itemCode: permission,
        options: form.showFields,
      };
    };

    const listStudents = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      showListStudents.value = true;

      setTimeout(() => {
        refreshData();
      }, 100);
    };

    const generateIndividualReport = async (userId: number) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const response = await generateReportPerformancePerPeriodIndividualService.run({
          ...getFilterReports(),
          userId,
        });

        reportId.value = response.reportId;
      } catch (e) {
        console.log(e);
      }
    };

    const generateAll = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const response = await generateReportPerformancePerPeriodService.run(getFilterReports());

        reportId.value = response.reportId;
      } catch (e) {
        console.log(e);
      }
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

    const refreshData = () => {
      updateDatatableService.run();
    };

    return {
      service,
      params,
      routes,
      title,
      name,
      v$,
      t,

      showListStudents,
      permission,
      reportId,
      loading,
      sendMailModal,
      filters,
      filtersAux,

      generateIndividualReport,
      closeSendMailModalModal,
      sendIndividualMail,
      listStudents,
      generateAll,
      sendMailAll,
      refreshData,
    };
  },
});
</script>

<style scoped></style>
