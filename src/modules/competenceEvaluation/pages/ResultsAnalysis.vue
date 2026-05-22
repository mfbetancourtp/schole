<template>
  <AppBaseList :title="title" isCard>
    <template v-slot:actions>
      <AppButton style="color: white;" label="core.newMale"></AppButton>
      <!-- :to="{ name: 'disciplinaryControl.disciplinaryOffenses.create' }" -->
    </template>

    <template v-slot:content>
      <h1>Soon the interface will have something</h1>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { useHeaderStore } from '../../../stores/header.store';

export default defineComponent({
  name: 'ResultsAnalysis',
  components: {
    AppBaseList,
    AppButton,
  },

  setup() {
    const { t } = useI18n();
    const title = 'competenceEvaluation.resultsAnalysis.title';

    useMeta({ title: t(title) });

    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Evaluación de Desempeño', url: '' };
    headerStorage.moduleItem = { name: title, url: '' };
    headerStorage.moduleSubItem = { name: '', url: '' };

    const routes = [{ name: title }];

    return {
      routes,
      title,
      t,
    };
  },
});
</script>

<style scoped></style>
