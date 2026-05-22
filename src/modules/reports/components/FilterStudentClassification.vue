<template>
  <AppFormField :form-control="v$.form.studentCategories"
                label="core.generalTerms.academic.studentClassification.plural">
    <AppAutocomplete input-id="studentCategoriesId" :options="options" :multiple="true"
                     v-model="v$.form.studentCategories.$model"></AppAutocomplete>
  </AppFormField>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import {StudentCategoryDto} from '../../../shared/dto/studentCategory.dto';

export default defineComponent({
  name: 'FilterStudentClassification',
  components: {AppAutocomplete, AppFormField},
  props: {
    options: {
      type: Array as PropType<StudentCategoryDto[]>,
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
