<template>
  <StudentFormLiteParent :title="title" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import { useHeaderStore } from '../../../stores/header.store';

import StudentFormLiteParent from '../components/StudentFormLiteParent.vue';

export default defineComponent({
  name: 'DetailMatriculateParentCreate',

  components: { StudentFormLiteParent },

  setup() {
    const { t } = useI18n();
    const title = 'academicAdministration.parents.create.title';

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
