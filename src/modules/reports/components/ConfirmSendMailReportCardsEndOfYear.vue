<template>
  <AppFormModal :title="title" @closed="emit('close')">
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else>
        Se enviará el reporte a {{ total }}
        {{
          total === 1
            ? t('core.generalTerms.academic.tutor.singular')
            : t('core.generalTerms.academic.tutor.plural')
        }}
      </div>
    </template>

    <template v-slot:actions>
      <AppButton @click="sendMail()">{{ t('reports.send') }}</AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { defineComponent, onMounted, ref } from 'vue';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { SendEmailReportsCardsToParentsFinalService } from '../services/filters/sendEmailReportsCardsToParentsFinal.service';
import { SendEmailReportsCardsToParentsByStudentFinalService } from '../services/filters/sendEmailReportsCardsToParentsByStudentFinal.service';
import { GetCountParentsSendMailPerformanceFinalService } from '../services/filters/getCountParentsSendMailPerformanceFinal.service';

const getCountParentsSendMailPerformanceFinalService =
  new GetCountParentsSendMailPerformanceFinalService();
const sendEmailReportsCardsToParentsByStudentFinalService =
  new SendEmailReportsCardsToParentsByStudentFinalService();
const sendEmailReportsCardsToParentsFinalService =
  new SendEmailReportsCardsToParentsFinalService();

export default defineComponent({
  name: 'ConfirmSendMailReportCards',
  components: { AppFormModal, AppButton, AppLoading },

  props: ['filters'],
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();
    let title = 'Enviar email a tutores';

    const loading = ref(true);
    const total = ref();

    onMounted(async () => {
      let response = await getCountParentsSendMailPerformanceFinalService.run(
        props.filters
      );
      total.value = response.cantParents;

      loading.value = false;
    });

    const sendMail = async () => {
      try {
        if (!props.filters.matriculateId) {
          await sendEmailReportsCardsToParentsFinalService.run(props.filters);
        } else {
          await sendEmailReportsCardsToParentsByStudentFinalService.run(
            props.filters
          );
        }
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      title,
      total,
      t,
      emit,
      sendMail,
    };
  },
});
</script>

<style scoped></style>
