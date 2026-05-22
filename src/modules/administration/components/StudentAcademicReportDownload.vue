<template>
  <div class="d-flex justify-content-end">
    <AppButton v-if="!reportId" @click="generateReport" :disabled="loading" label="Descargar Reporte" />
  </div>

  <div v-if="reportId" class="mt-2">
    <ReportProgress :report-id="reportId" @finish-generation="onReportFinished" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import ReportProgress from '../../../modules/reports/components/ReportProgress.vue';

import { GenerateStudentAcademicReportService } from '../../../modules/reports/services/reports/generateStudentAcademicReport.service';

const generateStudentAcademicReportService = new GenerateStudentAcademicReportService();

export default defineComponent({
  name: 'StudentAcademicReportDownload',

  props: {
    matriculateId: {
      type: Number,
      required: true,
    },
  },

  components: {
    AppButton,
    ReportProgress,
  },

  setup(props) {
    const reportId = ref<string | null>(null);
    const loading = ref(false);

    const generateReport = async () => {
      try {
        loading.value = true;

        const response = await generateStudentAcademicReportService.run({
          matriculateId: props.matriculateId,
        });

        if (response?.reportId) {
          reportId.value = response.reportId;
        }
      } catch (error) {
        console.error('Error generating report:', error);
      } finally {
        loading.value = false;
      }
    };

    const onReportFinished = () => {
      // Report generation finished, the ReportProgress component will show the download button
      console.log('Report generation finished');
    };

    return {
      reportId,
      loading,
      generateReport,
      onReportFinished,
    };
  },
});
</script>
