<template>
  <form @submit.prevent="save">
     <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField :form-control="v$.form.defaultCode" label="collections.surcharges.form.defaultCode" class="col-4">
            <input
              class="form-control"
              type="text"
              id="defaultCode"
              v-model="v$.form.defaultCode.$model"
              pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
              title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
            />
          </AppFormField>

          <AppFormField :form-control="v$.form.title" label="collections.surcharges.form.title">
            <input
              class="form-control"
              type="text"
              id="title"
              v-model="v$.form.title.$model"
              pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
              title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
            />
          </AppFormField>
        </div>

        <AppFormField :form-control="v$.form.description" :label="'collections.surcharges.form.description'">
          <AppVoiceInput v-model="v$.form.description.$model" id="description" textareaClass="form-control"  />
        </AppFormField>

        <div class="form-row">
          <AppFormField :form-control="v$.form.value" label="collections.surcharges.form.value">
            <input class="form-control" type="number" id="value" v-model="v$.form.value.$model" />
          </AppFormField>

          <div class="col-4 d-flex align-items-end">
            <AppFormField :form-control="v$.form.isPercent" :label="'collections.surcharges.form.isPercent'" class="form-check form-switch">
              <input v-model="v$.form.isPercent.$model" class="form-check-input" type="checkbox" />
            </AppFormField>
          </div>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { CreateOrUpdateSurchargeService } from '../services/createOrUpdateSurcharge.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateSurchargeService = new CreateOrUpdateSurchargeService();

export default defineComponent({
  name: 'SurchargeForm',
  components: { AppFormModal, AppButton, AppFormField, AppVoiceInput },

  props: ['data'],
  emits: ['close'],

  setup(props, { emit }) {
    let title = props.data ? 'Editar Recargo' : 'Nuevo Recargo';

    const form = reactive({
      defaultCode: props.data?.defaultCode ?? null,
      title: props.data?.title ?? '',
      description: props.data?.description ?? '',
      value: props.data?.value ?? 0,
      isPercent: props.data?.isPercent ? true : false,
      linkedProductId: props.data?.linkedProductId ?? null,
    });
    const v$ = useVuelidate(
      {
        form: {
          defaultCode: {},
          title: { required },
          description: { required },
          value: { required },
          isPercent: {},
          linkedProductId: {},
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        await createOrUpdateSurchargeService.run(form, props.data?.id);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      save,
      emit,
      v$,
    };
  },
});
</script>

<style scoped></style>
