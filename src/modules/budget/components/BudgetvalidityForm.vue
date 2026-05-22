<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <div class="form-row">
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

          <AppFormField :form-control="v$.form.code">
            <label for="code">Código</label>
            <input v-model="v$.form.code.$model" type="text" class="form-control" />
          </AppFormField>
        </div>

        <div class="form-row">
          <AppFormField :form-control="v$.form.startDate" label="Desde">
            <input v-model="v$.form.startDate.$model" id="startDate" class="form-control" type="date" />
          </AppFormField>

          <AppFormField :form-control="v$.form.endDate" label="Hasta">
            <input v-model="v$.form.endDate.$model" id="endDate" class="form-control" type="date" />
          </AppFormField>
        </div>
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
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

import { CreateOrUpdateBudgetValidityService } from '../services/createOrUpdateBudgetValidity.service';
const createOrUpdateBudgetValidityService = new CreateOrUpdateBudgetValidityService();

export default defineComponent({
  name: 'BudgetValidityForm',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
  },

  props: ['data', 'profiles'],
  emits: ['close'],

  setup(props, { emit }) {
    let title = 'Nueva Vigencia presupuestal';
    const data = props.data ?? null;

    if (props.data?.id) title = 'Editar Vigencia presupuestal';

    const form = reactive({
      name: props.data?.name,
      code: props.data?.code ?? null,
      startDate: props.data ? props.data.startDate : null,
      endDate: props.data ? props.data.endDate : null,
    });

    const v$ = useVuelidate(
      {
        form: {
          name: {},
          code: {},
          startDate: { required },
          endDate: { required },
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();

      if (!formIsValid) return;

      try {
        await createOrUpdateBudgetValidityService.run(form, data?.id);

        emit('close');
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      save,
      emit,
      title,
      v$,
    };
  },
});
</script>
