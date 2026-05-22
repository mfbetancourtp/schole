<template>
  <AppFormField :form-control="v$.form.subjectCategories"
                label="core.generalTerms.academic.subjectClassification.plural">
    <AppAutocomplete input-id="subjectCategoriesId" :options="options" :multiple="true"
                     v-model="v$.form.subjectCategories.$model"></AppAutocomplete>
  </AppFormField>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import {SubjectsCategoryDto} from '../../../shared/dto/subjectsCategory.dto';

export default defineComponent({
  name: 'FilterSubjectClassification',
  components: {AppFormField, AppAutocomplete},
  props: {
    options: {
      type: Array as PropType<SubjectsCategoryDto[]>,
      default: [],
      required: true,
    },
    v$: {
      type: Object,
      required: true,
    },
  },
});
</script>

<style scoped>

</style>
