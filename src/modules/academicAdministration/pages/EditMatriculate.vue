<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButtonBack :to="{ name: 'academicAdministration.enrolledByCourse' }" />
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <template v-else>
        <StudentFormFull :data="data" />
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import { useHeaderStore } from '../../../stores/header.store';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import StudentFormFull from '../components/StudentFormFull.vue';

import { MatriculateDetailDto } from '../dto/matriculate.dto';

import { GetMatriculatesByIdService } from '../services/getMatriculatesById.service';

export default defineComponent({
  name: 'EditMatriculate',
  components: {
    AppLoading,
    AppBaseList,
    AppButtonBack,

    StudentFormFull,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = 'Editar Matrícula';

    const getMatriculatesByIdService = new GetMatriculatesByIdService();

    useMeta({ title: t(title) });
    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Administración académica', url: '' };
    headerStorage.moduleItem = { name: 'Administración de cursos', url: '' };
    headerStorage.moduleSubItem = { name: title, url: '' };

    const loading = ref(true);

    const data = ref<MatriculateDetailDto | null>(null);

    onMounted(async () => {
      try {
        loading.value = true;

        const currentMatriculateId = parseInt(route.params.matriculateId as string);
        data.value = await getMatriculatesByIdService.run(currentMatriculateId);
      } catch (error) {
        console.log('error', error);
        loading.value = false;
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
