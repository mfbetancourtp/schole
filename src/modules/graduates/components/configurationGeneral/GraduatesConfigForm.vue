<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :formControl="v$.form.name" :label="'Nombre'">
          <input type="text" class="form-control" id="name" v-model="v$.form.name.$model" />
        </AppFormField>

        <AppFormField v-if="useCode" :formControl="v$.form.code" :label="'Código'">
          <input type="text" class="form-control" id="code" v-model="v$.form.code.$model" />
        </AppFormField>

        <AppFormField v-if="useKey" :formControl="v$.form.key" :label="'Clave'">
          <input type="text" class="form-control" id="key" v-model="v$.form.key.$model" placeholder="ej. ES" />
        </AppFormField>

        <AppFormField v-if="useIsActive" :label="'Estado'">
          <div class="form-check form-switch mt-1">
            <input class="form-check-input" type="checkbox" id="isActive" v-model="form.isActiveChecked" />
            <label class="form-check-label" for="isActive">Activo</label>
          </div>
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton variant="primary" label="core.save" :disabled="isSubmitting"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';

export default defineComponent({
  name: 'GraduatesConfigForm',
  components: { AppButton, AppFormField, AppFormModal },

  props: {
    data: {
      type: Object,
      default: null,
    },
    currentEntity: {
      type: Object,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const isSubmitting = ref(false);
    const useCode = ref(props.currentEntity.useCode === true);
    const useKey = ref(props.currentEntity.useKey === true);
    const useIsActive = ref(props.currentEntity.useIsActive === true);
    const singular = props.currentEntity.singularName ?? props.currentEntity.name;
    const title = props.data?.id ? `Editar ${singular}` : `Nuevo ${singular}`;

    const form = reactive({
      name: props.data?.name ?? '',
      code: props.data?.code ?? '',
      key: props.data?.key ?? '',
      isActiveChecked: props.data?.isActive != null ? Boolean(props.data.isActive) : true,
    });

    const rules = {
      form: {
        name: { required },
        code: useCode.value ? { required } : {},
        key: useKey.value ? { required } : {},
      },
    };

    const v$ = useVuelidate(rules, { form });

    const save = async () => {
      if (isSubmitting.value) return;
      const valid = await v$.value.$validate();
      if (!valid) return;

      try {
        isSubmitting.value = true;
        const payload: Record<string, any> = { name: form.name };
        if (useCode.value) payload.code = form.code;
        if (useKey.value) payload.key = form.key;
        if (useIsActive.value) payload.isActive = form.isActiveChecked ? 1 : 0;
        await props.currentEntity.serviceCreateOrUpdate.run(payload, props.data?.id);
        emit('close');
      } catch {
        // interceptor muestra el error del backend
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      isSubmitting,
      useCode,
      useKey,
      useIsActive,
      form,
      title,
      save,
      v$,
    };
  },
});
</script>
