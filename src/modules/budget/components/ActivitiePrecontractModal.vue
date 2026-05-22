<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.activitie" :label="'Actividad'">
          <AppVoiceInput id="activitie" v-model="v$.form.activitie.$model" textareaClass="form-control" />
        </AppFormField>
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
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

export default defineComponent({
  name: 'ActivitiePrecontractModal',
  components: { AppFormModal, AppFormField, AppButton, AppVoiceInput },

  props: {
    data: {
      type: String,
      required: false,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    // const title = ref('Actividad');
    let title = props.data ? 'Editar actividad' : 'Agregar actividad';

    const form = reactive({
      activitie: props.data,
    });
    const v$ = useVuelidate(
      {
        form: {
          activitie: { required },
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      emit('close', form.activitie, props.data);
    };

    return {
      title,
      form,
      v$,
      save,
    };
  },
});
</script>

<style scoped></style>
