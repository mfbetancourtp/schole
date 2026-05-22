<template>
  <AppLoading v-if="loading"></AppLoading>
  <InstitutionalTimelineForm v-else :title="title" :routes="routes" :institutionalActivityId="institutionalActivityId"></InstitutionalTimelineForm>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import InstitutionalTimelineForm from '../components/InstitutionalTimelineForm.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';


export default defineComponent({
  name: 'InstitutionalTimelineEdit',
  components: { InstitutionalTimelineForm, AppLoading },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = `${t('core.edit')} Actividad institucional`;

    useMeta({ title: title });

    const routes: BreadCrumbsType[] = [
      {
        name: 'Cronograma institucional',
        url: { name: 'institutionalEvents.institutionalTimeline' },
      },
      {
        name: title,
      },
    ];

    const institutionalActivityId: Ref<any> = ref(null);

    const loading = ref(true);

    onMounted(async () => {
      try {
        institutionalActivityId.value = parseInt(route.params.institutionalActivityId.toString(), 10);
        console.log('id',institutionalActivityId.value);
        
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    return {
      loading,
      routes,
      title,
      institutionalActivityId,
    };
  },
});
</script>

<style scoped></style>
