<template>
  <form >
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.teacherPeopleId" label="core.generalTerms.academic.teacher.singular">
          <v-select
             
          ></v-select>
        </AppFormField>

        <div v-if="!subject.id">
          <label>{{ t('core.generalTerms.academic.subject.plural') }}*</label>
          <div
              class="form-check"
              v-for="subject in relatedDataForm.curriculumSubjects"
              :key="subject.id"
          >
            <input
                class="form-check-input"
                type="checkbox"
                :value="subject.id"
                :id="subject.id"
                v-model="v$.form.curriculumSubjectIds.$model"
            >
            <label
                class="form-check-label" :ref_for="subject.id"
            >
              {{ subject.subject.name }}
            </label>
          </div>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton>Guardar</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import {defineComponent, reactive} from 'vue';

import {debounce} from 'ts-debounce';
import {useVuelidate} from '@vuelidate/core';
import {required} from '../../../shared/plugins/vuelidate.plugin';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import {useI18n} from 'vue-i18n';


export default defineComponent({
  name: 'SubjectsAssignmentsForm.',
  components: {AppFormModal, AppButton, AppFormField},

  props: ['relatedDataForm', 'currentAcademicPeriodGroupId', 'subject'],
  emits: ['close'],

  setup(props, {emit}) {
    const {t} = useI18n();
    const relatedDataForm = props.relatedDataForm;
    const academicPeriodGroupId = parseInt(props.currentAcademicPeriodGroupId);
    const subject = props.subject ?? {};
    const subjectAssignmentTranslation = 'core.generalTerms.academic.subjectAssignment.singular';
    const title = subject.id ? `core.edit ${subjectAssignmentTranslation}` : `core.new ${subjectAssignmentTranslation}`;

    const form = reactive({
      teacherPeopleId: null,
      academicPeriodGroupId: academicPeriodGroupId,
      curriculumSubjectIds: subject.id ?? [],
    });
    const v$ = useVuelidate({
      form: {
        academicPeriodGroupId: {required},
        curriculumSubjectIds: {},
        teacherPeopleId: {required},
      },
    }, {form});

    const teachers: { value: any[] } = reactive({
      value: [],
    });
    const subjects: { value: any[] } = reactive({
      value: [],
    });

    
    
    return {
      t,
      title,
      v$,

      relatedDataForm,
      teachers,
      subjects,
      subject,

 
    };
  },
});
</script>

<style scoped>
</style>
