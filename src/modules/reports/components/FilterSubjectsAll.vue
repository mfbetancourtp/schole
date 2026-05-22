
<template>
  <AppFormField :form-control="v$.form.subjectsIds" label="core.generalTerms.academic.subject.plural">
    <AppAutocomplete
      input-id="subjectsIds"
      :options="subjects"
      v-model="v$.form.subjectsIds.$model"
      :disabled="!v$.form.subjectsIds.$model"
      multiple
    />
  </AppFormField>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

export default defineComponent({
  name: 'FilterSubjectsAll',
  components: { AppAutocomplete, AppFormField },
  props: {
    v$: {
      type: Object,
      required: true,
    },
    subjects: {
      type: Array as PropType<any[]>,
      required: true,
    },
  },
});
</script>

