<template>
  <AppLoading v-if="loading" />

  <form v-else @submit.prevent="save">
    <AppFormModal :title="title">
      <template #content>
        <AppFormField :form-control="v$.form.title" :label="'Nombre'">
          <input id="title" class="form-control" v-model="v$.form.title.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.description" :label="'Descripción'">
          <AppVoiceInput v-model="v$.form.description.$model"
             id="description" textareaClass="form-control"  />
        </AppFormField>

        <AppFormField :form-control="v$.form.urlVideoConvocationStep" :label="'URL Video'">
          <input v-model="v$.form.urlVideoConvocationStep.$model" type="text" class="form-control" />
        </AppFormField>

        <AppFormField :form-control="v$.form.convocationProducts" :label="'Productos o conceptos a cobrar'" />

        <table class="table table-hover">
          <thead>
            <tr>
              <th>Concepto *</th>
              <th>Valor *</th>
              <th>Obligatorio *</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(product, index) in convocationProducts.value" :key="index">
              <td>
                <AppAutocomplete v-model="convocationProducts.value[index].productId" :options="products.value" :reduce="(d: any) => d" :label="'title'" @search="searchProduct"></AppAutocomplete>
              </td>
              <td>
                <span>{{ n(product.productId?.defaultUnitValue ?? 0, 'currency') }}</span>
              </td>
              <td>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" v-model="product.isOptional" />
                </div>
              </td>
              <td>
                <AppButtonDelete @click="removeProduct(index)" />
              </td>
            </tr>
          </tbody>
        </table>

        <AppButtonNewContainer text="core.new" @click="addProduct" />

        <p class="m-0 lead text-end">{{ n(total, 'currency') }}</p>

        <hr />

        <AppFormField :form-control="v$.form.allowQuotes" class="form-check form-switch" :label="'Permitir cuotas'">
          <input class="form-check-input" type="checkbox" id="allowQuotes" v-model="v$.form.allowQuotes.$model" />
        </AppFormField>

        <div class="form-row">
          <AppFormField :form-control="v$.form.maxQuotes" :label="'Máximo de cuotas'">
            <input id="maxQuotes" type="number" class="form-control" v-model="v$.form.maxQuotes.$model" />
          </AppFormField>

          <AppFormField :form-control="v$.form.minInitialQuoteValue" :label="'Valor mínimo cuota inicial'">
            <input id="minInitialQuoteValue" type="number" class="form-control" v-model="v$.form.minInitialQuoteValue.$model" />
          </AppFormField>
        </div>

        <AppFormField :form-control="v$.form.discountsIds" :label="'Agregar descuentos aplicables al cobro'">
          <AppAutocomplete v-model="v$.form.discountsIds.$model" :options="discounts.value" :label="'title'" :multiple="true" />
        </AppFormField>
      </template>

      <template #actions>
        <AppButton label="core.save" />
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, reactive, ref } from 'vue';
import { required, requiredIf } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';
import { debounce } from 'ts-debounce';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';

import { GetDiscountsService } from '../services/getDiscounts.service';
import { SearchConceptsService } from '../services/searchConcepts.service';
import { CreateOrUpdateConvocationStepService } from '../services/createOrUpdateConvocationStep.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateConvocationStepService = new CreateOrUpdateConvocationStepService();
const searchConceptsService = new SearchConceptsService();
const getDiscountsService = new GetDiscountsService();

export default defineComponent({
  name: 'StepPayment',

  components: {
    AppButtonNewContainer,
    AppAutocomplete,
    AppButtonDelete,
    AppFormField,
    AppFormModal,
    AppLoading,
    AppButton,
    AppVoiceInput
  },

  props: {
    data: {
      type: Object as PropType<any>,
      default: null,
    },
    stepType: {
      type: Object as PropType<any>,
      default: null,
    },
    convocation: {
      type: Object as PropType<any>,
      default: null,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const { n } = useI18n();
    const title = `${props.data?.id ? 'Editar' : 'Nuevo'} paso ${props.stepType?.name}`;

    const convocationProducts: { value: any[] } = reactive({ value: [] });
    const discounts: { value: any[] } = reactive({ value: [] });
    const products: { value: any[] } = reactive({ value: [] });

    const loading = ref(true);

    const form: any = reactive({
      convocationId: props.convocation?.id,
      convocationStepTypeId: props.stepType?.id,
      order: props.data?.order ?? props.convocation?.steps.length + 1,

      title: props.data?.title ?? null,
      description: props.data?.description ?? '',
      urlVideoConvocationStep: props.data?.urlVideoConvocationStep ?? null,

      convocationProducts: [],

      allowQuotes: props.data?.allowQuotes ? (props.data?.allowQuotes ? true : false) : false,
      maxQuotes: props.data?.maxQuotes ?? null,
      minInitialQuoteValue: props.data?.minInitialQuoteValue ?? null,

      discountsIds: props.data?.discountIds ?? [],
    });
    const v$ = useVuelidate(
      {
        form: {
          convocationId: { required },
          convocationStepTypeId: { required },
          order: { required },

          title: { required },
          description: {},
          urlVideoConvocationStep: {},

          convocationProducts: { required },

          allowQuotes: { required },
          maxQuotes: { requiredIf: requiredIf(() => form.allowQuotes) },
          minInitialQuoteValue: {
            requiredIf: requiredIf(() => form.allowQuotes),
          },

          discountsIds: {},
        },
      },
      { form }
    );

    const total = computed(() => {
      let tempTotal = 0;

      convocationProducts.value.forEach((product: any) => {
        tempTotal += product.productId?.defaultUnitValue ?? 0;
      });

      return tempTotal;
    });

    onMounted(async () => {
      try {
        discounts.value = await getDiscountsService.run();

        if (props.data?.id) await preloadProductsForm();
      } catch (e) {
        console.log('err', e);
      }

      loading.value = false;
    });

    const preloadProductsForm = async () => {
      props.data?.details.forEach(async (product: any) => {
        const response = await searchConceptsService.run({
          search: product.title,
        });

        response.data.forEach((productRes: any) => {
          if (product.code == productRes.code) {
            products.value.push(product);

            convocationProducts.value.push({
              id: product.id,
              productId: productRes,
              isOptional: !product.isOptional ? true : false,
            });
          }
        });
      });
    };

    const addProduct = () => {
      convocationProducts.value.push({
        id: null,
        productId: null,
        isOptional: true,
      });
    };

    const removeProduct = (index: number) => {
      convocationProducts.value.splice(index, 1);
    };

    const loadSelectedOptions = () => {
      const productsAux: any[] = [];

      convocationProducts.value.forEach((product: any) => {
        if (product.productId) productsAux.push(product.productId);
      });

      return productsAux;
    };

    const searchProduct = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length >= 2) {
          products.value = loadSelectedOptions();
          const response = await searchConceptsService.run({
            search: search,
          });

          response.data.forEach((product: any) => {
            products.value.push(product);
          });
        } else {
          products.value = loadSelectedOptions();
        }

        loading(false);
      }
    }, 800);

    const uploadProductsForm = () => {
      convocationProducts.value.forEach((product: any) => {
        if (product.productId) {
          form.convocationProducts.push({
            ...product,
            productId: product.productId.id,
            isOptional: product.isOptional ? 0 : 1,
          });
        }
      });
    };

    const save = async () => {
      await uploadProductsForm();

      const isValid = await v$.value.$validate();
      if (!isValid) return;

      if (form.description) form.description = form.description.replace(/\n/g, '<br />');

      if (form.urlVideoConvocationStep && form.urlVideoConvocationStep.includes('youtube.com')) {
        const urlActual = form.urlVideoConvocationStep;
        const urlObjeto = new URL(urlActual);
        const parametrosConsulta = urlObjeto.searchParams;
        const videoId = parametrosConsulta.get('v');

        if (videoId) form.urlVideoConvocationStep = `https://www.youtube.com/embed/${videoId}`;
      }

      try {
        await createOrUpdateConvocationStepService.run({ ...form }, props.data?.id);

        emit('close');
      } catch (e) {
        console.log('err', e);
      }
    };

    return {
      loading,
      title,
      v$,
      n,

      convocationProducts,
      removeProduct,
      discounts,
      products,
      total,

      searchProduct,
      addProduct,
      save,
    };
  },
});
</script>
