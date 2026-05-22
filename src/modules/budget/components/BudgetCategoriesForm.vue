<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <template v-if="!loading">
          <AppFormField :form-control="v$.form.name" label="Nombre">
            <input id="name" type="text" class="form-control" v-model="v$.form.name.$model" />
          </AppFormField>

          <AppFormField :form-control="v$.form.description" :label="'Descripción'">

            <AppVoiceInput id="description"  v-model="v$.form.description.$model" textareaClass="form-control" />
          </AppFormField>

          <div class="form-row">
            <AppFormField :form-control="v$.form.defaultValue" label="Valor por defecto">
              <input id="name" type="number" class="form-control" v-model="v$.form.defaultValue.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.measureTypeId" label="Medida">
              <AppAutocomplete v-model="v$.form.measureTypeId.$model" :options="measureTypes"></AppAutocomplete>
            </AppFormField>
          </div>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, reactive, ref, Ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetMeasureTypesService } from '../services/getMeasureTypes.service';
import { CreateOrUpdateBudgetCategoriesService } from '../services/createOrUpdateBudgetCategories.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateBudgetCategoriesService = new CreateOrUpdateBudgetCategoriesService();
const getMeasureTypesService = new GetMeasureTypesService();

export default defineComponent({
  name: 'BudgetCategoriesForm',
  components: {
    AppAutocomplete,
    AppFormField,
    AppFormModal,
    AppButton,
    AppVoiceInput
  },

  props: {
    data: {
      type: Object,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const concept: any = props.data ?? null;
    const title = concept?.id ? 'Editar concepto' : 'Nuevo concepto';

    const measureTypes: Ref<any[]> = ref([]);

    const loading = ref(true);

    const form = reactive({
      name: concept?.name ?? null,
      description: concept?.description ?? '',
      defaultValue: concept?.defaultValue ?? 0,
      measureTypeId: concept?.measureTypeId ?? null,
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          description: {},
          defaultValue: { required },
          measureTypeId: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        measureTypes.value = await getMeasureTypesService.run();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      try {
        await createOrUpdateBudgetCategoriesService.run(form, concept?.id);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      title,
      save,
      v$,

      measureTypes,
    };
  },
});
</script>

<style scoped></style>
