<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.name" label="Nombre">
          <input
            type="text"
            class="form-control"
            v-model="v$.form.name.$model"
            id="name"
            pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
            title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
          />
        </AppFormField>

        <AppFormField :form-control="v$.form.description" label="Descripción">
          <AppVoiceInput  v-model="v$.form.description.$model" id="description" textareaClass="form-control" />
        </AppFormField>
        <AppFormField :form-control="v$.form.numberPeriods" label="Numero meses">
          <input type="number" class="form-control" v-model="v$.form.numberPeriods.$model" id="numberPeriods" />
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { CreateOrUpdatePeriodsAdministration } from '../services/createOrUpdatePeriodsAdministration.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdatePeriodsAdministration = new CreateOrUpdatePeriodsAdministration();

export default defineComponent({
  name: 'RoleForm',
  components: {
    AppFormField,
    AppFormModal,
    AppButton,
    AppVoiceInput,
  },

  props: ['data', 'profiles'],
  emits: ['close'],

  setup(props, { emit }) {
    let title = 'Nuevo período';
    const data = props.data ?? null;

    if (props.data?.id) title = 'Editar período';

    const form = reactive({
      id: data?.id,
      name: data?.name,
      description: data?.description,
      numberPeriods: data?.numberPeriods,
    });

    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          description: { required },
          numberPeriods: { required },
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();

      if (!formIsValid) return;

      try {
        await createOrUpdatePeriodsAdministration.run(form, data?.id);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      save,
      v$,
      emit,
    };
  },
});
</script>
