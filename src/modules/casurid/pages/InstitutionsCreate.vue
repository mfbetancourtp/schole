<template>
  <InstitutionsForm :title="title" :routes="routes"></InstitutionsForm>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useMeta} from 'vue-meta';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import InstitutionsForm from '../components/institutionsForm.vue';
import { useHeaderStore } from '../../../stores/header.store';

export default defineComponent({
  name: 'InstitutionsCreate',
  components: {InstitutionsForm, AppButton, AppFormField, AppButtonBack, AppBaseList},

  setup() {
    const title = 'Nueva Institución';
    useMeta({
      title: title,
    });

    const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Institución', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
   

    const routes = [
      {
        name: 'Instituciones',
        url: {
          name: 'casurid.institutionsList',
        },
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

<style scoped>

</style>