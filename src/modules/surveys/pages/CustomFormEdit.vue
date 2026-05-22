<template>
  <AppLoading v-if="loading" />

  <template v-else>
    <CustomFormsForm :title="title" :data="data" />
  </template>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';

import { useHeaderStore } from '../../../stores/header.store';

import AppLoading from '../../../shared/components/AppLoading.vue';

import CustomFormsForm from '../components/CustomFormsForm.vue';

import { CustomFormDto } from '../dtos/customForm.dto';

import { GetCustomFormByIdService } from '../services/getCustomFormById.service';

export default defineComponent({
  name: 'CustomFormEdit',
  components: {
    AppLoading,

    CustomFormsForm,
  },

  setup() {
    const route = useRoute();
    const title = 'Editar formulario personalizado';

    const getCustomFormByIdService = new GetCustomFormByIdService();

    useMeta({ title });

    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Formularios', url: '' };
    headerStorage.moduleItem = { name: 'Formularios personalizados', url: '' };
    headerStorage.moduleSubItem = { name: title, url: '' };

    const data = ref<CustomFormDto | null>(null);

    const loading = ref(true);

    onMounted(async () => {
      try {
        const formId = Number(route.params.formId);
        if (isNaN(formId)) throw new Error('ID inválido');

        const result = await getCustomFormByIdService.run(formId);
        data.value = result;
      } catch (err) {
        console.error('Error al cargar el formulario:', err);
      } finally {
        loading.value = false;
      }
    });

    return {
      title,

      loading,

      data,
    };
  },
});
</script>
