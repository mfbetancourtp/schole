<template>
  <AppFormModal :title="title">
    <template v-slot:content>
      <div class="d-flex justify-content-between">
        <div>
          <p class="m-0" style="font-weight: 500">
            {{ t('core.generalTerms.academic.student.singular') }}:
            <span style="font-weight: 400">{{ ` ${medicalRecord.user.people.lastnames} ${medicalRecord.user.people.names}`
            }}</span>
          </p>
        </div>

        <div>
          <p class="m-0" style="font-weight: 500">
            {{ t('access.medicalRecord.form.consultationDate') }}:
            <span style="font-weight: 400">{{ dayjs.tz(medicalRecord.consultationDate,
              dayjs.tz.guess()).format('YYYY/MM/DD h:mm A') }}</span>
          </p>
        </div>
      </div>

      <hr />

      <p class="mb-1" style="font-weight: 500">{{ t('access.medicalRecord.form.annotations') }}:</p>
      <p class="m-0">{{ medicalRecord.annotations }}</p>

      <hr />

      <p class="mb-1" style="font-weight: 500">{{ t('core.generalTerms.academic.wellnessAreas.singular') }}:</p>
      <p class="m-0">{{ medicalRecord.wellnessAreaName }}</p>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

import { MedicalRecordDto } from '../dtos/medicalRecord.dto';

export default defineComponent({
  name: 'MedicalRecordDetail',

  components: { AppFormModal },

  props: {
    medicalRecord: {
      type: Object as PropType<MedicalRecordDto>,
      required: true,
    },
  },

  setup() {
    const { t } = useI18n();
    const title = 'access.medicalRecord.medicalHistoryDetail';

    return {
      title,
      t,

      dayjs,
    };
  },
});
</script>
