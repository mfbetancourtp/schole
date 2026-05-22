<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template #content>
        <div>
          <span class="mb-3 tw-flex-1 tw-flex tw-gap-1"
            >Esta seguro de modificar el puesto ?</span
          >
          <div class="tw-flex tw-gap-1">
            <AppFormField
              class="tw-flex tw-gap-1"
              :label="'SI'"
              :formControl="v$.form.isEdit"
            >
              <input
                class="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="inlineRadio1"
                value="1"
                v-model="v$.form.isEdit.$model"
              />
              <label class="form-check-label" for="inlineRadio1"></label>
            </AppFormField>

            <AppFormField
              class="tw-flex tw-gap-1"
              :label="'NO'"
              :formControl="v$.form.isEdit"
            >
              <input
                class="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="inlineRadio2"
                value="0"
                v-model="v$.form.isEdit.$model"
              />
              <label class="form-check-label" for="inlineRadio2"></label>
            </AppFormField>
          </div>
        </div>
        <div v-if="Number(v$.form.isEdit.$model)">
          <span class="mb-3 tw-flex-1 tw-flex tw-gap-1">Ingresa el puesto</span>
          <AppFormField :formControl="v$.form.position">
            <div class="d-flex">
              <input
                class="border border-gray-400 rounded"
                style="height: 25px; width: 11%"
                type="number"
                id="floatNumberField"
                step="any"
                min="0"
                v-model="v$.form.position.$model"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
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
import { defineComponent, reactive } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import { UpdatePositionFinalStudentService } from '../services/reports/updatePositionFinalStudent.service';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

const updatePositionFinalStudentService =
  new UpdatePositionFinalStudentService();

export default defineComponent({
  name: 'SubjectPositionFormEdit',
  components: { AppFormModal, AppButton, AppFormField },

  props: {
    data: {
      type: Object,
    },
    currentEntity: {
      type: Object,
    },
  },

  emits: ['close'],

  setup(props, { emit }) {
    const data = props.data ?? {};
    const title = 'Editar Puesto del Periodo';

    const form = reactive({
      isEdit: data?.isEdit,
      position: data?.position,
      matriculateId: data?.report?.matriculateId,
      academicPeriodId: data?.academicPeriodId,
    });

    const v$ = useVuelidate(
      {
        form: {
          matriculateId: { required },
          academicPeriodId: { required },
          position: {},
          isEdit: {},
        },
      },

      { form }
    );
    console.log('Props:', data);
    const save = async () => {
      const isValid = await v$.value.$validate();
      console.log('Formulario válido:', isValid);
      console.log('Valores del formulario:', form);
      if (!isValid) return;

      let dataSend: any = {
        matriculateId: null,
        academicPeriodId: null,
        position: null,
        isEdit: null,
      };

      emit('close');
      try {
        if (Number(form.isEdit)) {
          dataSend = {
            isEdit: Number(form.isEdit),
            position: Number(form.position),
            matriculateId: form.matriculateId,
            academicPeriodId: form.academicPeriodId,
          };
          console.log('if', form.isEdit);
        } else {
          dataSend = {
            isEdit: form.isEdit,
            position: data.position,
            matriculateId: form.matriculateId,
            academicPeriodId: form.academicPeriodId,
          };
          console.log('else', form.isEdit);
        }
        await updatePositionFinalStudentService.run(
          dataSend,
          props?.data?.matriculateNoteYearId
        );
      } catch (e) {
        console.log(e);
      }
    };
    return {
      title,
      v$,
      save,
      emit,
      form,
    };
  },
});
</script>
