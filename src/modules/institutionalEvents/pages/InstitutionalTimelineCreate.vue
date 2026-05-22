<template>
  <InstitutionalTimelineForm :title="title" :routes="routes"></InstitutionalTimelineForm>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import InstitutionalTimelineForm from '../components/InstitutionalTimelineForm.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

export default defineComponent({
  name: 'InstitutionalTimelineCreate',
  components: { InstitutionalTimelineForm },

  setup() {
    const { t } = useI18n();
    const title = `${t('core.new')} Evento institucional`;

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

    return {
      title,
      routes,
    };
  },
});
</script>

<style scoped></style>
