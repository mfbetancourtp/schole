<template>
  <AppLoading v-if="loading"></AppLoading>

  <form v-else @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.name" label="Nombre">
          <input class="form-control" type="text" id="name" v-model="v$.form.name.$model">
        </AppFormField>

        <hr>

        <h5>Formula</h5>

        <div class="form-row">
          <AppFormField :form-control="v$.form.variable1">
            <div class="d-flex align-items-end justify-content-between mb-1">
              <label for="variable1">Variable 1</label>

              <div class="d-flex justify-content-center gap-2">
                <span 
                  class="ps-2 pe-2 pointer border border-primary rounded-pill text-primary"
                  v-bind:class="{'bg-primary text-white': variable1Key}"
                  @click="variable1Key = !variable1Key"
                  :diabled="true"
                >Usar una llave</span>
              </div>
            </div>

            <AppAutocomplete
              v-if="variable1Key"
              v-model="v$.form.variable1.$model"
              :input-id="'variable1'"
              :options="keys"
            ></AppAutocomplete>

            <input v-else id="variable1" class="form-control" type="number" v-model="v$.form.variable1.$model">
          </AppFormField>

          <AppFormField :form-control="v$.form.operation" class="col-3">
            <label for="operation" class="mb-2">Operación</label>

            <AppAutocomplete
              v-model="v$.form.operation.$model"
              :input-id="'operation'"
              :options="operations"
            ></AppAutocomplete>
          </AppFormField>

          <AppFormField :form-control="v$.form.variable2">
            <div class="d-flex align-items-end justify-content-between mb-1">
              <label for="variable2">Variable 2</label>

              <div class="d-flex justify-content-center gap-2">
                <span 
                  class="ps-2 pe-2 pointer border border-primary rounded-pill text-primary"
                  v-bind:class="{'bg-primary text-white': variable2Key}"
                  @click="variable2Key = !variable2Key"
                >Usar una llave</span>
              </div>
            </div>

            <AppAutocomplete
              v-if="variable2Key"
              v-model="v$.form.variable2.$model"
              :input-id="'variable2'"
              :options="keys"
            ></AppAutocomplete>

            <input v-else id="variable2" class="form-control" type="number" v-model="v$.form.variable2.$model">
          </AppFormField>
        </div>

      </template>

      <template v-slot:actions>
        <AppButton
          :label="'core.save'" :nativeType="'submit'"
        ></AppButton>
      </template>
    </AppFormModal>
</form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { CreateOrUpdateDocumentFormulasService } from '../services/createOrUpdateDocumentFormulas.service';

const createOrUpdateDocumentFormulasService = new CreateOrUpdateDocumentFormulasService();

export default defineComponent({
  name: 'DocumentFormulasForm',
  components: { AppFormModal, AppButton, AppFormField, AppLoading, AppAutocomplete },

  props: ['data', 'documentId', 'keys'],
  emits: ['close'],

  setup(props, {emit}) {
    const data: any | null = props.data;
    let title = data?.id ? 'Editar Formula' : 'Nueva Formula';
    
    const keys: Ref<any[]> = ref(props.keys);
    const operations: Ref<any[]> = ref([
      {
        id: '+',
        name: 'Sumar',
      },
      {
        id: '-',
        name: 'Restar',
      },
      {
        id: '*',
        name: 'Multiplicar',
      },
      {
        id: '/',
        name: 'Dividir',
      }
    ]);

    const variable1Key = ref(false);
    const variable2Key = ref(false);
    const loading = ref(true);

    const form = reactive({
      name: data?.name ?? '',
      variable1: null as any,
      variable2: null as any,
      operation: null as any,
    });
    const v$ = useVuelidate({
      form: {
        name: { required },
        variable1: { required },
        variable2: { required },
        operation: { required },
      },
    }, {form});

    onMounted(async () => {
      if (data?.formula) {
        await loadFormula(data.formula);
      }

      loading.value = false;
    });

    const loadFormula = (formula: string) => {
      const formulaArr: string[] = formula.split(' ');
      form.operation = formulaArr[1];

      if (formulaArr[0].search('{') >= 0) {
        form.variable1 = keys.value.filter(key => key.id == formulaArr[0])[0].id ?? null;
        variable1Key.value = form.variable1 ? true : false;
      } else {
        form.variable1 = formulaArr[0];
      }

      if (formulaArr[2].search('{') >= 0) {
        form.variable2 = keys.value.filter(key => key.id == formulaArr[2])[0].id ?? null;
        variable2Key.value = form.variable2 ? true : false;
      } else {
        form.variable2 = formulaArr[2];
      }
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const dataSend = {
          documentId: props.documentId,
          name: form.name,
          formula: `${form.variable1} ${form.operation} ${form.variable2}`,
        };

        await createOrUpdateDocumentFormulasService.run(dataSend, data?.id);
        emit('close');
      } catch (e) {}
    };

    return {
      loading,
      title,
      save,
      v$,

      variable1Key,
      variable2Key,
      operations,
      keys,
    };
  },
});
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>