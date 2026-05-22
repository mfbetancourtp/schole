<template>
  <CollectionStepForm 
    :title="title" :routes="routes"
  ></CollectionStepForm>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import CollectionStepForm from '../components/CollectionStepForm.vue';

export default defineComponent({
  name: 'CreateCollectionSteps',
  components: {CollectionStepForm},

  setup() {
    const { t } = useI18n();

    const title = 'collections.collectionSteps.create.title';
    useMeta({ title: t(title) });

    const routes = [
      {
        name: 'collections.collectionSteps.name',
        url: {
          name: 'collections.collectionStepsList',
        },
      },
      {
        name: title
      },
    ];

    return {
      title,
      routes,
    };
  },
});
</script>

<style scoped>

</style>