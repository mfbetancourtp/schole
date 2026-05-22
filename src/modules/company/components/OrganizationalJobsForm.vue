<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.createOrganizationalUnit">
          <div class="form-check form-switch">
            <input type="checkbox" class="form-check-input" id="createOrganizationalUnit" v-model="v$.form.createOrganizationalUnit.$model" />

            <label class="form-check-label" for="createOrganizationalUnit"> Crear unidad organizacional </label>
          </div>
        </AppFormField>

        <template v-if="v$.form.createOrganizationalUnit.$model">
          <div class="form-row">
            <AppFormField :form-control="v$.form.organizationalUnit.code" label="Siglas" class="col-3">
              <input type="text" class="form-control" id="organizationalUnit.code" v-model="v$.form.organizationalUnit.code.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.organizationalUnit.name" label="Nombre">
              <input type="text" class="form-control" id="organizationalUnit.name" v-model="v$.form.organizationalUnit.name.$model" />
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.organizationalUnit.phoneNumber" label="Teléfono" class="col-3">
              <input type="text" class="form-control" id="organizationalUnit.phoneNumber" v-model="v$.form.organizationalUnit.phoneNumber.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.organizationalUnit.mail" label="Email">
              <input type="email" class="form-control" id="organizationalUnit.mail" v-model="v$.form.organizationalUnit.mail.$model" />
            </AppFormField>
          </div>

          <AppFormField :form-control="v$.form.organizationalUnit.unitColor" label="Color">
            <input type="color" class="form-control form-control-color" id="organizationalUnit.unitColor" v-model="v$.form.organizationalUnit.unitColor.$model" />
          </AppFormField>
        </template>

        <hr />

        <OrganizationalJobsTableForm :v$="v$"></OrganizationalJobsTableForm>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required, maxLength, requiredIf, minValue } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, watch } from 'vue';
import { helpers } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import OrganizationalJobsTableForm from './OrganizationalJobsTableForm.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

import { CreateOrganizationalJobsService } from '../services/createOrganizationalJobs.service';

const createOrganizationalJobsService = new CreateOrganizationalJobsService();

export default defineComponent({
  name: 'OrganizationalJobsForm',
  components: {
    OrganizationalJobsTableForm,
    AppFormModal,
    AppFormField,
    AppButton,
  },

  emits: ['close'],

  setup(props, { emit }) {
    const title = 'Agregar cargos / unidad organizacional';

    const organizationalJobs: { value: any[] } = reactive({
      value: [],
    });

    const form = reactive({
      createOrganizationalUnit: false,
      organizationalUnit: {
        code: null,
        name: null,
        phoneNumber: null,
        mail: null,
        unitColor: null as string | null,
      },
      organizationalJobs: [{ code: null, name: null, hierarchicalLevel: null }],
    });
    const v$ = useVuelidate(
      {
        form: {
          createOrganizationalUnit: {},
          organizationalUnit: {
            code: {
              requiredIf: requiredIf(() => {
                return form.createOrganizationalUnit;
              }),
              maxLength: maxLength(10),
            },
            name: {
              requiredIf: requiredIf(() => {
                return form.createOrganizationalUnit;
              }),
            },
            phoneNumber: {},
            mail: {
              requiredIf: requiredIf(() => {
                return form.createOrganizationalUnit;
              }),
            },
            unitColor: {},
          },
          organizationalJobs: {
            required,
            $each: helpers.forEach({
              code: { required, maxLength: maxLength(10) },
              name: { required },
              hierarchicalLevel: { required, minValue: minValue(1) },
            }),
          },
        },
      },
      { form }
    );

    watch(
      () => form.createOrganizationalUnit,
      async (value) => {
        if (!value) {
          form.organizationalUnit.code = null;
          form.organizationalUnit.name = null;
          form.organizationalUnit.phoneNumber = null;
          form.organizationalUnit.mail = null;
          form.organizationalUnit.unitColor = null;
        } else {
          form.organizationalUnit.unitColor = `${import.meta.env.VITE_COLOR_PRIMARY}`;
        }
      }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        await createOrganizationalJobsService.run(form);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };
    return {
      title,
      save,
      v$,

      organizationalJobs,
    };
  },
});
</script>

<style scoped></style>
