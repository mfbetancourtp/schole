<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack
        :to="{
          name: 'budget.suppliers',
        }"
      ></AppButtonBack>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div>
          <DownloadAndUploadTemplate :keyService="'suppliers'"> </DownloadAndUploadTemplate>
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
  name: 'ImportSuppliers',
  components: {
    DownloadAndUploadTemplate,
    AppButtonBack,
    AppBaseList,
    AppLoading,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Importar datos plantilla de proveedores';
    const routes: any[] = [{ name: title }];
    useMeta({
      title: 'Importar plantilla de proveedores',
    });
    const loading = ref(true);

    const route = useRoute();

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Presupuesto', url: '' };
        headerStorage.moduleItem = {
          name: 'Proveedores',
          url: '',
        };
        headerStorage.moduleSubItem = { name: title, url: '' };

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

    };
  },
});
</script>

<style scoped></style>
