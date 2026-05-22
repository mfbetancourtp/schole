<template>
  <StepCustomFormList v-if="stepType.id === stepTypesConstant.CUSTOM_FORM" :data="details"></StepCustomFormList>
  <StepPaymentList v-else-if="stepType.id === stepTypesConstant.PAYMENT" :data="details"></StepPaymentList>
  <StepAttachmentList v-else-if="stepType.id === stepTypesConstant.ATTACHED" :data="details"></StepAttachmentList>
  <StepDocumentsList v-else-if="stepType.id === stepTypesConstant.DOCUMENT" :data="details"></StepDocumentsList>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import StepDocumentsList from './StepDocumentsList.vue';
import StepPaymentList from './StepPaymentList.vue';
import StepCustomFormList from './StepCustomFormList.vue';
import StepAttachmentList from './StepAttachmentList.vue';

import {StepTypesConstant} from '../constants/stepTypes.constant';

export default defineComponent({
  name: 'StepManageList',
  components: {StepAttachmentList, StepCustomFormList, StepPaymentList, StepDocumentsList},
  props: ['details', 'stepType'],
  setup(props) {
    const stepTypesConstant = StepTypesConstant;

    if (props.stepType.id === stepTypesConstant.CUSTOM_FORM) {
      console.log(props.details);
    }

    return {
      stepTypesConstant,
    };
  },
});
</script>

<style scoped>

</style>