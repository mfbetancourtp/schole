<template>
  <div class="alert d-flex flex-column justify-content-center gap-2" :class="color">
    <div class="d-flex gap-2 align-items-center">
      <div v-if="individualStatus === 'IN_PROGRESS'" class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>

      <span>
        {{ text }}
        {{ totalCourseInscriptions ? '(' + totalSynchronizationData + ' de ' + totalCourseInscriptions + ')' : null }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue';

import { GetStatusSyncQueueService } from '../services/getStatusSyncQueue.service';

const getStatusSyncQueueService = new GetStatusSyncQueueService();

export default defineComponent({
  name: 'SyncProgress',
  components: {},
  props: {
    reportId: {
      type: String,
      required: true,
    },
    courseId: {
      type: Number,
      required: true,
    },
    time: {
      type: Number,
      default: 7,
    },
  },
  emits: ['finishGeneration'],
  setup(props, { emit }) {
    const individualStatus = ref('IN_PROGRESS');
    const totalCourseInscriptions = ref();
    const totalSynchronizationData = ref();
    const url = ref();
    let timer: any = null;

    const color = computed(() => {
      if (individualStatus.value === 'IN_PROGRESS') {
        return 'alert-info';
      } else if (individualStatus.value === 'ERROR') {
        return 'alert-danger';
      } else {
        return 'alert-success';
      }
    });

    const text = computed(() => {
      if (individualStatus.value === 'IN_PROGRESS') {
        return 'Estamos sincronizando';
      } else if (individualStatus.value === 'ERROR') {
        return 'Ha ocurrido un error al generar la sincronización';
      } else {
        return 'Sincronización de notas';
      }
    });

    const clearTimer = () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };

    const verifyStatus = async () => {
      if (props.reportId) {
        const response = await getStatusSyncQueueService.run(props.reportId);

        if (response && response.courseId === props.courseId) {
          individualStatus.value = response.status;
          url.value = response.url;
          totalCourseInscriptions.value = response.totalCourseInscriptions;
          totalSynchronizationData.value = response.totalSynchronizationData;

          if (individualStatus.value === 'OK') {
            emit('finishGeneration');
          }
        }
      }

      if (!props.reportId || individualStatus.value === 'IN_PROGRESS') {
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

    watch(
      () => props.reportId,
      async (value) => {
        console.log(value);
        individualStatus.value = 'IN_PROGRESS';
        url.value = null;
        clearTimer();
        await verifyStatus();
      }
    );

    onUnmounted(() => {
      clearTimer();
    });

    return {
      individualStatus,
      color,
      text,
      totalCourseInscriptions,
      totalSynchronizationData,
      url,
    };
  },
});
</script>

<style scoped></style>
