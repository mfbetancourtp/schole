<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :formControl="v$.form.code" label="core.code">
          <AppInput v-model="v$.form.code.$model" :placeholder="t('Ej: F-001')" />
        </AppFormField>

        <AppFormField :formControl="v$.form.name" label="core.name">
          <AppInput v-model="v$.form.name.$model" :placeholder="t('Ej: Formato de Microcurrículo')" />
        </AppFormField>
      </template>

      <template #actions>
        <AppButton nativeType="submit" :label="t('Guardar')" :outlined="false" variant="primary"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive, watch, computed, PropType } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import type { CurriculumFormatDto } from '../dtos/CurriculumFormatDto';

export default defineComponent({
  name: 'FormatFormModal',
  components: {
    AppFormModal,
    AppFormField,
    AppInput,
    AppButton,
  },
  props: {
    item: {
      type: Object as PropType<CurriculumFormatDto | null>,
      required: false,
      default: null,
    },
  },
  emits: ['save'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const isEdit = computed(() => !!props.item);
    const title = computed(() => (isEdit.value ? t('Editar Formato') : t('Nuevo Formato')));

    const form = reactive({
      id: 0,
      code: '',
      name: '',
    });

    const v$ = useVuelidate(
      {
        form: {
          id: {},
          code: { required },
          name: { required },
        },
      },
      { form }
    );

    watch(
      () => props.item,
      (newItem) => {
        if (newItem) {
          form.id = newItem.id;
          form.code = newItem.code;
          form.name = newItem.name;
        } else {
          form.id = 0;
          form.code = '';
          form.name = '';
        }
      },
      { immediate: true }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      emit('save', { ...form });
    };

    return {
      t,
      title,
      form,
      v$,
      save,
    };
  },
});
</script>
