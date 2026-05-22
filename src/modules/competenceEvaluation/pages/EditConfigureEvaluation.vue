<template>
  <AppLoading v-if="loading"></AppLoading>
  <ConfigureEvaluationsForm v-else :title="title" :routes="routes" :data="data"></ConfigureEvaluationsForm>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import ConfigureEvaluationsForm from '../components/ConfigureEvaluationsForm.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetCorporateEvaluationPeriodByIdService } from '../services/getCorporateEvaluationPeriodById.service';

const getCorporateEvaluationPeriodByIdService = new GetCorporateEvaluationPeriodByIdService();

export default defineComponent({
  name: 'EditConfigureEvaluation',
  components: { ConfigureEvaluationsForm },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = `${t('core.edit')} ${t('competenceEvaluation.configureEvaluations.singular')}`;

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

    const loading = ref(true);
    const data = ref();

    onMounted(async () => {
      try {
        const corporateEvaluationPeriodId = parseInt(route.params.corporateEvaluationPeriodId.toString(), 10);

        data.value = await getCorporateEvaluationPeriodByIdService.run(corporateEvaluationPeriodId);
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

<style scoped></style>
