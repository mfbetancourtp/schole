<template>
  <div class="alert d-flex flex-column justify-content-center gap-2" :class="color">
    <div class="d-flex gap-2 align-items-center">
      <div v-if="status === 'IN_PROGRESS'" class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>

      <span>
      {{ text }} {{ totalReports ? ('(' + generatedReports + ' de ' + totalReports + ')') : null }}
    </span>
    </div>

    <div>
      <AppButton v-if="url" variant="primary" :href="url" target="_blank" color="primary">
        Ver reporte
      </AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, onUnmounted, ref, watch} from 'vue';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import {GetStatusReportQueueService} from '../services/getStatusReportQueue.service';

const getStatusReportQueueService = new GetStatusReportQueueService();

export default defineComponent({
  name: 'ReportProgress',
  components: {AppButton, AppLoading},
  props: {
    reportId: {
      type: String,
      required: true,
    },
    time: {
      type: Number,
      default: 7,
    },
  },
  emits: ['finishGeneration'],
  setup(props, {emit}) {
    const status = ref('IN_PROGRESS');
    const totalReports = ref();
    const generatedReports = ref();
    const url = ref();
    let timer: any = null;

    const color = computed(() => {
      if (status.value === 'IN_PROGRESS') {
        return 'alert-info';
      } else if (status.value === 'ERROR') {
        return 'alert-danger';
      } else {
        return 'alert-success';
      }
    });

    const text = computed(() => {
      if (status.value === 'IN_PROGRESS') {
        return 'Estamos generando el reporte';
      } else if (status.value === 'ERROR') {
        return 'Ha ocurrido un error al generar el reporte';
      } else {
        return 'Reporte generado correctamente';
      }
    });

    const clearTimer = () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };

    const verifyStatus = async () => {
      if (props.reportId) {
        const response = await getStatusReportQueueService.run(props.reportId);

        if (response) {
          status.value = response.status;
          url.value = response.url;
          totalReports.value = response.totalReports;
          generatedReports.value = response.generatedReports;

          if (status.value === 'OK') {
            emit('finishGeneration');
          }
        }
      }

      if (!props.reportId || status.value === 'IN_PROGRESS') {
        timer = setTimeout(async () => {
          await verifyStatus();
        }, props.time * 1000);
      }
    };

    onMounted(async () => {
      if (props.reportId) {
        await verifyStatus();
      }
    });

    watch(() => props.reportId, async (value) => {
      console.log(value);
      status.value = 'IN_PROGRESS';
      url.value = null;
      clearTimer();
      await verifyStatus();
    });

    onUnmounted(() => {
      clearTimer();
    });

    return {
      status,
      color,
      text,
      totalReports,
      generatedReports,
      url,
    };
  },
});
</script>

<style scoped>

</style>