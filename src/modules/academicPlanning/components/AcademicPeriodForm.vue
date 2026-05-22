<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.name">
          <label for="name">Nombre</label>
          <input class="form-control" type="text" id="name" v-model="v$.form.name.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.curriculumId">
          <label for="curriculum">Plan De Estudio</label>
          <v-select v-model="v$.form.curriculumId.$model" :options="curriculumsProp.value" label="name" :reduce="(curriculum: any) => curriculum.id"></v-select>
        </AppFormField>

        <AppFormField :form-control="v$.form.calendarTypeId">
          <label for="calendarType">Calendario</label>
          <v-select v-model="v$.form.calendarTypeId.$model" :options="calendarTypesProp.value" label="name" :reduce="(calendarType: any) => calendarType.id"></v-select>
        </AppFormField>

        <div class="form-row">
          <AppFormField :form-control="v$.form.startDate">
            <label for="startDate">Inicia</label>
            <input class="form-control" type="date" id="startDate" v-model="v$.form.startDate.$model" />
          </AppFormField>

          <AppFormField :form-control="v$.form.endDate">
            <label for="endDate">Termina</label>
            <input class="form-control" type="date" id="endDate" v-model="v$.form.endDate.$model" />
          </AppFormField>
        </div>

        <AppFormField :form-control="v$.form.active">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="activeForm" v-model="v$.form.active.$model" />
            <label class="form-check-label" for="activeForm">
              {{ v$.form.active.$model ? 'Activo' : 'Inactivo' }}
            </label>
          </div>
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton>Guardar</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { CreateOrUpdateAcademicPeriodService } from '../services/createOrUpdateAcademicPeriod.service';

const createOrUpdateAcademicPeriodService = new CreateOrUpdateAcademicPeriodService();

export default defineComponent({
  name: 'AcademicPeriodForm',
  components: { AppFormModal, AppFormField, AppButton },

  props: ['data', 'calendarTypes', 'curriculums'],
  emits: ['close'],

  setup(props, { emit }) {
    const academicPeriodTranslation = 'core.generalTerms.academic.academicPeriod.singular';
    const data = props.data ?? {};
    const curriculumsProp = props.curriculums ?? {};
    const calendarTypesProp = props.calendarTypes ?? {};
    let title = data?.id ? `core.edit ${academicPeriodTranslation}` : `core.new ${academicPeriodTranslation}`;

    const active: { value: boolean } = reactive({
      value: false,
    });

    const form = reactive({
      name: data?.name,
      endDate: data?.endDate,
      startDate: data?.startDate,
      curriculumId: data?.curriculumId,
      calendarTypeId: data?.calendarTypeId,
      active: !!data?.active,
    });
    const v$ = useVuelidate(
      {
        form: {
          active: {},
          name: { required },
          endDate: { required },
          startDate: { required },
          curriculumId: { required },
          calendarTypeId: { required },
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        let dataForm = {
          calendarTypeId: form.calendarTypeId,
          curriculumId: form.curriculumId,
          active: form.active ? 1 : 0,
          startDate: form.startDate,
          endDate: form.endDate,
          name: form.name,
        };

        await createOrUpdateAcademicPeriodService.run(dataForm, data?.id);
        emit('close');
      } catch (e) {
        console.log('Error', e);
      }
    };

    return {
      calendarTypesProp,
      curriculumsProp,
      active,
      title,
      save,
      v$,
    };
  },
});
</script>

<style scoped></style>
