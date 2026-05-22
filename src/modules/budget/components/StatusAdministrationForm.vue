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
           <AppVoiceInput type="text" class="form-control" v-model="v$.form.description.$model" id="description" />
        </AppFormField>
        <AppFormField :form-control="v$.form.type" label="Tipo">
          <AppAutocomplete input-id="type" :options="typeStatus" label="label" :reduce="(type: any) => type.id" v-model="v$.form.type.$model" class="bg-white" />
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

import { CreateOrUpdateStatusAdministrationService } from '../services/createOrUpdateStatusAdministration.service';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import { PropType } from 'vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateStatusAdministrationService = new CreateOrUpdateStatusAdministrationService();

export default defineComponent({
  name: 'RoleForm',
  components: {
    AppFormField,
    AppFormModal,
    AppButton,
    AppAutocomplete,
  },

  props: {
    data: {
      type: Object as PropType<any | null>,
    },
    typeStatus: {
      type: Array,
      default: () => [], // Asegura que siempre sea un arreglo
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    let title = 'Nuevo estado';
    const data = props.data ?? null;

    if (props.data?.id) title = 'Editar estado';

    const form = reactive({
      id: data?.id,
      name: data?.name,
      description: data?.description,
      type: data?.type,
    });

    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          description: { required },
          type: { required },
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();

      if (!formIsValid) return;

      try {
        await createOrUpdateStatusAdministrationService.run(form, data?.id);
        emit('close');
      } catch (e) {
        console.error(e);
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

<style scoped>
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.5); /* Fondo semitransparente */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}

.modal-container {
  background: #fff; /* Fondo blanco para el contenido */
  border-radius: 8px;
  padding: 20px;
  z-index: 1000;
  position: relative;
}
</style>
