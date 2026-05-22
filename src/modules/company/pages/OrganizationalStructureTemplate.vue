<template>
  <AppBaseList :title="title" isCard>
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'company.organizationalStructure' }"></AppButtonBack>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <template v-else>
        <AppCard>
          <template #body> </template>
        </AppCard>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import { useHeaderStore } from '../../../stores/header.store';

export default defineComponent({
  name: 'OrganizationalStructureTemplate',

  components: {
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppCard,
  },
  setup() {
    const { t } = useI18n();
    const title = 'Plantillas de estructura organizacional';

    useMeta({ title: t(title) });

    const routes = [
      {
        name: 'Estructura organizacional',
        url: { name: 'company.organizationalStructure' },
      },
      {
        name: title,
      },
    ];

    const loading = ref(true);

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Empresa', url: '' };
      headerStorage.moduleItem = { name: 'Estructura organizacional', url: '' };
      headerStorage.moduleSubItem = { name: title, url: '' };
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
