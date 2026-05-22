<template>
  <AppLoading v-if="loading" />

  <template v-else-if="!loading && parent">
    <StudentFormLiteParent :title="title" :parent="parent" />
  </template>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import { useHeaderStore } from '../../../stores/header.store';

import AppLoading from '../../../shared/components/AppLoading.vue';
import StudentFormLiteParent from '../components/StudentFormLiteParent.vue';

import { ParentDetailDto } from '../dto/parent.dto';

import { GetMatriculatesParentsByIdService } from '../services/getMatriculatesParentsById.service';

const getMatriculatesParentsByIdService = new GetMatriculatesParentsByIdService();

export default defineComponent({
  name: 'DetailMatriculateParentEdit',

  components: { AppLoading, StudentFormLiteParent },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = 'academicAdministration.parents.edit.title';

    const parentId = route.params.parentId;

    useMeta({ title: t(title) });
    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'core.menu.courseAdministration', url: '' };
    headerStorage.moduleItem = {
      name: 'academicAdministration.matriculates.editPage.title',
      url: '',
    };
    headerStorage.moduleSubItem = { name: title, url: '' };

    const parent: Ref<ParentDetailDto | null> = ref(null);

    const loading = ref(true);

    onMounted(async () => {
      try {
        parent.value = await getMatriculatesParentsByIdService.run(parentId);
      } catch (e) {
        console.log('err', e);
      }

      loading.value = false;
    });

    return {
      loading,
      title,

      parent,
    };
  },
});
</script>
