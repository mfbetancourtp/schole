<template>
  <AppBaseList :title="title">
    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="grid-cards">
          <AppCard v-for="financingSystem in financingSystems.value" :key="financingSystem.id">
            <!-- nombre de la card principal -->
            <template #title>
              <div class="title-card">{{ financingSystem.name }}</div>
            </template>
            <template #body>
              <div class="content-card">{{ financingSystem.description }}</div>
            </template>

            <template #footer>
              <div class="buttons-card">
                <div class="button-left">
                  <AppButton icon="eye" v-tooltip="'core.view rubros'" @click="redirectView(financingSystem.id)"></AppButton>
                </div>
              </div>
            </template>
          </AppCard>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { useHeaderStore } from '../../../stores/header.store';

import { GetFinancingClassificationSystemService } from '../services/getFinancingClassificationSystems.service';
import { GetAllParentsTypesFinancingService } from '../services/getAllParentsTypesFinancing.service';

const getFinancingClassificationSystemService = new GetFinancingClassificationSystemService();
const getAllParentsTypesFinancingService = new GetAllParentsTypesFinancingService();

export default defineComponent({
  components: {
    AppButton,
    AppLoading,
    AppBaseList,
    AppCard,
  },
  name: 'systemsSourcesFinancingPage',
  setup() {
    const title = 'Rubros';
    const typeExpenseSource = ref();
    const routes = [
      {
        name: title,
      },
    ];

    useMeta({
      title,
    });
    const router = useRouter();
    const loading = ref(true);
    const financingSystems: { value: any } = reactive({ value: [] });

    onMounted(async () => {
      await getData();
      loading.value = false;
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Presupuesto', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    });

    const getData = async () => {
      try {
        financingSystems.value = await getFinancingClassificationSystemService.run();
      } catch (e) {
        console.error('error getData', e);
      }
    };

    const redirectView = async (systemId: number) => {
      try {
        const res = await getAllParentsTypesFinancingService.run(systemId);
        typeExpenseSource.value = res.find((item: any) => item.reference === 'RUBROS');

        await router.push({
          name: 'budget.typesFinancingSources',
          params: {
            financingSystemId: systemId,
          },
          query: {
            filterIds: [typeExpenseSource.value?.id].join(','), //filter
            allowEdit: 'false', //allowEdit.toString(),
          },
          state: {
            title: title,
          },
        });
      } catch (e) {
        console.error(e);
      }
    };

    return {
      title,
      routes,
      loading,
      financingSystems,
      redirectView,
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

.container-items {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 320px;
  min-width: 287px;
}

.container-new {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.buttons-card {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.button-righ {
  display: flex;
  justify-content: space-between;
}

.button-left {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.content-card {
  width: 100%;
  word-wrap: break-word;
}
</style>
