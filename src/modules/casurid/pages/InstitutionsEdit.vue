<template>
  <AppLoading v-if="loading"></AppLoading>

  <template v-else-if="!loading && data">
    <InstitutionsForm :title="title" :routes="routes" :data="data"></InstitutionsForm>
  </template>
</template>

<script lang="ts">
import { Ref, defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import InstitutionsForm from '../components/institutionsForm.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { GetInstitutionByIdService } from '../services/getInstitutionById.service';
import { useHeaderStore } from '../../../stores/header.store';

const getInstitutionByIdService = new GetInstitutionByIdService();

export default defineComponent({
  name: 'InstitutionsEdit',
  components: { InstitutionsForm, AppLoading },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = 'Editar Institución';
    const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Institución', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    useMeta({ title: t(title) });
    const routes = [
      {
        name: 'Institución',
        url: { name: 'casurid.institutionsList' },
      },
      {
        name: title,
      },
    ];

    const data: Ref<any> = ref(null);

    const loading = ref(true);

    onMounted(async () => {
      try {
        const institutionId = route.params.institutionId as string;

        data.value = await getInstitutionByIdService.run(institutionId);
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    return {
      loading,
      routes,
      title,

      data,
    };
  },
});
</script>
