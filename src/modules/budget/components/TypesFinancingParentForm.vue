<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppLoading v-if="loading" />
        <div v-else>
          <AppFormField :form-control="v$.form.name" :label="'Nombre'">
            <input class="form-control" type="text" id="name" v-model="v$.form.name.$model" />
          </AppFormField>
          <AppFormField :form-control="v$.form.code" :label="'Código'">
            <input :disabled="haveChildren" class="form-control" type="text" id="code" v-model="v$.form.code.$model" />
          </AppFormField>
          <AppFormField :form-control="v$.form.externalCode" :label="'Código externo'">
            <input class="form-control" type="text" id="externalCode" v-model="v$.form.externalCode.$model" />
          </AppFormField>
          <AppFormField :form-control="v$.form.level" :label="'Nivel'">
            <input class="form-control" type="number" id="level" v-model="v$.form.level.$model" />
          </AppFormField>
          <AppFormField :form-control="v$.form.reference" :label="'Referencia'">
            <AppAutocomplete v-model="v$.form.reference.$model" label="label" :options="referenceOpstions" :reduce="((d: any) => d.label)"></AppAutocomplete>
          </AppFormField>
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
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { CreateOrUpdateTypesFinancingParentByFinancingSystemIdService } from '../services/createOrUpdateTypesFinancingParentByFinancingSystemId.service';
import { GetConstantReferencesExecutionService } from '../services/getConstantReferencesExecution.service';

const createOrUpdateTypesFinancingParentByFinancingSystemIdService = new CreateOrUpdateTypesFinancingParentByFinancingSystemIdService();
const getConstantReferencesExecutionService = new GetConstantReferencesExecutionService();
export default defineComponent({
  name: 'TypesFinancingParentForm',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    AppAutocomplete,
    AppLoading,
  },

  props: {
    financingSystemId: {
      type: Number,
      required: true,
      //default: null, // Será null para creación
    },
    data: {
      type: Object,
      required: false,
      default: null,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const typeFinancingTranslation = 'Tipo fuente de financiación';
    const title = props.data?.key ? `core.edit ${typeFinancingTranslation}` : `core.new ${typeFinancingTranslation}`;
    const haveChildren = !!props.data?.children?.length;
    const referenceOpstions = ref<any>({});
    const loading = ref(true);
    console.log('ParentEdit?', haveChildren);
    //console.log('props', props.data);

    const form = reactive({
      name: props.data?.data?.name ?? null,
      level: props.data?.data?.level ?? null,
      code: props.data?.data?.code ?? '',
      externalCode: props.data?.data?.externalCode ?? '',
      standardizedAccountingSystemId: props.financingSystemId ?? null,
      reference: props.data?.data?.reference ?? null,
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          level: { required },
          code: { required },
          externalCode: {},
          reference: {},
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        referenceOpstions.value = await getConstantReferencesExecutionService.run();
      } catch (e) {
        console.error(e);
      }
      loading.value = false;
    });
    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      try {
        await createOrUpdateTypesFinancingParentByFinancingSystemIdService.run(form, props.data?.key);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      save,
      v$,
      haveChildren,
      referenceOpstions,
      loading,
    };
  },
});
</script>

<style scoped></style>
