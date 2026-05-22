<template>
  <AppBaseList :title="title" :routes="routes">
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <template v-else>
        <div v-if="!paymentMethods.length">
          <AppButtonNewContainer @click="openPaymentMethodModal()"></AppButtonNewContainer>

          <AppEmptyResponse :show-image="true"></AppEmptyResponse>
        </div>

        <div v-else class="grid-cards">
          <AppButtonNewContainer @click="openPaymentMethodModal()"></AppButtonNewContainer>

          <AppCard v-for="(paymentMethod, index) in paymentMethods" :key="index">
            <template #title>
             {{paymentMethod.title}}
            </template>

            <template #body>
              <p class="mb-1">{{ paymentMethod.paymentType }}</p>

              <p class="mb-0 text-break word-wrap: break-word" v-html="linkifyHtml(paymentMethod.urlWebCheckout ?? paymentMethod.urlProdPaymentGateway ?? '', { target: '_blank' })"></p>
            </template>

            <template #footer>
              <div class="d-flex justify-content-end">
                <AppButtonGroup>
                  <AppButtonDelete @click="openConfirmDelete(paymentMethod)"></AppButtonDelete>

                  <AppButtonEdit @click="openPaymentMethodModal(paymentMethod)"></AppButtonEdit>
                </AppButtonGroup>
              </div>
            </template>
          </AppCard>
        </div>
      </template>

      <AppModal v-model="paymentMethodModal" :size="'lg'">
        <PaymentMethodForm v-if="paymentMethodModal" :data="currentPaymentMethod" @close="closePaymentMethodModal"></PaymentMethodForm>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="Medio de pago" @confirmDelete="confirmDelete"  @close="modalDelete = false"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import linkifyHtml from 'linkify-html';
import * as linkify from 'linkifyjs';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import PaymentMethodForm from '../components/PaymentMethodForm.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppCardTitle from '../../../shared/components/Card/AppCardTitle.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';

import { PaymentMethodDto } from '../dtos/paymentMethod.dto';

import { GetPaymentMethodsService } from '../services/getPaymentMethods.service';
import { DeletePaymentMethodByIdService } from '../services/deletePaymentMethodById.service';
import { useHeaderStore } from '../../../stores/header.store';

const deletePaymentMethodByIdService = new DeletePaymentMethodByIdService();
const getPaymentMethodsService = new GetPaymentMethodsService();

export default defineComponent({
  name: 'PaymentMethods',
  components: {
    AppButtonNewContainer,
    AppConfirmDeleteModal,
    PaymentMethodForm,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppCardTitle,
    AppBaseList,
    AppLoading,
    AppModal,
    AppCard,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Medios de pago';

    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    const currentPaymentMethod: Ref<PaymentMethodDto | null> = ref(null);
    const paymentMethods: Ref<PaymentMethodDto[]> = ref([]);

    const paymentMethodModal = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Cartera', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
        await getData();
      } catch (e) {
        console.log(e);
      }
    });

    const getData = async () => {
      loading.value = true;

      try {
        paymentMethods.value = await getPaymentMethodsService.run();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    };

    const openPaymentMethodModal = (data: PaymentMethodDto | null = null) => {
      currentPaymentMethod.value = data;
      paymentMethodModal.value = true;
    };
    const closePaymentMethodModal = async () => {
      await getData();

      paymentMethodModal.value = false;
    };
    const openConfirmDelete = (data: PaymentMethodDto) => {
      currentPaymentMethod.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      try {
        if (currentPaymentMethod.value) {
          await deletePaymentMethodByIdService.run(currentPaymentMethod.value?.id);

          currentPaymentMethod.value = null;

          await getData();
        }
      } catch (e) {
        console.log(e);
      }

      modalDelete.value = false;
    };

    return {
      loading,
      routes,
      title,
      t,

      currentPaymentMethod,
      paymentMethodModal,
      paymentMethods,
      modalDelete,

      closePaymentMethodModal,
      openPaymentMethodModal,
      openConfirmDelete,
      confirmDelete,

      linkifyHtml,
      linkify,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
}
</style>
