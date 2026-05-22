<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.label" :label="'Nombre'">
          <input class="form-control" type="text" id="label" v-model="v$.form.label.$model" />
        </AppFormField>
        <AppFormField :form-control="v$.form.level" :label="'Nivel'">
          <input class="form-control" type="number" id="level" v-model="v$.form.level.$model" />
        </AppFormField>
        <AppFormField :form-control="v$.form.code" :label="'Código de nivel'">
          <input class="form-control" type="text" id="code" v-model="v$.form.code.$model" />
        </AppFormField>
        <AppFormField :form-control="v$.form.numberDigits" :label="'Número de dígitos'">
          <input class="form-control" type="text" id="numberDigits" v-model="v$.form.numberDigits.$model" />
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

import { CreateOrUpdateLevelByFinancingSystemIdService } from '../services/createOrUpdateLevelByFinancingSystemId.service';

const createOrUpdateLevelByFinancingSystemIdService = new CreateOrUpdateLevelByFinancingSystemIdService();
export default defineComponent({
  name: 'LevelSystemForm',
  components: { AppFormModal, AppFormField, AppButton },

  props: {
    data: {
      type: Object,
      required: true,
    },
    level: {
      type: Object,
      required: false,
      default: null, // Será null para creación
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const levelsSystemTranslation = 'Niveles del Sismtema';
    const title = props.level?.id ? `core.edit ${levelsSystemTranslation}` : `core.new ${levelsSystemTranslation}`;

    const form = reactive({
      label: props.level?.label ?? null,
      level: props.level?.level ?? null,
      code: props.level?.code ?? null,
      numberDigits: props.level?.numberDigits ?? null,
      standardizedAccountingSystemId: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          label: { required },
          level: { required },
          code: { required },
          numberDigits: { required },
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      if (props.level?.id) {
        form.standardizedAccountingSystemId = props.level?.standardizedAccountingSystemId;
      } else {
        form.standardizedAccountingSystemId = props.data?.id;
      }
      console.log(props);
      try {
        await createOrUpdateLevelByFinancingSystemIdService.run(form, props.level?.id);
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
