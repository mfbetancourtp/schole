<template>
  <AppFormField :form-control="v$.form.courseId" label="core.generalTerms.academic.subject.singular">
    <AppAutocomplete input-id="" :options="courses" v-model="v$.form.courseId.$model"
                     :disabled="!v$.form.academicPeriodId.$model"></AppAutocomplete>
  </AppFormField>
</template>

<script lang="ts">
import {defineComponent, ref, watch} from 'vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import {GetCoursesByAcademicPeriodGroupService} from '../services/filters/getCoursesByAcademicPeriodGroup.service';

const getCoursesByAcademicPeriodGroupService = new GetCoursesByAcademicPeriodGroupService();

export default defineComponent({
  name: 'FilterCourse',
  components: {AppAutocomplete, AppFormField},
  props: {
    v$: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const courses = ref([]);

    const getCoursesByAcademicPeriodGroup = async (academicPeriodGroupId: number) => {
      courses.value = await getCoursesByAcademicPeriodGroupService.run(academicPeriodGroupId);
    };

    watch(() => props.v$.form.academicPeriodId.$model, async (value) => {
      if (value) {
        await getCoursesByAcademicPeriodGroup(value);
      } else {
        courses.value = [];
      }
    });


    return {
      courses,
    };
  },
});
</script>

<style scoped>

</style>
