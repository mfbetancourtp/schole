<template>
  <AppLoading v-if="loading"></AppLoading>

  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params" :show-btn-generate="false">
    <!-- Form -->
    <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :permission="permission" :v$="v$"> </FilterAcademicPeriodWithLevels>

    <!-- btns form -->
    <div class="responsive-buttons">
      <AppButton class="buttons" :label="'Listar bloqueados'" :native-type="'button'" @click="listStudents(true)" variant="primary"> </AppButton>
      <AppButton class="buttons" :label="'reports.filters.listStudents'" :native-type="'button'" @click="listStudents(false)" variant="primary"></AppButton>
      <AppButton class="buttons" :label="'reports.filters.generateAll'" :disabled="!showListStudents" :native-type="'button'" @click="generateAll()" variant="primary"></AppButton>
      <AppButton class="buttons" :label="'reports.filters.sendGenerated'" :disabled="!showListStudents" :native-type="'button'" @click="sendMailAll()" variant="primary"></AppButton>
      <AppButton class="buttons" :disabled="!showListStudents" :label="'Descargar todos'" :native-type="'button'" @click="downloadAll()"></AppButton>
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
            <AppButton v-if="row.report.disabledSend" @click="lockUnlockReport(row)" v-tooltip="t('Desbloquear')" variant="primary" icon="ban" outlined></AppButton>
            <AppButton v-if="!row.report.disabledSend" @click="lockUnlockReport(row)" v-tooltip="t('Bloquear')" icon="check-circle" variant="primary" outlined></AppButton>
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
        <ConfirmSendMailCertificateNotes v-if="sendMailModal" :filters="filtersAux.value" @close="closeSendMailModalModal"> </ConfirmSendMailCertificateNotes>
      </AppModal>
      <AppModal v-model="openModal">
        <SubjectPositionFinalFormEdit v-if="openModal" :data="currentMatriculateSubjectPeriod" @close="closeModalForm" />
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
import SubjectPositionFinalFormEdit from '../components/SubjectPositionFinalFormEdit.vue';
import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { LockUnlockReportEndOfYearService } from '../services/filters/lockUnlockReportEndOfYear.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetStudentsByAcademicPeriodIdService } from '../services/filters/getStudentsByAcademicPeriodId.service';
import { GenerateConstancyMatriculateService } from '../services/reports/generateConstancyMatriculate.service';
import { GenerateConstancyMatriculatePerStudentService } from '../services/reports/generateConstancyMatriculatePerStudent.service';
import { DownloadConstancyMatriculateService } from '../services/reports/downloadConstancyMatriculate.service';
import { GetFiltersBookGradeService } from '../services/filters/getFiltersBookGrade.service';
import { useHeaderStore } from '../../../stores/header.store';

const generateConstancyMatriculatePerStudentService = new GenerateConstancyMatriculatePerStudentService();
const generateConstancyMatriculateService = new GenerateConstancyMatriculateService();
const getFiltersBookGradeService = new GetFiltersBookGradeService();
const lockUnlockReportEndOfYear = new LockUnlockReportEndOfYearService();
const updateDatatableService = new UpdateDatatableService();
const downloadConstancyMatriculateService = new DownloadConstancyMatriculateService();

export default defineComponent({
  name: 'ReportPeaceSafety',
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
    SubjectPositionFinalFormEdit,
  },

  setup() {
    const { t } = useI18n();
    const name = 'reportCard';
    const title = 'reports.constancyMatriculateByUser';
    const permission = 'reports.control.constancyMatriculateByUser';
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
    const lockStudents: { value: boolean } = reactive({
      value: false,
    });
    const filtersAux: { value: any } = reactive({
      value: null,
    });
    const filters = ref<any>({
      typeBulletin: 5,
    });
    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      degreeId: null,
      groupId: null,
      convertTo: 'pdf',
      itemCode: permission,
      typeBulletin: 5,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: {},
          groupId: {},
          convertTo: { required },
          itemCode: { required },
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
      disabledSend: lockStudents.value ? 'disabled' : '',
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
        const response = await generateConstancyMatriculateService.run(getFilterReports());
        reportId.value = response.reportId;
      } catch (e) {
        console.log(e);
      }
    };
    const generateIndividualReport = async (data: any) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      try {
        const response = await generateConstancyMatriculatePerStudentService.run({
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
        const response = await downloadConstancyMatriculateService.run(dataSend);
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
      generateIndividualReport,
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
      openModal,
      generateAll,
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

@media (max-width: 500px) {
  .responsive-buttons {
    flex-direction: column;
  }

  .buttons {
    width: 100%;
  }
}
</style>
