<template>
  <form @submit.prevent="save">
    <AppFormModal
      :title="title">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField :form-control="v$.form.basePath">
            <label for="naspareKgme">BasePath</label>
            <input
              type="text"
              class="form-control"
              v-model="v$.form.basePath.$model"
            />
          </AppFormField>
        
          <AppFormField :form-control="v$.form.name">
            <label for="name">Nombre</label>
            <input
              type="text"
              class="form-control"
              v-model="v$.form.name.$model"
            />
          </AppFormField>
        </div>
        <div class="form-row">
          <AppFormField :form-control="v$.form.description">
            <label for="name">Descripción</label>
            <AppVoiceInput v-model="v$.form.description.$model"
              class="form-control"
              :cols="40"
              :rows="2" textareaClass="form-control"  />
          </AppFormField>
        </div>
        <div class="form-row">
          <AppFormField :form-control="v$.form.icon">
            <label for="name">Icono</label>
            <input
              type="text"
              class="form-control"
              v-model="v$.form.icon.$model"
            />
          </AppFormField>
       
          <AppFormField :form-control="v$.form.classCSS">
            <label for="name">Clase CSS</label>
            <input
              type="text"
              class="form-control"
              v-model="v$.form.classCSS.$model"
            />
          </AppFormField>
        </div>
        <div class="form-row">
          <AppFormField :form-control="v$.form.active">
            <label class="form-check-label" for="activeForm"> Estado </label>
            <div class="form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                id="activeForm"
                v-model="v$.form.active.$model"
              />
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
import { defineComponent, onMounted, PropType, reactive, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import useVuelidate from '@vuelidate/core';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

// import { CreateOrUpdateDispachOrderStatusService } from '../../../dispatchesBatches/services/batchesConformation/createOrUpdateDispachOrderStatus.service';

export default defineComponent({
  name: 'ModuleModal',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    AppVoiceInput
  },
  props: {
    data: {
      type: Object as PropType<any | null>,
    },
    campusList: {
      type: Array as PropType<any[]>,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    // const createOrUpdateDispachOrderStatusService = new CreateOrUpdateDispachOrderStatusService();
    const data = props.data;
    const singular = ref(`core.menu.module`);
    const title = ref(
      props.data?.id
        ? `core.edit ${'core.menu.module'}`
        : `core.new ${singular.value}`
    );
    const loading = ref(true);
    const form: any = reactive({
      id: data?.id ? data?.id : 0,
      basePath: data?.basePath,
      name: data?.name,
      description: data?.description,
      icon: data?.icon,
      classCSS: data?.classCSS,
      active: data?.active,
    });
    const v$ = useVuelidate(
      {
        form: {
          id: {},
          basePath: {},
          name: { required },
          description: {},
          icon: {},
          classCSS: {},
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
