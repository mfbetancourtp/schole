<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.name" label="Nombre">
          <input id="name" type="text" class="form-control" v-model="v$.form.name.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.description" :label="'Descripción'">
          <AppVoiceInput id="description" v-model="v$.form.description.$model" textareaClass="form-control" />
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
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

import { CreateOrUpdateBudgetLineService } from '../services/createOrUpdateBudgetLine.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateBudgetLineService = new CreateOrUpdateBudgetLineService();

export default defineComponent({
  name: 'BudgetLinesForm',
  components: {
    AppFormField,
    AppFormModal,
    AppButton,
    AppVoiceInput,
  },

  props: {
    data: {
      type: Object,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const budgetLine: any = props.data ?? null;
    const title = budgetLine?.id ? 'Editar rubro' : 'Nuevo rubro';

    const form = reactive({
      name: budgetLine?.name ?? null,
      description: budgetLine?.description ?? '',
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
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      try {
        const dataSend = {
          name: form.name,
          description: form.description ? form.description : null,
        };

        await createOrUpdateBudgetLineService.run(dataSend, budgetLine?.id);

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
