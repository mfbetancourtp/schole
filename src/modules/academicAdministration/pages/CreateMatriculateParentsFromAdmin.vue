<template>
  <MatriculateParentsFormFromAdmin :title="title" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import { useHeaderStore } from '../../../stores/header.store';

import MatriculateParentsFormFromAdmin from '../components/MatriculateParentsFormFromAdmin.vue';

export default defineComponent({
  name: 'CreateMatriculateParentsFromAdmin',

  components: { MatriculateParentsFormFromAdmin },

  setup() {
    const { t } = useI18n();
    const title = 'Nuevo Acudiente';

    useMeta({ title: t(title) });
    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'core.menu.courseAdministration', url: '' };
    headerStorage.moduleItem = {
      name: 'academicAdministration.matriculates.editPage.title',
      url: '',
    };
    headerStorage.moduleSubItem = { name: title, url: '' };

    return { title };
  },
});
</script>
