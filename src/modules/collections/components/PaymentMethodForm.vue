a
<template>
  <form @submit.prevent="save">
     <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <AppLoading v-if="loading"></AppLoading>

        <div v-else>
          <div class="form-row">
            <AppFormField :form-control="v$.form.paymentType" label="Tipo" class="col-4">
              <AppAutocomplete :options="paymentTypes" :reduce="(d: any) => d" v-model="v$.form.paymentType.$model" :input-id="'paymentType'"></AppAutocomplete>
            </AppFormField>

            <AppFormField :form-control="v$.form.title" label="Nombre">
              <input
                class="form-control"
                type="text"
                id="title"
                v-model="v$.form.title.$model"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
            </AppFormField>
          </div>

          <AppFormField v-if="v$.form.paymentType.$model == 'WebCheckout'" :form-control="v$.form.urlWebCheckout" label="URL redirección">
            <input class="form-control" type="url" id="urlWebCheckout" v-model="v$.form.urlWebCheckout.$model" />
          </AppFormField>

          <div v-if="v$.form.paymentType.$model == 'Pasarela'">
            <AppFormField :form-control="v$.form.paymentGatewayAvailableId" label="Pasarela">
              <AppAutocomplete v-model="v$.form.paymentGatewayAvailableId.$model" :input-id="'paymentGatewayAvailableId'" :options="paymentGateways"></AppAutocomplete>
            </AppFormField>

            <table v-if="currentPaymentGateway" class="table">
              <thead>
                <tr>
                  <th class="col-3">Campo</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(element, index) in currentPaymentGateway?.parameters" :key="index">
                  <td>{{ element.name }}</td>
                  <td>
                    <AppFormField v-if="!element.value" :form-control="v$.form.parameters">
                      <input
                        class="form-control"
                        type="text"
                        v-model="element.value"
                        pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                        title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                      />
                    </AppFormField>

                    <input
                      v-else
                      class="form-control"
                      type="text"
                      v-model="element.value"
                      pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                      title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <AppFormField :form-control="v$.form.onlyOfficials" class="form-check" label="Medio de pago solo para funcionarios">
            <input class="form-check-input" type="checkbox" id="onlyOfficials" v-model="v$.form.onlyOfficials.$model" />
          </AppFormField>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, Ref, ref, watch } from 'vue';
import { required, requiredIf } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { PaymentMethodDto } from '../dtos/paymentMethod.dto';
import { PaymentGatewayDto, PaymentMethodFormDto } from '../dtos/paymentMethodForm.dto';

import { RelatedDataPaymentMethodsService } from '../services/relatedDataPaymentMethods.service';
import { CreateOrUpdatePaymentMethodService } from '../services/createOrUpdatePaymentMethod.service';

const createOrUpdatePaymentMethodService = new CreateOrUpdatePaymentMethodService();
const relatedDataPaymentMethodsService = new RelatedDataPaymentMethodsService();

export default defineComponent({
  name: 'PaymentMethodForm',
  components: {
    AppFormModal,
    AppButton,
    AppFormField,
    AppAutocomplete,
    AppLoading,
  },

  emits: ['close'],
  props: {
    data: {
      type: Object as PropType<PaymentMethodDto | null>,
    },
  },

  setup(props, { emit }) {
    const data: PaymentMethodDto | null = props.data ?? null;
    const title = data ? 'Editar medio de pago (PM)' : 'Agregar medio de pago (PM)';

    const currentPaymentGateway: Ref<PaymentGatewayDto | null> = ref(null);
    const relatedData: Ref<PaymentMethodFormDto | null> = ref(null);
    const paymentGateways: Ref<PaymentGatewayDto[]> = ref([]);
    const paymentTypes: Ref<string[]> = ref([]);

    const loading = ref(true);

    const form = reactive({
      paymentType: data?.paymentType ?? null,
      title: data?.title ?? null,
      paymentGatewayAvailableId: null as any,
      urlWebCheckout: data?.urlWebCheckout ?? null,
      onlyOfficials: data?.onlyOfficials ? true : false,
      parameters: [] as any[],
    });
    const v$ = useVuelidate(
      {
        form: {
          paymentType: { required },
          title: { required },
          paymentGatewayAvailableId: {
            requiredIf: requiredIf(() => form.paymentType == 'Pasarela'),
          },
          urlWebCheckout: {
            requiredIf: requiredIf(() => form.paymentType == 'WebCheckout'),
          },
          onlyOfficials: {},
          parameters: {
            requiredIf: requiredIf(() => form.paymentType == 'Pasarela'),
          },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        relatedData.value = await relatedDataPaymentMethodsService.run();
        paymentGateways.value = relatedData.value.paymentGateways;
        paymentTypes.value = relatedData.value.paymentTypes;

        if (data?.paymentGatewayAvailableId) {
          form.paymentGatewayAvailableId = data.paymentGatewayAvailableId;
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(
      () => form.paymentType,
      async (value) => {
        if (value == 'Pasarela') {
          form.urlWebCheckout = null;
        } else if (value == 'WebCheckout') {
          form.paymentGatewayAvailableId = null;
          form.parameters = [];
        } else {
          form.paymentGatewayAvailableId = null;
          form.urlWebCheckout = null;
          form.parameters = [];
        }
      }
    );
    watch(
      () => form.paymentGatewayAvailableId,
      async (value) => {
        if (value) {
          currentPaymentGateway.value = paymentGateways.value.filter((paymentGateway) => paymentGateway.id == value)[0];
        } else {
          currentPaymentGateway.value = null;
        }
      }
    );

    const validateGatewayParameters = () => {
      let noValue: boolean = false;
      let parameters: any[] = [];

      currentPaymentGateway.value?.parameters.forEach((parameter) => {
        if (parameter.value) {
          parameters.push({ id: parameter.id, value: parameter.value });
        } else {
          noValue = true;
        }
      });

      form.parameters = noValue ? [] : parameters;
    };

    const save = async () => {
      if (form.paymentType == 'Pasarela') validateGatewayParameters();
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const dataSend = {
          paymentType: form.paymentType ?? '',
          title: form.title ?? '',
          paymentGatewayAvailableId: form.paymentGatewayAvailableId,
          urlWebCheckout: form.urlWebCheckout,
          parameters: form.parameters,
          onlyOfficials: form.onlyOfficials ? 1 : 0,
        };

        await createOrUpdatePaymentMethodService.run(dataSend, data?.id);
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
      emit,

      currentPaymentGateway,
      paymentGateways,
      paymentTypes,
    };
  },
});
</script>

<style scoped></style>
