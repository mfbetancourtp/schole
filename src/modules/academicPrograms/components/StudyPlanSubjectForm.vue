<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.area" :label="'core.generalTerms.academic.area.singular'">
          <AppAutocomplete :options="areas.value" v-model="v$.form.area.$model"></AppAutocomplete>
        </AppFormField>

        <AppFormField :form-control="v$.form.subjectIds" :label="'core.generalTerms.academic.subject.singular'">
          <AppAutocomplete multiple :options="subjects.value" v-model="v$.form.subjectIds.$model"></AppAutocomplete>
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, watch } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { AreaDto } from '../../../shared/dto/area.dto';
import { SubjectDto } from '../../../shared/dto/subject.dto';

import { CreateCurriculumSubjectsFromArrayService } from '../services/createCurriculumSubjectsFromArray.service';
import { useI18n } from 'vue-i18n';

const createCurriculumSubjectsFromArrayService = new CreateCurriculumSubjectsFromArrayService();

export default defineComponent({
  name: 'StudyPlanSubjectForm',
  components: { AppFormModal, AppFormField, AppButton, AppAutocomplete },

  props: ['curriculumDegree', 'areasAndSubjectsPending'],
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();
    const title = 'core.new core.generalTerms.academic.subject.singular';

    const form = reactive({
      area: null,
      subjectIds: null,
    });

    const v$ = useVuelidate(
      {
        form: {
          area: { required },
          subjectIds: { required },
        },
      },
      { form }
    );

    const areas: { value: AreaDto[] } = reactive({
      value: [],
    });
    const subjects: { value: SubjectDto[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      areas.value = props.areasAndSubjectsPending;
    });

    watch(
      () => form.area,
      async (value) => {
        if (value) {
          await changeSubjects();
        } else {
          subjects.value = [];
        }
      }
    );

    const changeSubjects = async () => {
      if (!form.area) {
        subjects.value = [];
      }

      areas.value.forEach((area) => {
        if (area.id == form.area) {
          subjects.value = area.subjects;
        }
      });
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      const curriculumDegreeId = props.curriculumDegree.id;

      if (!formIsValid) return;

      try {
        await createCurriculumSubjectsFromArrayService.run(curriculumDegreeId, {
          subjectIds: form.subjectIds,
        });
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      t,
      subjects,
      title,
      areas,
      v$,

      changeSubjects,
      save,
    };
  },
});
</script>

<style scoped></style>
