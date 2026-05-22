<template>
  <AppBaseList :title="title">
    <template v-slot:content>
      <div class="tw-flex tw-justify-end">
        <div class="mb-3 tw-w-full md:tw-w-72">
          <label for="levelDegreeName">Nivel - Grado</label>
          <v-select input-id="levelDegreeName" v-model="degreeId" :options="levelsDegrees.value" label="levelDegreeName" :reduce="(levelDegree) => levelDegree.degreeId"></v-select>
        </div>
      </div>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else>
        <AppEmptyResponse :show-image="true" v-if="notFound" :to="{ name: 'casurid.contentsList' }" to-text="Contenidos"> </AppEmptyResponse>
        <div v-else>
          <AppAccordion class="mt-2" v-slot="{ accordionId }">
            <AppAccordionItem :accordion-id="accordionId" v-for="plan in plans.value" :key="plan.id">
              <template v-slot:head>{{ plan.subject }}</template>
              <template v-slot:content>
                <div class="grid-cards">
                  <router-link
                    style="color: var(--color-primary)"
                    :to="{
                      name: 'casurid.plansCreate',
                      query: { subjectId: plan.subjectId, levelId, degreeId },
                    }"
                  >
                    <AppButtonNewContainer></AppButtonNewContainer>
                  </router-link>
                  <AppCard v-for="product in plan.products" :key="product.id">
                    <template #body>
                      <span class="tw-text-sm">{{ product.title }}</span>
                    </template>

                    <template #footer>
                      <div class="tw-flex tw-justify-between tw-items-center tw-gap-2">
                        <span>{{ product.cantContents }} contenidos</span>

                        <div class="tw-flex tw-gap-2">
                          <AppButtonEdit
                            :to="{
                              name: 'casurid.plansEdit',
                              params: { planId: product.id },
                              query: {
                                subjectId: plan.subjectId,
                                levelId,
                                degreeId,
                              },
                            }"
                          ></AppButtonEdit>
                          <AppButtonDelete @click="showModalDelete(product)"></AppButtonDelete>
                        </div>
                      </div>
                    </template>
                  </AppCard>
                </div>
              </template>
            </AppAccordionItem>
          </AppAccordion>
        </div>
      </div>

      <AppModal v-model="modalDelete" @close="modalDelete = false">
        <AppConfirmDeleteModel entity="Libro" @confirmDelete="deletePlan"></AppConfirmDeleteModel>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import AppCard from '../../../shared/components/Card/AppCard.vue';
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import { GetFiltersPlansService } from '../services/getFiltersPlans.service';
import { LevelsDegreeDto } from '../dtos/levelsDegree.dto';
import { GetPlansService, IGetPlansService } from '../services/getPlans.service';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import { useMeta } from 'vue-meta';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModel from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import { ProductDto } from '../dtos/product.dto';
import { DeletePlanService } from '../services/deletePlan.service';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersPlansService = new GetFiltersPlansService();
const getPlansService = new GetPlansService();
const deletePlanService = new DeletePlanService();

export default defineComponent({
  name: 'PlansPage',
  components: {
    AppConfirmDeleteModel,
    AppCard,
    AppModal,
    AppAccordion,
    AppAccordionItem,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonEdit,
    AppButtonNewContainer,
    AppLoading,
    AppBaseList,
  },
  setup() {
    const title = 'Libros';
    useMeta({
      title,
    });

    const routes = [
      {
        name: title,
      },
    ];

    const levelsDegrees: { value: LevelsDegreeDto[] } = reactive({
      value: [],
    });
    const degreeId = ref();
    const levelId = computed(() => {
      let levelId = 0;
      if (degreeId.value) {
        levelsDegrees.value.forEach((levelDegree) => {
          if (levelDegree.degreeId === degreeId.value) {
            levelId = levelDegree.levelId;
          }
        });
      }
      return levelId;
    });

    const loading = ref(true);
    const notFound = ref(false);
    const modalDelete = ref(false);
    const currentProduct: { value: any } = reactive({
      value: null,
    });

    const plans: { value: IGetPlansService[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      const response = await getFiltersPlansService.run();

      levelsDegrees.value = response.levelsDegrees;

      if (response.levelsDegrees.length) {
        degreeId.value = response.levelsDegrees[0].degreeId;
      }

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Casurid', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    });

    const getData = async () => {
      loading.value = true;
      try {
        plans.value = await getPlansService.run({
          levelId: levelId.value,
          degreeId: degreeId.value,
        });
        notFound.value = !plans.value.length;
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    };

    watch(degreeId, async () => {
      await getData();
    });

    const showModalDelete = async (product: ProductDto) => {
      currentProduct.value = product;
      modalDelete.value = true;
    };

    const deletePlan = async () => {
      try {
        await deletePlanService.run(currentProduct.value.id);
        modalDelete.value = false;
        await getData();
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      title,
      routes,
      levelsDegrees,
      degreeId,
      loading,
      plans,
      notFound,
      levelId,
      modalDelete,
      showModalDelete,
      deletePlan,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}

a {
  text-decoration: none;
}
</style>
