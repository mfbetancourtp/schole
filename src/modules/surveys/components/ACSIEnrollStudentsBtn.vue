<template>
  <AppButton :label="t('Matricular estudiantes')" :outlined="false" @click="enrollStudents" />

  <AppModal v-model="showModal" size="lg">
    <template v-if="showModal">
      <ACSIEnrollStudentsModal :enrollment-information="enrollmentInformation" @close="showModal = false" />
    </template>
  </AppModal>
</template>

<script lang="ts">
import { Ref, defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ACSIEnrollStudentsModal from './ACSIEnrollStudentsModal.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { GetConvocationWithStepsSummaryService } from '../services/getConvocationWithStepsSummary.service';

const getConvocationWithStepsSummaryService = new GetConvocationWithStepsSummaryService();

export default defineComponent({
  name: 'ACSIEnrollStudentsBtn',

  components: { AppButton, ACSIEnrollStudentsModal, AppModal },

  props: {
    academicPeriodId: {
      type: Number,
      required: true,
    },
    convocationId: {
      type: Number,
      required: true,
    },
  },
  emits: ['updateData'],

  setup(props, { emit }) {
    const { t } = useI18n();
    const convocationId = props.convocationId ?? null;
    const academicPeriodId = props.academicPeriodId ?? null;

    const enrollmentInformation: Ref<any> = ref(null);

    const showModal = ref(false);

    const enrollStudents = async () => {
      showModal.value = false;

      try {
        const params = { academicPeriodId, convocationId };

        enrollmentInformation.value = await getConvocationWithStepsSummaryService.run(params);
      } catch (e) {
        console.log(e);
      }

      showModal.value = true;
      emit('updateData');
    };

    return {
      t,

      enrollmentInformation,
      showModal,

      enrollStudents,
    };
  },
});
</script>
