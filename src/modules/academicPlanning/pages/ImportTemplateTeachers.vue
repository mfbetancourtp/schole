<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{
        name: 'academicPlanning.menuImportAcademicPeriod',
        params: { academicPeriodId: academicPeriodId },
      }"></AppButtonBack>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div>
          <DownloadAndUploadTemplate :keyService="'teacher'"></DownloadAndUploadTemplate>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { defineComponent, onMounted, ref } from 'vue';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import DownloadAndUploadTemplate from '../components/DownloadAndUploadTemplate.vue';

import { GetAcademicPeriodsWithPeriodsService } from '../services/getAcademicPeriodsWithPeriods.service';
import { useHeaderStore } from '../../../stores/header.store';

const getAcademicPeriodsWithPeriodsService = new GetAcademicPeriodsWithPeriodsService();

export default defineComponent({
  name: 'ImportTemplateTeachers',
  components: {
    DownloadAndUploadTemplate,
    AppButtonBack,
    AppBaseList,
    AppLoading,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Importar datos desde una plantilla de docentes';
    const routes: any[] = [{ name: title }];
    useMeta({ title: 'Importar plantilla docentes' });

    const academicPeriodId = ref();
    const loading = ref(true);
    const route = useRoute();

    onMounted(async () => {
      try {
        academicPeriodId.value = parseInt(route.params.academicPeriodId.toString(), 10);
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Planeación académica', url: '' };
        headerStorage.moduleItem = { name: 'Año Académico', url: '' };
        headerStorage.moduleSubItem = { name: title, url: '' };
        await loadRoutes();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const loadRoutes = async () => {
      try {
        const academicPeriodsWithPeriods: any = await getAcademicPeriodsWithPeriodsService.run();
        let nameRoute: string = '';

        academicPeriodsWithPeriods.academicPeriods.forEach((academicPeriod: any) => {
          if (academicPeriodId.value == academicPeriod.id) {
            nameRoute = `Importar información a "${academicPeriod.name}"`;
          }
        });

        routes.unshift(
          {
            name: `Ciclos académicos`,
            url: { name: 'academicPlanning.academicPeriods' },
          },
          {
            name: nameRoute,
            url: {
              name: 'academicPlanning.menuImportAcademicPeriod',
              params: { academicPeriodId: academicPeriodId.value },
            },
          }
        );
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      routes,
      title,
      t,

      academicPeriodId,
    };
  },
});
</script>

<style scoped></style>
