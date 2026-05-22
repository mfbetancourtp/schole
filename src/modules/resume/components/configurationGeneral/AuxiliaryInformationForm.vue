<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :formControl="v$.form.name" :label="'Nombre'">
          <input type="text" class="form-control" id="name" v-model="v$.form.name.$model" />
        </AppFormField>

        <AppFormField v-if="useDescription" :formControl="v$.form.description" :label="'Descripción'">
          <textarea class="form-control" id="description" v-model="v$.form.description.$model"></textarea>
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton variant="primary" label="core.save" :disabled="isSubmitting"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import { ButtonLoadingService } from '../../../../shared/services/buttonLoading.service';

const buttonLoadingService = new ButtonLoadingService();

export default defineComponent({
  name: 'AuxiliaryInformationForm',
  components: { AppButton, AppFormField, AppFormModal },

  props: {
    data: {
      type: Object,
    },
    currentEntity: {
      type: Object,
      required: true,
    },
    dataAuxiliary: {
      type: Object,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const data = ref(props.data ?? {});
    const entity = ref(props.currentEntity);
    const isSubmitting = ref(false);
    const useDescription = ref(entity.value.useDescription);

    const useId = ref(entity.value.useId);

    const singular = ref(`${entity.value.singularName || entity.value.name}`);
    const title = ref(props.data?.id ? `core.edit ${singular.value}` : `core.new ${singular.value}`);

    const form = reactive({
      name: data.value?.name ?? null,
      description: data.value?.description ?? null,
      id: data.value?.id ?? 0,
    });

    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          description: {},
        },
      },
      { form }
    );

    const save = async () => {
      if (isSubmitting.value) return;

      // Dispara la validación y devuelve true/false
      const formIsValid = await v$.value.$validate();

      if (!formIsValid) {
        // Imprime en consola todos los errores de validación
        // Cada objeto de v$.value.$errors tiene:
        //  - $property: el campo
        //  - $message: mensaje (si lo definiste)
        //  - $validator: nombre del validador
        console.log('Errores del formulario:', v$.value.$errors);
        return;
      }

      try {
        isSubmitting.value = true;

        // Construir el payload dinámicamente basado en la configuración de la entity
        const payload: any = {
          name: form.name, // name siempre se envía (es obligatorio)
        };

        // Mapeo de campos: [flag de la entity, nombre del campo en el form]
        const fieldMapping = [
          { flag: useDescription, field: 'description' },
          { flag: useId, field: 'id' },
        ];

        // Agregar campos al payload solo si el flag es true
        fieldMapping.forEach(({ flag, field }) => {
          if (flag.value === true) {
            payload[field] = form[field as keyof typeof form];
          }
        });

        // Caso especial para id (solo si es mayor a 0)
        if (useId.value === true && form.id > 0) {
          payload.id = form.id;
        }

        console.log('Payload a enviar:', payload);

        await entity.value.serviceCreateOrUpdate.run(payload, data.value?.id);
        emit('close');
      } catch (e) {
        console.log('error al guardar en servidor:', e);
      } finally {
        isSubmitting.value = false;
        buttonLoadingService.isSaving(false);
      }
    };

    return {
      isSubmitting,
      useDescription,
      title,
      save,
      v$,
    };
  },
});
</script>

<style scoped></style>
