<template>
  <form @submit.prevent="save">
    <AppFormModal title="Agregar Requisito" @cancel="$emit('cancel')">
      <template #content>
        <AppFormField :form-control="v$.form.requirementType" label="Tipo de requisito">
          <select class="form-select" v-model="v$.form.requirementType.$model">
            <option value="">Seleccione</option>
            <option v-for="t in REQUIREMENT_TYPES" :key="t" :value="t">
              {{ t }}
            </option>
          </select>
        </AppFormField>

        <AppFormField :form-control="v$.form.operator" label="Operador">
          <select class="form-select" v-model="v$.form.operator.$model">
            <option v-for="op in OPERATORS" :key="op" :value="op">
              {{ op }}
            </option>
          </select>
        </AppFormField>

        <AppFormField :form-control="v$.form.value" label="Valor">
          <input type="number" class="form-control" v-model.number="v$.form.value.$model" placeholder="Ej. 3.5" step="0.1" min="0" />
        </AppFormField>

        <div class="d-flex align-items-center gap-2 mt-1">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="reqIsRequired" v-model="form.isRequired" />
            <label class="form-check-label" for="reqIsRequired">Requisito obligatorio</label>
          </div>
        </div>
      </template>

      <template #actions>
        <AppButton :outlined="false" label="Agregar"></AppButton>
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

const REQUIREMENT_TYPES = ['Promedio Mínimo', 'Semestre Mínimo', 'Edad Máxima', 'Edad Mínima', 'Créditos Cursados', 'Estrato Socioeconómico'];

const OPERATORS = ['>=', '<=', '=', '>', '<'];

export default defineComponent({
  name: 'ScholarshipRequirementForm',
  components: { AppFormModal, AppFormField, AppButton },
  emits: ['save', 'cancel'],

  setup(_, { emit }) {
    const form = reactive({
      requirementType: '',
      operator: '>=',
      value: null as number | null,
      isRequired: true,
    });

    const v$ = useVuelidate(
      {
        form: {
          requirementType: { required },
          operator: { required },
          value: { required },
        },
      },
      { form }
    );

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      emit('save', {
        requirementType: form.requirementType,
        operator: form.operator,
        value: form.value,
        isRequired: form.isRequired,
      });
    };

    return { REQUIREMENT_TYPES, OPERATORS, form, v$, save };
  },
});
</script>
