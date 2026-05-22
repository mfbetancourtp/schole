<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.name" :label="'academicPrograms.areas.form.name'">
          <input class="form-control" type="text" id="name" v-model="v$.form.name.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.code" :label="'academicPrograms.areas.form.code'">
          <input class="form-control" type="text" id="code" v-model="v$.form.code.$model" />
        </AppFormField>

        <!-- <AppFormField :form-control="v$.form.file" :label="'Imagen'">
          <AppUploadImage
            input-id="file"
            v-model="v$.form.file.$model"
            :current-thumbnail="data?.thumbnail"
          ></AppUploadImage>
        </AppFormField>

        <AppFormField :form-control="v$.form.color" label="Color">
          <input
            class="form-control"
            type="color"
            id="color"
            v-model="v$.form.color.$model"
            style="width: 55px; height: 40px"
          />
        </AppFormField> -->
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required, maxLength, defaultImage } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
// import AppUploadImage from '../../../shared/components/Forms/AppUploadImage.vue';

import { CreateOrUpdateAreaService } from '../services/createOrUpdateArea.service';

const createOrUpdateAreaService = new CreateOrUpdateAreaService();

export default defineComponent({
  name: 'AreaForm',
  components: {
    //AppUploadImage,
    AppFormModal,
    AppFormField,
    AppButton,
  },

  props: ['data'],
  emits: ['close'],

  setup(props, { emit }) {
    const areaTranslation = 'core.generalTerms.academic.area.singular';
    const title = props.data?.id ? `core.edit ${areaTranslation}` : `core.new ${areaTranslation}`;

    const form = reactive({
      name: props.data?.name ?? null,
      code: props.data?.code ?? null,
      parentId: null,
      // file: null,
      // color: props.data?.color ?? '',
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          code: { maxLength: maxLength(10) },
          parentId: {},
          // file: { defaultImage },
          // color: {},
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        // createOrUpdateAreaService.isFormData = form.file ? true : false;
        await createOrUpdateAreaService.run(form, props.data?.id);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      save,
      v$,
    };
  },
});
</script>

<style scoped></style>
