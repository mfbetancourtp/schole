<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField :form-control="v$.form.code" label="Siglas" class="col-3">
            <input type="text" class="form-control" id="organizationalUnit.code" v-model="v$.form.code.$model" />
          </AppFormField>

          <AppFormField :form-control="v$.form.name" label="Nombre">
            <input type="text" class="form-control" id="organizationalUnit.name" v-model="v$.form.name.$model" />
          </AppFormField>
        </div>

        <div class="form-row">
          <AppFormField :form-control="v$.form.phoneNumber" label="Teléfono" class="col-3">
            <input type="text" class="form-control" id="organizationalUnit.phoneNumber" v-model="v$.form.phoneNumber.$model" />
          </AppFormField>

          <AppFormField :form-control="v$.form.mail" label="Email">
            <input type="email" class="form-control" id="organizationalUnit.mail" v-model="v$.form.mail.$model" />
          </AppFormField>
        </div>

        <AppFormField :form-control="v$.form.unitColor" label="Color">
          <input type="color" class="form-control form-control-color" id="organizationalUnit.unitColor" v-model="v$.form.unitColor.$model" />
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required, maxLength } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

import { CreateOrUpdateOrganizationalUnitsService } from '../services/createOrUpdateOrganizationalUnits.service';

const createOrUpdateOrganizationalUnitsService = new CreateOrUpdateOrganizationalUnitsService();

export default defineComponent({
  name: 'OrganizationalUnitForm',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
  },

  props: ['orgaUnit'],
  emits: ['close'],

  setup(props, { emit }) {
    const organizationalUnit = props.orgaUnit ?? null;
    const title = organizationalUnit?.id ? 'Editar Unidad Organizacional' : 'Crear Unidad Organizacional';

    const form = reactive({
      code: organizationalUnit?.code ?? null,
      name: organizationalUnit?.name ?? null,
      phoneNumber: organizationalUnit?.phoneNumber ?? null,
      mail: organizationalUnit?.mail ?? null,
      unitColor: organizationalUnit?.unitColor ?? (null as string | null),
    });
    const v$ = useVuelidate(
      {
        form: {
          code: { required, maxLength: maxLength(10) },
          name: { required },
          phoneNumber: {},
          mail: { required },
          unitColor: {},
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        await createOrUpdateOrganizationalUnitsService.run(form, organizationalUnit?.id);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      save,
      v$,
    };
  },
});
</script>

<style scoped></style>
