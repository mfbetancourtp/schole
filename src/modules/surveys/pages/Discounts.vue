<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppCheckPermission permission="surveys.discounts.create">
        <AppButton style="color: white;" variant="primary" :label="'core.newMale'" @click="openFormDiscount()">
        </AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="grid-cards">
          <AppCard class="card-hover" v-for="(discount, index) in discounts" :key="index">
            <template #title>
              <div>{{ discount.title }}</div>
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
          <DiscountForm v-if="modalForm" :discountId="discountId" @close="closeModalForm"></DiscountForm>
        </AppModal>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" entity="descuento" @confirmDelete="closeModalDelete">
          </AppConfirmDeleteModal>
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { defineComponent, onMounted, Ref, ref } from 'vue';

import DiscountForm from '../components/DiscountForm.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppCardTitle from '../../../shared/components/Card/AppCardTitle.vue';

import { DiscountDto } from '../dtos/discount.dto';

import { GetDiscountsService } from '../services/getDiscounts.service';
import { DeleteDiscountService } from '../services/deleteDiscount.service';
import { useHeaderStore } from '../../../stores/header.store';

const deleteDiscountService = new DeleteDiscountService();
const getDiscountsService = new GetDiscountsService();

export default defineComponent({
  name: 'DiscountsPage',
  components: {
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppButtonDelete,
    AppButtonEdit,
    DiscountForm,
    AppBaseList,
    AppCardTitle,
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

    const discounts: Ref<DiscountDto[]> = ref([]);
    const modalDelete = ref(false);
    const modalForm = ref(false);
    const loading = ref(true);
    const discountId = ref();

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Admisión y Registro', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

        await getData();
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const getData = async () => {
      try {
        discounts.value = await getDiscountsService.run();
      } catch (e) {
        console.log('error', e);
      }
    };

    const openFormDiscount = (discount: DiscountDto | null = null) => {
      discountId.value = discount?.id || null;
      modalForm.value = true;
    };
    const closeModalForm = async () => {
      modalForm.value = false;
      await getData();
    };

    const openModalDelete = (discount: DiscountDto) => {
      discountId.value = discount?.id;
      modalDelete.value = true;
    };
    const closeModalDelete = async () => {
      try {
        await deleteDiscountService.run(discountId.value);

        modalDelete.value = false;
        await getData();
      } catch (e) {
        console.log('error', e);
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
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  padding: 10px;
}
</style>
