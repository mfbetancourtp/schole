<template>
   <AppFormModal :title="title" @closed="emit('close')">
    <template v-slot:content>
      <AppCard v-for="notification, index in data" :key="index">
        <template #body>
          <h5 class="mb-1">{{ notification.title }}</h5>
          <p class="mb-1">{{ notification.message }}</p>

          <div class="d-flex justify-content-between">
            <span>{{ notification.channel }}</span>

            <span>{{ notification.dateReceived }}</span>
          </div>
        </template>
      </AppCard>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppFormModal from "../../../shared/components/Modal/AppFormModal.vue";

import { NotificationDto } from "../dtos/portfolioMonitoring.dto";

export default defineComponent({
  name: "PortfolioMonitoringViewNotifications",
  components: { AppFormModal, AppCard },

  emits: ["close"],
  props: {
    data: {
      type: Object as PropType<NotificationDto[]>,
      default: [],
    },
  },

  setup(props, { emit }) {
    let title = "Visualizar notificaciones";

    return {
      title,
      emit,
    };
  },
});
</script>

<style scoped></style>
