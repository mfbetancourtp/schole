<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title + (v$.form.name.$model === undefined ? '' : v$.form.name.$model)">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField :form-control="v$.form.name">
            <label for="name">Nombre</label>
            <input type="text" class="form-control" v-model="v$.form.name.$model" />
          </AppFormField>
        </div>
        <div class="form-row">
          <AppFormField :form-control="v$.form.description">
            <label for="naspareKgme">Descripción</label>
            <input type="text" class="form-control" v-model="v$.form.description.$model" />
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
import { defineComponent, onMounted, PropType, reactive, ref, toRefs } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import useVuelidate from '@vuelidate/core';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { CreateOrUpdatePaymentTypeService } from '../services/createOrUpdatePaymentType.service';

export default defineComponent({
  name: 'PaymentTypeModal',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
  },
  props: {
    data: {
      type: Object as PropType<any | null>,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const createOrUpdatePaymentTypeService = new CreateOrUpdatePaymentTypeService();
    const { data } = toRefs(props);
    let title = 'Agregar tipo de pago ';
    if (props.data?.id) {
      title = 'Editar tipo de pago ';
    }
    const loading = ref(true);
    const form: any = reactive({
      name: data.value?.name,
      description: data.value?.description,
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          description: { required },
        },
      },
      { form }
    );
    onMounted(() => {
      loading.value = false;
    });
    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      loading.value = true;
      try {
        await createOrUpdatePaymentTypeService.run(form, data.value?.id);
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
    };
  },
});
</script>
