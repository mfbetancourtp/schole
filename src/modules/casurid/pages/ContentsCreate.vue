<template>
  <ContentsForm :title="title" :routes="routes"></ContentsForm>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import ContentsForm from '../components/ContentsForm.vue';

export default defineComponent({
  name: 'ContentsCreate',
  components: {ContentsForm, AppButton, AppFormField, AppButtonBack, AppBaseList},
  setup() {
    const title = 'Nuevo contenido';

    const routes = [
      {
        name: 'Contenidos',
        url: {
          name: 'casurid.contentsList',
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