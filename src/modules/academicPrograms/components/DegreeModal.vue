<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField :form-control="v$.form.abbreviation" :label="'Código'">
            <input
              class="form-control"
              type="text"
              id="abbreviation"
              v-model="v$.form.abbreviation.$model"
            />
          </AppFormField>

          <AppFormField :form-control="v$.form.name" :label="'Descripción'">
            <input
              class="form-control"
              type="text"
              id="name"
              v-model="v$.form.name.$model"
            />
          </AppFormField>
        </div>
        <div class="form-row">
          <AppFormField
            :form-control="v$.form.minCredits"
            :label="'Cantidad Minima de Créditos'"
          >
            <input
              class="form-control"
              type="text"
              id="minCredits"
              v-model="v$.form.minCredits.$model"
            />
          </AppFormField>

          <AppFormField
            :form-control="v$.form.maxCredits"
            :label="'Cantidad Máxima de Créditos'"
          >
            <input
              class="form-control"
              type="text"
              id="maxCredits"
              v-model="v$.form.maxCredits.$model"
            />
          </AppFormField>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required, maxLength } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppUploadImage from '../../../shared/components/Forms/AppUploadImage.vue';

import { CreateOrUpdateDegreeViewService } from '../services/programs/createOrUpdateDegreeView.service';

const createOrUpdateDegreeViewService = new CreateOrUpdateDegreeViewService();

export default defineComponent({
  name: 'DegreeModal',
  components: { AppUploadImage, AppFormField, AppFormModal, AppButton },

  props: ['data', 'levelId'],
  emits: ['close'],

  setup(props, { emit }) {
    const data = props.data;
    const currentThumbnail = data?.thumbnail;
    const degreeTranslation = 'Semestre';
    const title = data?.id
      ? `core.edit ${degreeTranslation}`
      : `core.new ${degreeTranslation}`;

    const form = reactive({
      name: data?.name ?? null,
      abbreviation: data?.abbreviation ?? null,
      minCredits: data?.minCredits ?? null,
      maxCredits: data?.maxCredits ?? null,
      //file: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          abbreviation: { maxLength: maxLength(100) },
          minCredits: { maxLength: maxLength(2) },
          maxCredits: { maxLength: maxLength(2) },
          //file: {defaultImage},
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        //createOrUpdateDegreeService.isFormData = form.file ? true : false;
        await createOrUpdateDegreeViewService.run(
          { ...form, levelId: props.levelId },
          data?.id
        );

        emit('close');
      } catch (e) {}
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

<style scoped></style>
