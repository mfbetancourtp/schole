<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title + (v$.form.name.$model === undefined ? '' : v$.form.name.$model)">
      <template v-slot:content>
        <AppLoading v-if="loading" />
        <template v-else>
          <div class="form-row">
            <AppFormField :form-control="v$.form.name">
              <label for="name">Nombre</label>
              <input type="text" class="form-control" v-model="v$.form.name.$model" />
            </AppFormField>
          </div>
          <div class="form-row">
            <AppFormField :form-control="v$.form.code" label="Código">
              <AppAutocomplete v-model="v$.form.code.$model" label="value" :options="invoiceConstants" :reduce="(d: any) => d.value"></AppAutocomplete>
            </AppFormField>
          </div>
        </template>
      </template>
      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref, toRefs } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import useVuelidate from '@vuelidate/core';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { CreateOrUpdateTypeInvoicesService } from '../services/createOrUpdateTypeInvoices.service';
import { GetTypeInvoicesConstantService } from '../services/getTypeInvoicesConstant.service';
const createOrUpdateTypeInvoicesService = new CreateOrUpdateTypeInvoicesService();
const getInvoiceConstantsService = new GetTypeInvoicesConstantService();

export default defineComponent({
  name: 'TypeInvoiceModal',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    AppLoading,
    AppAutocomplete,
  },
  props: {
    data: {
      type: Object as PropType<any | null>,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { data } = toRefs(props);
    let title = 'Agregar tipo de factura';
    if (props.data?.id) {
      title = 'Editar tipo de factura ';
    }
    const loading = ref(true);
    const invoiceConstants = ref([]);
    const form: any = reactive({
      id: data.value?.id ?? null,
      name: data.value?.name,
      code: data.value?.code,
    });
    const v$ = useVuelidate(
      {
        form: {
          id: {},
          name: { required },
          code: { required },
        },
      },
      { form }
    );
    onMounted(async () => {
      try {
        invoiceConstants.value = await getInvoiceConstantsService.run();
      } catch (error) {
        console.log('This is error', error);
      }
      loading.value = false;
    });
    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      loading.value = true;
      try {
        await createOrUpdateTypeInvoicesService.run(form, data.value?.id);
        loading.value = false;
        emit('close');
      } catch (error) {
        console.log('This is error', error);
        loading.value = false;
      }
    };
    return {
      title,
      loading,
      v$,
      save,
      invoiceConstants,
    };
  },
});
</script>
