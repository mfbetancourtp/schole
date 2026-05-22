<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField :form-control="v$.form.code">
            <label for="naspareKgme">Código</label>
            <input type="text" class="form-control" v-model="v$.form.code.$model" />
          </AppFormField>
        </div>
        <div class="form-row">
          <AppFormField :form-control="v$.form.name">
            <label for="name">Nombre</label>
            <input type="text" class="form-control" v-model="v$.form.name.$model" />
          </AppFormField>
        </div>
        <div class="form-row">
        <AppFormField :form-control="v$.form.active">
          <label class="form-check-label" for="activeForm">
              Estado
            </label>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="activeForm" v-model="v$.form.active.$model" />
           
          </div>
        </AppFormField>
      </div>
        
      </template>
      <template v-slot:actions>
        <AppButton variant="primary" label="core.save"></AppButton>
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

// import { CreateOrUpdateDispachOrderStatusService } from '../../../dispatchesBatches/services/batchesConformation/createOrUpdateDispachOrderStatus.service';


export default defineComponent({
  name: "LanguageModal",
  components: {
    AppFormModal,
    AppFormField,
    AppButton
  },
  props: {
    data: {
      type: Object as PropType<any | null>
    },
    campusList: {
      type: Array as PropType<any[]>
    }
    
  },
  emits: ["close"],
  setup(props, { emit }) {
    // const createOrUpdateDispachOrderStatusService = new CreateOrUpdateDispachOrderStatusService();
    const data = props.data;
    const singular = ref(`core.menu.language`);
    const title = ref(props.data?.id ? `core.edit ${'core.menu.language'}` : `core.new ${singular.value}`);
    const loading = ref(true);
    const form: any = reactive({
      id: data?.id ? data?.id : 0,
      name: data?.name,
      code: data?.code,
      active: data?.active,
    });
    const v$ = useVuelidate(
      {
        form: {
          id: {},
          name: { required },
          code: { required },
          active: {},
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
        // await createOrUpdateDispachOrderStatusService.run(form);
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
  
