<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.name" :label="'Nombre'">
          <input class="form-control" type="text" id="name" v-model="v$.form.name.$model" @input="filterInvalidChars" />
        </AppFormField>
        <AppFormField :form-control="v$.form.description" :label="'Descripción'">
          <input class="form-control" type="text" id="description" v-model="v$.form.description.$model" />
        </AppFormField>
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
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

import { CreateOrUpdateFinancingSystemsService } from '../services/createOrUpdateFinancingSystems.service';

const createOrUpdateFinancingSystemsService = new CreateOrUpdateFinancingSystemsService();

export default defineComponent({
  name: 'FinancingSystemsForm',
  components: { AppFormModal, AppFormField, AppButton },

  props: ['data'],
  emits: ['close'],

  setup(props, { emit }) {
    const FinancingSystemsTranslation = 'Sistemas de clasificación de financiación';
    const title = props.data?.id ? `core.edit ${FinancingSystemsTranslation}` : `core.new ${FinancingSystemsTranslation}`;

    const form = reactive({
      name: props.data?.name ?? null,
      description: props.data?.description ?? null,
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required, maxLength: maxLength(31) },
          description: { maxLength: maxLength(220) },
        },
      },
      { form }
    );
    const filterInvalidChars = (event: Event) => {
      const input = event.target as HTMLInputElement;
      input.value = input.value.replace(/[:\\/?*[\]]/g, '');
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      console.log(props.data.id);
      try {
        await createOrUpdateFinancingSystemsService.run(form, props.data?.id);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      save,
      v$,
      filterInvalidChars,
    };
  },
});
</script>

<style scoped></style>
