<template>
  <ConfigureEvaluationsForm :title="title" :routes="routes"></ConfigureEvaluationsForm>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import ConfigureEvaluationsForm from '../components/ConfigureEvaluationsForm.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

export default defineComponent({
  name: 'CreateConfigureEvaluation',
  components: { ConfigureEvaluationsForm },

  setup() {
    const { t } = useI18n();
    const title = `${t('core.newFemale')} ${t('competenceEvaluation.configureEvaluations.singular')}`;

    useMeta({ title: title });

    const routes: BreadCrumbsType[] = [
      {
        name: 'competenceEvaluation.configureEvaluations.title',
        url: { name: 'competenceEvaluation.configureEvaluations' },
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
