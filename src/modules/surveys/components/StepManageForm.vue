<template>
  <StepForm v-if="stepType.id === stepTypesConstant.CUSTOM_FORM" :step-type="stepType" :convocation="convocation" :data="data" @close="close" />
  <StepPayment v-else-if="stepType.id === stepTypesConstant.PAYMENT" :step-type="stepType" :convocation="convocation" :data="data" @close="close" />
  <StepDocument v-else-if="stepType.id === stepTypesConstant.DOCUMENT" :step-type="stepType" :convocation="convocation" :data="data" @close="close" />
  <StepAttachment v-else-if="stepType.id === stepTypesConstant.ATTACHED" :step-type="stepType" :convocation="convocation" :data="data" @close="close" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import StepForm from './StepForm.vue';
import StepPayment from './StepPayment.vue';
import StepDocument from './StepDocument.vue';
import StepAttachment from './StepAttachment.vue';

import { StepTypesConstant } from '../constants/stepTypes.constant';

export default defineComponent({
  name: 'StepManageForm',

  components: { StepAttachment, StepDocument, StepPayment, StepForm },

  props: ['stepType', 'convocation', 'data'],
  emits: ['close'],

  setup(props, { emit }) {
    const stepTypesConstant = StepTypesConstant;

    const close = () => {
      emit('close');
    };

    return {
      stepTypesConstant,
      close,
    };
  },
});
</script>
