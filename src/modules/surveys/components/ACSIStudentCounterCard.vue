<template>
  <AppCard class="custom-card">
    <template #body>
      <div class="d-flex gap-2 mb-2 align-items-center">
        <div>
          <AppIcon style="font-size: 1.2rem" class="text-primary" icon="users" />
        </div>

        <span style="font-weight: 500; font-size: 1.1rem">{{ title }}</span>
      </div>

      <div>
        <p class="mb-0 fs-4">{{ counter }}</p>
        <span class="text-muted">Estudiantes</span>
      </div>
    </template>
  </AppCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';

export default defineComponent({
  name: 'ACSIStudentCounterCard',

  components: { AppIcon, AppCard },

  props: {
    title: {
      type: String,
      required: true,
    },
    counter: {
      type: Number,
      required: true,
    },
  },

  setup() {
    const { t } = useI18n();

    return { t };
  },
});
</script>

<style scoped>
:deep(.custom-card),
:deep(.custom-card) {
  border-left: 0.2rem solid var(--color-primary) !important;
}
</style>
