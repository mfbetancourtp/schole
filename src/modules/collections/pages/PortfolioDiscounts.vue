<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :routes="routes">
    <template #actions>
      <AppCheckPermission permission="surveys.discounts.create">
        <AppButton style="color: white;" :label="'core.newMale'" @click="openFormDiscount()"></AppButton>
      </AppCheckPermission>
    </template>

    <template v-slot:content>
      <div class="items mt-2">
        <AppCard class="card-hover" v-for="(discount, index) in discounts" :key="index">
          <template #title>
           {{ discount.title}}
          </template>

          <template #body>
            <p class="tw-line-clamp-3">
              {{ discount.description || 'Aun no se ha agregado una descripción' }}
            </p>
          </template>

          <template #footer>
            <div class="d-flex justify-content-end gap-1">
              <AppCheckPermission permission="surveys.discounts.edit">
                <AppButtonDelete @click="openModalDelete(discount)"></AppButtonDelete>
              </AppCheckPermission>

              <AppCheckPermission permission="surveys.discounts.delete">
                <AppButtonEdit @click="openFormDiscount(discount)"></AppButtonEdit>
              </AppCheckPermission>
            </div>
          </template>
        </AppCard>
      </div>

      <AppModal v-model="modalForm" size="lg">
        <DiscountFormPortfolio v-if="modalForm" :discountId="discountId" @close="closeModalForm"></DiscountFormPortfolio>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="descuento" @confirmDelete="closeModalDelete" @close="modalDelete= false"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { defineComponent, onMounted, Ref, ref } from 'vue';

import DiscountFormPortfolio from '../components/DiscountFormPortfolio.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCardTitle from '../../../shared/components/Card/AppCardTitle.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { PortfolioDiscountDto } from '../dtos/portfoliodiscount.dto';

import { GetDiscountsPortfolioService } from '../services/getDiscountsPortfolio.service';
import { DeleteDiscountPortfolioService } from '../services/deleteDiscountPortfolio.service';
import { useHeaderStore } from '../../../stores/header.store';

const deleteDiscountPortfolioService = new DeleteDiscountPortfolioService();
const getDiscountsPortfolioService = new GetDiscountsPortfolioService();

export default defineComponent({
  name: 'DiscountsCollections',
  components: {
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppButtonDelete,
    AppButtonEdit,
    DiscountFormPortfolio,
    AppCardTitle,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Descuentos';
    const routes = [{ name: title }];
    useMeta({ title: title });

    const discounts: Ref<PortfolioDiscountDto[]> = ref([]);
    const modalDelete = ref(false);
    const modalForm = ref(false);
    const loading = ref(true);
    const discountId = ref();

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

      loading.value = false;
    });

    const getData = async () => {
      try {
        discounts.value = await getDiscountsPortfolioService.run();
      } catch (e) {
        console.log(e);
      }
    };

    const openFormDiscount = (discount: PortfolioDiscountDto | null = null) => {
      discountId.value = discount?.id || null;
      modalForm.value = true;
    };
    const closeModalForm = async () => {
      modalForm.value = false;
      await getData();
    };

    const openModalDelete = (discount: PortfolioDiscountDto) => {
      discountId.value = discount?.id;
      modalDelete.value = true;
    };
    const closeModalDelete = async () => {
      try {
        await deleteDiscountPortfolioService.run(discountId.value);

        modalDelete.value = false;
        await getData();
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      routes,
      title,
      t,

      modalDelete,
      discountId,
      discounts,
      modalForm,

      openFormDiscount,
      closeModalDelete,
      openModalDelete,
      closeModalForm,
    };
  },
});
</script>

<style scoped>
.items {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
}
</style>
