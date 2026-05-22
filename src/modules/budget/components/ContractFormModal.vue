<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title + (v$.form.name.$model === undefined ? '' : v$.form.name.$model)">
      <template v-slot:content>
        <AppLoading v-if="loading" />
        <template v-else>
          <div class="form-row">
            <AppFormField :form-control="v$.form.name">
              <label for="name">Nombre</label>
              <input type="text" class="form-control" v-model="v$.form.name.$model" />
            </AppFormField>
            <AppFormField :form-control="v$.form.description" :label="'Descripción'">
              <AppVoiceInput v-model="v$.form.description.$model" textareaClass="form-control" />
            </AppFormField>
          </div>
          <div class="form-row">
            <div class="mt-4">
              <AppDropdown>
                <template #button>
                  <AppButton v-tooltip="'Filtrar categoría '" icon="filter"></AppButton>
                </template>

                <template #items>
                  <li class="mx-2">
                    <div v-for="category in categoryOptions" :key="category" class="form-check">
                      <input
                        style="cursor: pointer"
                        type="radio"
                        :id="`period-${category.label}`"
                        :value="category.label"
                        v-model="categoryId"
                        class="form-check-input"
                        @click="toggleSelection(category.label)"
                      />
                      <label :for="`category-${category}`" class="form-check-label">
                        {{ category.value }}
                      </label>
                    </div>
                  </li>
                </template>
              </AppDropdown>
            </div>
            <div style="min-width: 80%">
              <AppFormField :form-control="v$.form.documentIds" :label="'Documentos Asociados'" style="width: -webkit-fill-available">
                <AppMultiSelectPrime v-model="v$.form.documentIds.$model" :options="documentOptions" :filter="true" input-id="documentIds" />
              </AppFormField>
            </div>
          </div>
        </template>
      </template>
      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref, toRefs, watch } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import useVuelidate from '@vuelidate/core';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppMultiSelectPrime from '../../../shared/components/Forms/AppMultiSelectPrime.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppDropdown from '../../../shared/components/AppDropdown.vue';
import { CreateOrUpdateBudgetPaymentFormDocumentsService } from '../services/createOrUpdateBudgetPaymentFormDocuments.service';
import { documentBudgetDto } from '../dtos/documentBudget.dto';

import { GetDocumentsBudgetsService } from '../services/getDocumentsBudgets.service';
import { CreateOrUpdateContractFormService } from '../services/createOrUpdateContractForm.service';
import { GetDocumentsBudgetsCategoriesService } from '../services/getDocumentsBudgetsCategories.service';
import { GetBudgetPaymentFormDocumentsService } from '../services/getBudgetPaymentFormDocuments.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateContractFormService = new CreateOrUpdateContractFormService();
const getDocumentsBudgetsService = new GetDocumentsBudgetsService();
const getDocumentsBudgetsCategoriesService = new GetDocumentsBudgetsCategoriesService();
const createOrUpdateBudgetPaymentFormDocumentsService = new CreateOrUpdateBudgetPaymentFormDocumentsService();
const getBudgetPaymentFormDocumentsService = new GetBudgetPaymentFormDocumentsService();
export default defineComponent({
  name: 'ContractFormModal',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    AppLoading,
    AppMultiSelectPrime,
    AppDropdown,
    AppVoiceInput,
  },
  props: {
    data: {
      type: Object as PropType<any | null>,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { data } = toRefs(props);
    let title = 'Agregar forma de contratación ';
    if (props.data?.id) {
      title = 'Editar forma de contratación ';
    }
    const categoryId = ref<number | null>(null);
    const loading = ref(true);
    const documentOptions = ref<documentBudgetDto[]>([]);
    const categoryOptions = ref<any[]>([]);
    const form: any = reactive({
      name: data.value?.name,
      description: data.value?.description,
      documentIds: data.value?.documentIds,
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          description: { required },
          documentIds: {},
        },
      },
      { form }
    );
    onMounted(async () => {
      try {
        documentOptions.value = await getDocumentsBudgetsService.run();
        categoryOptions.value = await getDocumentsBudgetsCategoriesService.run();
        if (data.value?.id) {
          const params = {
            budgetContractFormId: data.value?.id,
          };
          const res = await getBudgetPaymentFormDocumentsService.run(params);
          form.documentIds = res.map((doc: any) => doc.documentId);
        }
      } catch (error) {
        console.error('This is error', error);
      }
      loading.value = false;
    });

    watch(
      () => categoryId.value,
      async (newCategoryId: number | null) => {
        try {
          documentOptions.value = await getDocumentsBudgetsService.run({
            categoryId: newCategoryId,
          });
        } catch (e) {
          console.error('error documentOptions: ', e);
        }
      }
    );
    const toggleSelection = (id: number) => {
      if (categoryId.value === id) {
        categoryId.value = null; // Deselecciona si ya estaba seleccionado
      }
    };
    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      loading.value = true;
      try {
        //save contract form
        const dataSend = {
          name: form.name,
          description: form.description,
        };
        const res = await createOrUpdateContractFormService.run(dataSend, data.value?.id);
        //Save documents
        const dataDocument = {
          documentIds: form.documentIds,
          budgetContractFormId: res.data?.budgetPaymentContractForm,
        };
        await createOrUpdateBudgetPaymentFormDocumentsService.run(dataDocument);
        loading.value = false;
        emit('close');
      } catch (error) {
        console.log('This is error', error);
        loading.value = false;
      }
    };
    return {
      title,
      loading,
      v$,
      save,
      documentOptions,
      categoryOptions,
      categoryId,
      toggleSelection,
    };
  },
});
</script>
