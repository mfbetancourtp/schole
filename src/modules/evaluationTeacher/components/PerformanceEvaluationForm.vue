<template>
  <form @submit.prevent="save">
    <AppFormModal title="Agregar Evaluación de Desempeño">
      <template #content>
        <AppFormField :formControl="v$.form.id" :label="'Código'">
          <input type="text" class="form-control" id="codigo" v-model="v$.form.id.$model" />
        </AppFormField>

        <AppFormField :formControl="v$.form.name" :label="'Nombre'">
          <input type="text" class="form-control" id="nombre" v-model="v$.form.name.$model" />
        </AppFormField>
      </template>

      <template #actions>
        <AppButton variant="primary" label="Guardar" />
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, ref } from 'vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import useVuelidate from '@vuelidate/core';

export default defineComponent({
  name: 'PerformanceEvaluationForm',
  components: { AppButton, AppFormField, AppFormModal },
  props: {
    data: {
      type: Object, // Definir tipo adecuado para `data`
      required: true,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const data = ref(props.data ?? {});

    const form = reactive({
      id: data.value?.id ?? '',
      name: data.value?.name ?? null,
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          id: { required },
        },
      },
      { form }
    );
    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return false;

      try {
        emit('close');
      } catch (e) {
        console.log('err', e);
      }
    };
    return {
      form,
      v$,
      save,
    };
  },
});
</script>

<style scoped></style>
