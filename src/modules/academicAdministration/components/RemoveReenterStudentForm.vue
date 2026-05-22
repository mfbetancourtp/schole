<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            id="isRetired"
            v-model="isRetired.value"
          />
          <label class="form-check-label" for="isRetired">
            {{ t('academicAdministration.matriculates.formRetired.isRetired') }}
          </label>
        </div>

        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            id="hideInLists"
            v-model="hideInLists.value"
          />
          <label class="form-check-label" for="hideInLists">
            {{
              t('academicAdministration.matriculates.formRetired.hideInLists')
            }}
          </label>
        </div>

        <AppFormField
          :form-control="v$.form.retiredDate"
          v-if="isRetired.value"
        >
          <label>
            {{
              t('academicAdministration.matriculates.formRetired.retiredDate')
            }}
          </label>
          <input
            class="form-control"
            type="date"
            v-model="v$.form.retiredDate.$model"
          />
        </AppFormField>

        <AppFormField
          :form-control="v$.form.ignorePeriods"
          v-if="hideInLists.value"
        >
          <label>Periodos</label>
          <v-select
            placeholder="Ingrese mínimo 2 caracteres para iniciar la búsqueda"
            v-model="v$.form.ignorePeriods.$model"
            :reduce="(period: any) => period.id"
            :options="periods.value"
            label="name"
            multiple
          ></v-select>
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton>Guardar</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { defineComponent, onMounted, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { requiredIf, required } from '@vuelidate/validators';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { GetPeriodsByAcademicPeriodGroupIdService } from '../services/getPeriodsByAcademicPeriodGroupId.service';
import { UpdateMatriculateService } from '../services/updateMatriculate.service';

const getPeriodsByAcademicPeriodGroupIdService =
  new GetPeriodsByAcademicPeriodGroupIdService();
const updateMatriculateService = new UpdateMatriculateService();

export default defineComponent({
  name: 'RemoveReenterStudentForm',
  components: { AppFormModal, AppButton, AppFormField },

  props: ['matriculate', 'academicPeriodGroupId'],
  emits: ['close'],

  setup(props, { emit }) {
    // const  {matriculate, academicPeriodGroupId} = props;
    const { t } = useI18n();
    const matriculate = ref(props.matriculate);
    let title = matriculate.value.isRetired
      ? 'Reingresar Estudiante'
      : 'Retirar Estudiante';

    const hideInLists: { value: boolean } = reactive({
      value: false,
    });
    const isRetired: { value: boolean } = reactive({
      value: false,
    });
    const periods: { value: any } = reactive({
      value: [],
    });

    const form = reactive({
      ignorePeriods: matriculate.value.ignorePeriodIds,
      isPreEnrolled: matriculate.value.isPreEnrolled,
      retiredDate: matriculate.value.retiredDate,
      isRetired: matriculate.value.isRetired,
    });
    const v$ = useVuelidate(
      {
        form: {
          ignorePeriods: {},
          isPreEnrolled: {},
          retiredDate: {},
          isRetired: {},
        },
      },
      { form }
    );

    onMounted(async () => {
      hideInLists.value = matriculate.value.isPreEnrolled ? true : false;
      isRetired.value = matriculate.value.isRetired ? true : false;

      periods.value = await getPeriodsByAcademicPeriodGroupIdService.run(
        props.academicPeriodGroupId
      );
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        let dataForm = {
          ignorePeriods: form.ignorePeriods,
          isPreEnrolled: hideInLists.value ? 1 : 0,
          retiredDate: form.retiredDate,
          isRetired: isRetired.value ? 1 : 0,
        };

        await updateMatriculateService.run(matriculate.value.id, dataForm);
        emit('close');
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      title,
      save,
      v$,
      t,

      emit,
      hideInLists,
      isRetired,
      periods,
    };
  },
});
</script>

<style scoped></style>
