<template>
  <CustomFormsForm :title="title" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'vue-meta';

import { useHeaderStore } from '../../../stores/header.store';

import CustomFormsForm from '../components/CustomFormsForm.vue';

export default defineComponent({
  name: 'CustomFormCreate',
  components: { CustomFormsForm },

  setup() {
    const title = 'Nuevo formulario personalizado';

    useMeta({ title });

    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Formularios', url: '' };
    headerStorage.moduleItem = { name: 'Formularios personalizados', url: '' };
    headerStorage.moduleSubItem = { name: title, url: '' };

    return { title };
  },
});
</script>
