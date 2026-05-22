<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack
        :to="{
          name: 'budget.standardizedAccountingSystem',
        }"
      ></AppButtonBack>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div>
          <DownloadAndUploadTemplate :keyService="'financingSystems'"> </DownloadAndUploadTemplate>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { defineComponent, onMounted, ref } from 'vue';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { useHeaderStore } from '../../../stores/header.store';
import DownloadAndUploadTemplate from '../../academicPlanning/components/DownloadAndUploadTemplate.vue';

export default defineComponent({
  name: 'ImportTemplateAcademicOffer',
  components: {
    DownloadAndUploadTemplate,
    AppButtonBack,
    AppBaseList,
    AppLoading,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Importar datos plantilla de Sistemas de clasificación de financiación';
    const routes: any[] = [{ name: title }];
    useMeta({
      title: 'Importar plantilla de Sistemas de clasificación de financiación',
    });
    const standardizedAccountingSystemId = ref();
    const loading = ref(true);

    const route = useRoute();

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Presupuesto', url: '' };
        headerStorage.moduleItem = {
          name: 'Sistemas de clasificación de financiación',
          url: '',
        };
        headerStorage.moduleSubItem = { name: title, url: '' };

        standardizedAccountingSystemId.value = parseInt(route.params.standardizedAccountingSystemId.toString(), 10);
        console.log('standardizedAccountingSystemId.value', standardizedAccountingSystemId.value);
        localStorage.setItem('standardizedAccountingSystemId', String(standardizedAccountingSystemId.value));
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    return {
      loading,
      routes,
      title,
      t,

      standardizedAccountingSystemId,
    };
  },
});
</script>

<style scoped></style>
