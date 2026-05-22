<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :routes="routes">
    <template #actions>
      <AppCheckPermission permission="surveys.concepts.create">
        <AppButton style="color: white;" :label="'core.newMale'" :to="{ name: 'collections.portfolioConceptCreate' }"></AppButton>
      </AppCheckPermission>
    </template>

    <template v-slot:content>
      <div class="items mt-2">
        <AppCard class="card-hover" v-for="(concept, index) in concepts" :key="index">
          <template #title>
            {{concept.title}}
          </template>

          <template #body>
            <p class="tw-line-clamp-3">
              {{ concept.description || 'Aun no se ha agregado una descripción' }}
            </p>

            <h6>
              Vigencia:
              <AppBadge :variant="primary" :label="`${concept.validityPeriod} meses`"></AppBadge>
            </h6>
          </template>

          <template #footer>
            <div class="d-flex justify-content-end gap-1">
              <AppCheckPermission permission="surveys.concepts.edit">
                <AppButtonDelete @click="openModalDelete(concept)"></AppButtonDelete>
              </AppCheckPermission>

              <AppCheckPermission permission="surveys.concepts.delete">
                <AppButtonEdit
                  :to="{
                    name: 'collections.portfolioConceptEdit',
                    params: { conceptId: concept.id },
                  }"
                ></AppButtonEdit>
              </AppCheckPermission>
            </div>
          </template>
        </AppCard>
      </div>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="concepto de cobro" @confirmDelete="closeModalDelete" @close="modalDelete= false"> </AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { defineComponent, onMounted, Ref, ref } from 'vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
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

import { PortfolioConceptDto } from '../dtos/portfolioConcept.dto';

import { GetConceptsPortfolioService } from '../services/getConceptsPortfolio.service';
import { DeleteConceptPortfolioService } from '../services/deleteConceptPortfolio.service';
import { useHeaderStore } from '../../../stores/header.store';

const deleteConceptService = new DeleteConceptPortfolioService();
const getConceptsService = new GetConceptsPortfolioService();

export default defineComponent({
  name: 'ConceptsCollection',
  components: {
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppButtonDelete,
    AppButtonEdit,
    AppCardTitle,
    AppBaseList,
    AppLoading,
    AppButton,
    AppBadge,
    AppModal,
    AppCard,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Conceptos de cobro';
    const routes = [{ name: title }];
    useMeta({ title: title });

    const concepts: Ref<PortfolioConceptDto[]> = ref([]);
    const modalDelete = ref(false);
    const loading = ref(true);
    const conceptId = ref();

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
        concepts.value = await getConceptsService.run();
      } catch (e) {
        console.log(e);
      }
    };

    const openModalDelete = (concept: PortfolioConceptDto) => {
      conceptId.value = concept?.id;
      modalDelete.value = true;
    };
    const closeModalDelete = async () => {
      try {
        await deleteConceptService.run(conceptId.value);

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
      concepts,

      closeModalDelete,
      openModalDelete,
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
