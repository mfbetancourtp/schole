<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :formControl="v$.form.code" label="core.code">
          <input type="text" class="form-control" id="operationalSchemeCode" v-model="v$.form.code.$model" />
        </AppFormField>
        <AppFormField :formControl="v$.form.name" label="core.name">
          <input type="text" class="form-control" id="operationalSchemeName" v-model="v$.form.name.$model" />
        </AppFormField>

        <div class="row mt-3">
          <div class="col-md-6">
            <AppFormField :formControl="v$.form.isActive" label="Estado">
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
      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import { CreateOrUpdateOperationalSchemesService } from '../services/createOrUpdateOperationalSchemes.service';

const createOrUpdateOperationalSchemesService = new CreateOrUpdateOperationalSchemesService();

export default defineComponent({
  name: 'ManageOperationalSchemeForm',
  components: { AppFormModal, AppFormField, AppButton },
  props: {
    operationalScheme: {
      type: Object,
      default: null,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();

    const form = reactive({
      id: null as number | null,
      code: '',
      name: '',
      isActive: 1 as number | null,
      programTypeId: null as number | null,
    });

    const title = computed(() => (form.id ? 'Editar versión esquema operativo' : 'Nueva versión esquema operativo'));

    const assignFormData = () => {
      form.id = props.operationalScheme?.id ?? null;
      form.code = props.operationalScheme?.code ?? '';
      form.name = props.operationalScheme?.name ?? '';
      form.isActive = props.operationalScheme?.isActive ?? 1;
      form.programTypeId = props.operationalScheme?.programTypeId ?? null;
    };

    watch(
      () => props.operationalScheme,
      () => {
        assignFormData();
      },
      { deep: true, immediate: true }
    );

    const v$ = useVuelidate(
      {
        form: {
          id: {},
          code: { required },
          name: { required },
          isActive: {},
          programTypeId: {},
        },
      },
      { form }
    );

    const isActive = computed({
      get: () => form.isActive === 1,
      set: (value: boolean) => (form.isActive = value ? 1 : 0),
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const payload = {
          id: form.id,
          code: form.code?.trim(),
          name: form.name?.trim(),
          isActive: form.isActive ?? 1,
          programTypeId: form.programTypeId ?? props.operationalScheme?.programTypeId ?? null,
        };

        await createOrUpdateOperationalSchemesService.run(payload, form.id ?? undefined);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      t,
      title,
      v$,
      save,
      isActive,
    };
  },
});
</script>
