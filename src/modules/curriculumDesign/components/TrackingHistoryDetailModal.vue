<template>
  <AppFormModal :title="title">
    <template v-slot:content>
      <div class="form-row">
        <AppFormField label="core.description">
          <textarea type="text" class="form-control" v-model="detail" disabled></textarea>
        </AppFormField>
      </div>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

export default defineComponent({
  name: 'TrackingHistoryDetailModal',
  components: {
    AppFormModal,
    AppFormField,
  },
  props: ['trackingHistoryDetail'],

  setup(props) {
    const { t } = useI18n();
    const loading = ref(false);
    const title = 'core.detail';
    const detail = ref(props.trackingHistoryDetail);

    return {
      t,
      loading,
      title,
      detail,
    };
  },
});
</script>
<style scoped></style>
