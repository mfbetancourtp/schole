<template>
  <form @submit.prevent="save">
    <AppLoading v-if="loading" />
    <AppFormModal v-else :title="title">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField :form-control="v$.form.title" :label="'Nombre'">
            <input type="text" class="form-control" v-model="v$.form.title.$model" id="title" />
          </AppFormField>

          <AppFormField :form-control="v$.form.description" :label="'Descripción'">
            <AppVoiceInput v-model="v$.form.description.$model" id="description" textareaClass="form-control" />
          </AppFormField>
        </div>

        <div class="form-row">
          <AppFormField :form-control="v$.form.value" :label="'Valor'">
            <input type="text" class="form-control" v-model="v$.form.value.$model" id="value" />
          </AppFormField>

          <div class="col-6 d-flex align-items-end">
            <AppFormField :form-control="v$.form.isPercent" :label="'Es porcentaje?'" class="form-check form-switch">
              <input v-model="v$.form.isPercent.$model" class="form-check-input" type="checkbox" />
            </AppFormField>
          </div>
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
import { defineComponent, reactive, onMounted, ref, toRefs } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { CreateOrUpdateDiscountService } from '../services/createOrUpdateDiscount.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateDiscountService = new CreateOrUpdateDiscountService();

export default defineComponent({
  name: 'DiscountForm',
  components: { AppFormModal, AppFormField, AppButton, AppLoading,AppVoiceInput },

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
    let title = ref(data.value?.id ? `Editar descuento - ${data.value?.name}` : 'Crear descuento');

    const loading = ref(true);
    const form: any = reactive({
      //id: data?.id,
      title: data.value?.title ?? null,
      description: data.value?.description ?? null,
      value: data.value?.value ?? null,
      isPercent: data.value?.isPercent ? true : false,
    });
    const v$ = useVuelidate(
      {
        form: {
          title: { required },
          description: {},
          value: { required },
          isPercent: { required },
        },
      },
      { form }
    );
    onMounted(async () => {
      loading.value = false;
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      try {
        const dataSend = {
          title: form.title,
          description: form.description,
          value: form.value,
          isPercent: form.isPercent,
          standardizedAccountingSystemId: props.financingSystemId,
        };
        await createOrUpdateDiscountService.run(dataSend, data.value?.id);
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
    };
  },
});
</script>

<style scoped></style>
