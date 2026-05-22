<template>
  <form @submit.prevent="save">
    <AppLoading v-if="loading" />
    <AppFormModal v-else :title="title">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField :form-control="v$.form.name" :label="'Nombre de la clase de pago'">
            <input class="form-control" type="text" id="name" v-model="v$.form.name.$model" />
          </AppFormField>
          <AppFormField :form-control="v$.form.typeId" label="Seleccione el tipo de pago">
            <AppAutocomplete v-model="v$.form.typeId.$model" :options="listTypes" :clearable="false"></AppAutocomplete>
          </AppFormField>
        </div>
        <div class="form-row">
          <AppFormField :form-control="v$.form.formId" label="Seleccione la forma de pago">
            <AppAutocomplete v-model="v$.form.formId.$model" :options="listForms" :clearable="false"></AppAutocomplete>
          </AppFormField>
          <AppFormField :form-control="v$.form.natureId" label="Seleccione la naturaleza de pago ">
            <AppAutocomplete v-model="v$.form.natureId.$model" :options="listNature" :clearable="false"></AppAutocomplete>
          </AppFormField>
        </div>
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
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, onMounted, ref, toRefs } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { CreateOrUpdateClassPaymentService } from '../services/createOrUpdateClassPayment.service';
import { GetAllPaymentTypeService } from '../services/getAllPaymentType.service';
import { GetAllPaymentMethodsService } from '../services/getAllPaymentMethods.service';
import { GetAllNaturePaymentService } from '../services/getAllNaturePayment.service';

const createOrUpdateClassPaymentService = new CreateOrUpdateClassPaymentService();
const getAllPaymentTypeService = new GetAllPaymentTypeService();
const getAllPaymentMethodsService = new GetAllPaymentMethodsService();
const getAllNaturePaymentService = new GetAllNaturePaymentService();

export default defineComponent({
  name: 'ClassPaymentForm',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    AppLoading,
    AppAutocomplete,
  },

  props: {
    financingSystemId: {
      type: Number,
      required: true,
    },
    data: {
      type: Object,
      required: false,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    console.log(props.data);
    const { data } = toRefs(props);
    let title = ref(data.value?.id ? `Editar clase de pago - ${data.value?.name}` : 'Crear nueva clase de pago');

    const listTypes = ref();
    const listForms = ref();
    const listNature = ref();
    const loading = ref(true);
    const form: any = reactive({
      //id: data?.id,
      name: data.value?.name ?? null,
      description: data.value?.description ?? null,
      typeId: data.value?.typeId ?? null,
      natureId: data.value?.natureId ?? null,
      formId: data.value?.formId ?? null,
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          description: { required },
          typeId: { required },
          natureId: { required },
          formId: { required },
        },
      },
      { form }
    );
    onMounted(async () => {
      listTypes.value = await getAllPaymentTypeService.run();
      listForms.value = await getAllPaymentMethodsService.run();
      listNature.value = await getAllNaturePaymentService.run();
      console.log(listTypes);
      loading.value = false;
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      try {
        const dataSend = {
          name: form.name,
          description: form.description,
          typeId: form.typeId,
          natureId: form.natureId,
          formId: form.formId,
          standardizedAccountingSystemId: props.financingSystemId,
        };
        await createOrUpdateClassPaymentService.run(dataSend, data.value?.id);
        emit('close');
      } catch (e) {
        console.error(e);
      }
    };

    return {
      title,
      loading,
      save,
      v$,
      listTypes,
      listForms,
      listNature,
    };
  },
});
</script>

<style scoped></style>
