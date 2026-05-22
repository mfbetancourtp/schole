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
        <div class="form-row">
          <AppFormField :form-control="v$.form.code">
            <label for="naspareKgme">Código</label>
            <input type="text" class="form-control" v-model="v$.form.code.$model"  />
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

import { defineComponent, onMounted, PropType, reactive, ref } from "vue";
import { required } from '../../../shared/plugins/vuelidate.plugin';
import useVuelidate from '@vuelidate/core';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';


import { CreateOrUpdateTypeAccountService } from '../services/createOrUpdateTypeAccount.service';


export default defineComponent({
  name: "BanksModal",
  components: {
    AppFormModal,
    AppFormField,
    AppButton
  },
  props: {
    data: {
      type: Object as PropType<any | null>
    },

    
  },
  emits: ["close"],
  setup(props, { emit }) {
    const createOrUpdateTypeAccountService = new CreateOrUpdateTypeAccountService();
    const data = props.data;
    let title = 'Agregar tipo de cuenta ';
    if (props.data?.id) {
      title = "Editar tipo de cuenta ";
    };
    const loading = ref(true);
    const form: any = reactive({
      id: data?.id ? data?.id : 0,
      name: data?.name,
      description: data?.description,
      code: data?.code,
    });
    const v$ = useVuelidate(
      {
        form: {
          id: {},
          name: { required },
          description: { required },
          code: { required },
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
        await createOrUpdateTypeAccountService.run(form, data?.id);
        loading.value = false;
        emit("close");
      } catch (error) {
        console.log('This is error', error);
        loading.value = false;
      };
    };
    return {
      title,
      loading,
      v$,
      save
    };
  },
});
</script>
  
