<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppCheckPermission permission="surveys.concepts.create">
        <AppButton style="color: white;" variant="primary" :label="'core.newMale'"
          :to="{ name: 'surveys.conceptCreate' }"></AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="grid-cards">
          <AppCard class="card-hover" v-for="(concept, index) in concepts" :key="index">
            <template #title>
              <div>{{ concept.title }}</div>
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
                  <AppButtonEdit :to="{
                    name: 'surveys.conceptEdit',
                    params: { conceptId: concept.id },
                  }">
                  </AppButtonEdit>
                </AppCheckPermission>
              </div>
            </template>
          </AppCard>
        </div>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" entity="concepto de cobro" @confirmDelete="closeModalDelete">
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
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { ConceptDto } from '../dtos/concept.dto';

import { GetConceptsService } from '../services/getConcepts.service';
import { DeleteConceptService } from '../services/deleteConcept.service';
import { useHeaderStore } from '../../../stores/header.store';

const deleteConceptService = new DeleteConceptService();
const getConceptsService = new GetConceptsService();

export default defineComponent({
  name: 'ConceptsPage',
  components: {
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppButtonDelete,
    AppButtonEdit,
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

    const concepts: Ref<ConceptDto[]> = ref([]);
    const modalDelete = ref(false);
    const loading = ref(true);
    const conceptId = ref();

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
        concepts.value = await getConceptsService.run();
      } catch (e) {
        console.log('error', e);
      }
    };

    const openModalDelete = (concept: ConceptDto) => {
      conceptId.value = concept?.id;
      modalDelete.value = true;
    };
    const closeModalDelete = async () => {
      try {
        await deleteConceptService.run(conceptId.value);

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
      concepts,

      closeModalDelete,
      openModalDelete,
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
