<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <div class="row">
          <div class="col-md-6">
            <AppFormField :form-control="v$.form.name" label="Nombre">
              <input class="form-control" type="text" id="name" v-model="v$.form.name.$model" placeholder="Ej: Cálculo Diferencial" />
            </AppFormField>
          </div>
          <div class="col-md-6">
            <AppFormField :form-control="v$.form.abbreviation" label="Código">
              <input class="form-control" type="text" id="abbreviation" v-model="v$.form.abbreviation.$model" placeholder="Ej: CB-MAT101" />
            </AppFormField>
          </div>
        </div>

        <div class="row mt-3">
          <div class="col-md-6">
            <AppFormField label="Nombre Corto">
              <input class="form-control" type="text" id="shortName" v-model="form.shortName" placeholder="Ej: Cálculo Dif." />
            </AppFormField>
          </div>
          <div class="col-md-6">
            <AppFormField :form-control="v$.form.purpose" label="Objetivo">
              <input class="form-control" type="text" id="purpose" v-model="v$.form.purpose.$model" placeholder="Objetivo de la asignatura" />
            </AppFormField>
          </div>
        </div>

        <div class="row mt-3">
          <div class="col-md-4">
            <AppFormField label="Créditos">
              <input class="form-control" type="number" id="credits" v-model.number="form.credits" min="0" placeholder="0" />
            </AppFormField>
          </div>
          <div class="col-md-4">
            <AppFormField label="Total Horas">
              <input class="form-control" type="number" id="totalHours" v-model.number="form.totalHours" min="0" placeholder="0" />
            </AppFormField>
          </div>
          <div class="col-md-4">
            <AppFormField label="Tipo de Asignatura">
              <select class="form-select" id="subjectType" v-model="form.subjectType">
                <option value="">-- Seleccionar --</option>
                <option value="Teórica">Teórica</option>
                <option value="Teórico-Práctica">Teórico-Práctica</option>
                <option value="Práctica">Práctica</option>
              </select>
            </AppFormField>
          </div>
        </div>

        <div class="row mt-3">
          <div class="col-md-6">
            <AppFormField label="Requisito de Grado">
              <select class="form-select" id="degreeRequirement" v-model="form.degreeRequirement">
                <option :value="false">No</option>
                <option :value="true">Sí</option>
              </select>
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
import { required, maxLength, defaultImage } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { CreateOrUpdateSubjectService } from '../services/createOrUpdateSubject.service';

const createOrUpdateSubjectService = new CreateOrUpdateSubjectService();

export default defineComponent({
  name: 'SubjectForm',
  components: {
    AppButton,
    AppFormField,
    AppFormModal,
  },

  props: ['data', 'areaId'],
  emits: ['close'],

  setup(props, { emit }) {
    const subjectTranslation = 'core.generalTerms.academic.subject.singular';
    const title = props.data?.id ? `core.edit ${subjectTranslation}` : `core.new ${subjectTranslation}`;

    const form = reactive({
      name: props.data?.name ?? null,
      abbreviation: props.data?.abbreviation ?? null,
      shortName: props.data?.shortName ?? null,
      file: null,
      purpose: props.data?.purpose ?? null,
      credits: props.data?.credits ?? null,
      totalHours: props.data?.totalHours ?? null,
      subjectType: props.data?.subjectType ?? '',
      degreeRequirement: props.data?.degreeRequirement ?? false,
      subjectScopeId: null,
      originUnitId: null,
    });

    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          abbreviation: { maxLength: maxLength(20) },
          file: { defaultImage },
          purpose: {},
          subjectScopeId: {},
          originUnitId: {},
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        await createOrUpdateSubjectService.run(
          {
            name: form.name,
            abbreviation: form.abbreviation || undefined,
            code: form.abbreviation || undefined,
            areaId: props.areaId,
            file: form.file,
          } as any,
          props.data?.id
        );
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      save,
      v$,
      form,
    };
  },
});
</script>

<style scoped></style>
