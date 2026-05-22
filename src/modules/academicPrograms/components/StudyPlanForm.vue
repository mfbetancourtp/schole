<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.name" :label="'academicPrograms.studyPlan.form.name'">
          <input class="form-control" type="text" id="name" v-model="v$.form.name.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.administrativeResolution" :label="'academicPrograms.studyPlan.form.administrative_resolution'">
          <input class="form-control" type="text" id="administrativeResolution" v-model="v$.form.administrativeResolution.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.resolutionDate" :label="'academicPrograms.studyPlan.form.resolution_date'">
          <input class="form-control" type="date" id="resolutionDate" v-model="v$.form.resolutionDate.$model" />
        </AppFormField>
        <AppFormField :form-control="v$.form.messageInstitutional" :label="'Slogan'">
          <input class="form-control" type="text" id="messageInstitutional" v-model="v$.form.messageInstitutional.$model" />
        </AppFormField>
        <AppFormField :form-control="v$.form.descriptionInstitutional" :label="'Descripción Resolución'">
          <AppVoiceInput v-model="v$.form.descriptionInstitutional.$model" textareaClass="form-control" />

        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '@vuelidate/validators';
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { ProgramDto } from '../../../shared/dto/program.dto';

import { CreateOrUpdateCurriculumService } from '../services/studyPlan/createOrUpdateCurriculum.service';
import { GetDataProgramsService } from '../services/studyPlan/getDataPrograms.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateCurriculumService = new CreateOrUpdateCurriculumService();
const getDataProgramsService = new GetDataProgramsService();

export default defineComponent({
  name: 'StudyPlanForm',
  components: { AppFormModal, AppFormField, AppButton, AppVoiceInput},

  props: ['data'],
  emits: ['close'],

  setup(props, { emit }) {
    const data: any | null = props.data ?? null;
    const studyPlanTranslation = 'core.generalTerms.academic.studyPlan.singular';
    const title = !data?.id ? `core.new ${studyPlanTranslation}` : `core.edit ${studyPlanTranslation}`;

    const dataPrograms = ref<any>();
    const levelsList = ref<ProgramDto[]>([]);

    const form = reactive({
      name: data?.name,
      administrativeResolution: data?.administrativeResolution,
      resolutionDate: data?.resolutionDate,
      messageInstitutional: data?.messageInstitutional,
      descriptionInstitutional: data?.descriptionInstitutional,
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          administrativeResolution: { required },
          resolutionDate: { required },
          messageInstitutional: {},
          descriptionInstitutional: {},
        },
      },
      { form }
    );
    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        await createOrUpdateCurriculumService.run(form, data?.id);
        emit('close');
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      title,
      levelsList,
      save,
      v$,
    };
  },
});
</script>

<style scoped></style>
