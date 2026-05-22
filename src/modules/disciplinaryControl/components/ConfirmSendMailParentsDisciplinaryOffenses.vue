<template>
  <AppFormModal :title="title">
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
      <AppButton label="reports.send" @click="sendMail()"></AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

import { SendMailParentsDisciplinaryOffenseService } from '../services/sendMailParentsDisciplinaryOffense.service';
import { CountParentsSendMailDisciplinaryOffenseService } from '../services/countParentsSendMailDisciplinaryOffense.service';

const countParentsSendMailDisciplinaryOffenseService =
  new CountParentsSendMailDisciplinaryOffenseService();
const sendMailParentsDisciplinaryOffenseService =
  new SendMailParentsDisciplinaryOffenseService();

export default defineComponent({
  name: 'ConfirmSendMailParentsDisciplinaryOffenses',
  components: { AppFormModal, AppButton, AppLoading },

  props: ['offenseDisciplinaryId'],
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();
    const offenseDisciplinaryId = props.offenseDisciplinaryId ?? null;
    let title = 'Enviar email a tutores';

    const loading = ref(true);
    const total = ref();

    onMounted(async () => {
      let response = await countParentsSendMailDisciplinaryOffenseService.run(
        offenseDisciplinaryId
      );
      total.value = response.cantParents;

      loading.value = false;
    });

    const sendMail = async () => {
      try {
        await sendMailParentsDisciplinaryOffenseService.run(
          offenseDisciplinaryId
        );
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
