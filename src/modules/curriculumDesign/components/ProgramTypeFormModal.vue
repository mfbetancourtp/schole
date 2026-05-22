<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :formControl="v$.form.code" label="core.code">
          <AppInput v-model="v$.form.code.$model" :placeholder="t('Ej: PRE')" />
        </AppFormField>

        <AppFormField :formControl="v$.form.name" label="core.name">
          <AppInput v-model="v$.form.name.$model" :placeholder="t('Ej: Pregrado')" />
        </AppFormField>

        <div class="row mt-3">
          <div class="col-md-6">
            <AppFormField :formControl="v$.form.isCurricular" :label="t('Curricular')">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="isCurricular" v-model="isCurricular" />
                <label class="form-check-label" for="isCurricular">
                  {{ isCurricular ? 'Sí' : 'No' }}
                </label>
              </div>
            </AppFormField>
          </div>

          <div class="col-md-6">
            <AppFormField :formControl="v$.form.isActive" :label="t('Estado')">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="isActive" v-model="isActive" />
                <label class="form-check-label" for="isActive">
                  {{ isActive ? 'Activo' : 'Inactivo' }}
                </label>
              </div>
            </AppFormField>
          </div>
        </div>
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

import type { ProgramTypeDto } from '../dtos/ProgramTypeDto';

export default defineComponent({
  name: 'ProgramTypeFormModal',
  components: {
    AppFormModal,
    AppFormField,
    AppInput,
    AppButton,
  },
  props: {
    item: {
      type: Object as PropType<ProgramTypeDto | null>,
      required: false,
      default: null,
    },
  },
  emits: ['save'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const isEdit = computed(() => !!props.item);
    const title = computed(() => (isEdit.value ? t('Editar Tipo de Programa') : t('Nuevo Tipo de Programa')));

    const form = reactive<ProgramTypeDto>({
      id: 0,
      code: '',
      name: '',
      isCurricular: 1,
      isActive: 1,
    });

    const v$ = useVuelidate(
      {
        form: {
          id: {},
          code: { required },
          name: { required },
          isCurricular: {},
          isActive: {},
        },
      },
      { form }
    );

    watch(
      () => props.item,
      (newItem) => {
        if (newItem) {
          Object.assign(form, { ...newItem });
        } else {
          form.id = 0;
          form.code = '';
          form.name = '';
          form.isCurricular = 1;
          form.isActive = 1;
        }
      },
      { immediate: true }
    );

    const isCurricular = computed({
      get: () => form.isCurricular === 1,
      set: (value: boolean) => (form.isCurricular = value ? 1 : 0),
    });

    const isActive = computed({
      get: () => form.isActive === 1,
      set: (value: boolean) => (form.isActive = value ? 1 : 0),
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      emit('save', { ...form });
    };

    return {
      t,
      title,
      v$,
      isCurricular,
      isActive,
      save,
    };
  },
});
</script>
