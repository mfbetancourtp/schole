<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.quota" label="Cupo">
          <input class="form-control" type="number" id="quota" v-model="v$.form.quota.$model" />
        </AppFormField>
        <div class="quotas">
          <h3>{{ quotasMessage }}</h3>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { CreateOrUpdateAcademicPeriodGroupsService } from '../services/createOrUpdateAcademicPeriodGroups.service';

const createOrUpdateAcademicPeriodGroupsService = new CreateOrUpdateAcademicPeriodGroupsService();

export default defineComponent({
  name: 'EditQuotaForm',
  components: { AppFormModal, AppButton, AppFormField },

  props: ['academicPeriodGroup'],
  emits: ['close'],

  setup(props, { emit }) {
    const data = props.academicPeriodGroup ?? null;
    let title = 'Editar Cupo Académico';

    const quotasMessage = ref('');
    const form = reactive({
      quota: data.quota,
      id: data?.id,
    });
    const v$ = useVuelidate(
      {
        form: {
          quota: {},
          id: { required },
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      if (form.quota < data.countMatriculates) {
        quotasMessage.value = 'El cupo es menor a la cantidad de matrículas';
        return;
      }
      try {
        await createOrUpdateAcademicPeriodGroupsService.run(form, data?.id);
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
      quotasMessage,
    };
  },
});
</script>

<style scoped>
.quotas {
  text-align: center;
}
</style>
