<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.name" :label="'academicPrograms.subjects.form.name'">
          <input class="form-control" type="text" id="name" v-model="v$.form.name.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.abbreviation" :label="'Código'">
          <input class="form-control" type="text" id="abbreviation" v-model="v$.form.abbreviation.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.file" :label="'Imagen'">
          <AppUploadImage input-id="file" v-model="v$.form.file.$model" :current-thumbnail="currentThumbnail"> </AppUploadImage>
        </AppFormField>
        <AppFormField :form-control="v$.form.lastGrade">
          <label class="form-check-label">Grado final</label>
          <input class="form-check-input" type="checkbox" v-model="v$.form.lastGrade.$model" />
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required, defaultImage } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppUploadImage from '../../../shared/components/Forms/AppUploadImage.vue';

import { CreateOrUpdateDegreeService } from '../services/createOrUpdateDegree.service';

const createOrUpdateDegreeService = new CreateOrUpdateDegreeService();

export default defineComponent({
  name: 'DegreeForm',
  components: { AppUploadImage, AppFormField, AppFormModal, AppButton },

  props: ['data', 'levelId'],
  emits: ['close'],

  setup(props, { emit }) {
    const data = props.data ?? {};
    const currentThumbnail = data.props?.thumbnail;
    const degreeTranslation = 'core.generalTerms.academic.degree.singular';
    const title = data?.id ? `core.edit ${degreeTranslation}` : `core.new ${degreeTranslation}`;

    const form = reactive({
      name: data?.name ?? null,
      abbreviation: data?.abbreviation ?? null,
      file: null,
      lastGrade: data?.lastGrade == 1 ? true : false,
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          abbreviation: { required },
          lastGrade: {},
          file: { defaultImage },
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        let dataSend = {
          ...form,
          levelId: props.levelId,
          lastGrade: form.lastGrade ? 1 : 0,
          name: form.name,
          abbreviation: form.abbreviation,
          file: form.file,
        };
        await createOrUpdateDegreeService.run(dataSend, data?.id);

        emit('close');
      } catch (e) {
        console.log('eror', e);
      }
    };

    return {
      currentThumbnail,
      title,
      save,
      v$,
    };
  },
});
</script>

<style scoped>
.form-check-input {
  position: relative;
  left: 10px;
}
</style>
