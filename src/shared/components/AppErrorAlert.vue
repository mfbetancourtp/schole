<template>
  <div
    class="alert alert-danger d-flex flex-row align-items-center"
    role="alert"
    v-if="message || validationErrors.length"
  >
    <AppIcon icon="exclamation-triangle" class="me-4" size="lg"></AppIcon>
    <div>
      {{ t(message) }}

      <ul class="mt-2" v-if="validationErrors.length">
        <li
          v-for="(error, index) in validationErrors"
          :key="index"
          class="tw-list-disc"
        >
          {{ t(error[0], error[1]) }}
          <!--        {{ error[0] | transloco: error[1] }}-->
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue';
import AppIcon from './AppIcon.vue';
import errorAlertStore from '../stores/errorAlert.store';
import { useI18n } from 'vue-i18n';

export default defineComponent<{
  state: any;
}>({
  name: 'AppErrorAlert',
  components: { AppIcon },
  setup() {
    const { t } = useI18n();
    const state = inject('state', errorAlertStore.state);

    const message = computed(() => state.message);
    const validationErrors = computed(() => state.validationErrors);

    return {
      t,
      state,
      message,
      validationErrors,
    };
  },
});
</script>

<style scoped></style>
