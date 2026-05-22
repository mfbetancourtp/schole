<template>
  <AppBaseList :title="title">
    <template #content>
      <input
        type="text"
        v-model="search"
        class="form-control"
        placeholder="Buscar un reporte"
        pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
        title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
      />

      <div class="list-group mt-2" v-for="(categoryReports, category) in groupedData" :key="category">
        <!-- {{groupedData  }} -->
        <div>
          <h6>{{ t(`reports.${category}`) }}:</h6>
        </div>
        <div class="list-group-item list-group-item-action py-3" v-for="(report, index) in categoryReports" :to="report.link" :key="index">
          <!-- {{ categoryReports }} -->
          <div>
            <div class="d-flex justify-content-between">
              <span> {{ index + 1 }}. {{ t(report.title) }} </span>
              <div class="icons">
                <AppButton class="childs-icons" size="lg" variant="primary" icon="file-alt" @click="goToReport(report.link)"></AppButton>
              </div>
            </div>
          </div>
        </div>
      </div>

    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, Ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { ReportsService } from '../../../shared/services/reports.service';
import { ItemMenuReportType } from '../../../shared/types/itemMenuReport.type';
import { GetInitDataService } from '../../../shared/services/getInitData.service';

import { debounce } from 'ts-debounce';
import { useMeta } from 'vue-meta';
import { initDataResolver } from '../../../shared/resolvers/initData.resolver';
import { init } from 'linkifyjs';
import { useHeaderStore } from '../../../stores/header.store';
import { report } from 'process';

const reportsService = new ReportsService();
const getInitDataService = new GetInitDataService();

export default defineComponent({
  name: 'ReportList',
  components: {
    AppBaseList,
    AppButton,
  },
  setup() {
    const { t } = useI18n();
    const title = 'core.menu.myReports';
    const router = useRouter();

    useMeta({ title: t(title) });

    const reports = ref<ItemMenuReportType[]>([]);
    const reportsFilter = ref<ItemMenuReportType[]>([]);
    const groupedData = ref<{ [key: string]: ItemMenuReportType[] }>({});
    const modalInformation: Ref<any> = ref(null);
    const data = ref();
    const initData = ref();
    const currentItemId = ref<number | null>(null);

    const search = ref('');

    onMounted(() => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Informes', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      reports.value = reportsService.get();
      console.log('reports.value', reports.value);

      reportsFilter.value = reports.value;
      initData.value = getInitDataService.run();

      updateGroupedData(reportsFilter.value);
    });

    const updateGroupedData = (reportsToGroup: ItemMenuReportType[]) => {
      groupedData.value = {}; // Resetear groupedData
      reportsToGroup.forEach((item) => {
        const codeParts = item.code.split('.');
        const groupKey = codeParts[1];

        if (!groupedData.value[groupKey]) {
          groupedData.value[groupKey] = [];
        }

        groupedData.value[groupKey].push(item);
      });
    };

    const searchReport = debounce((text: string) => {
      const textArray = text.split(' ');
      reportsFilter.value = reports.value.filter((item) =>
        textArray.every((el) => {
          const name = t(item.title).toLowerCase();

          return name.indexOf(el.toLowerCase()) > -1;
        })
      );
      updateGroupedData(reportsFilter.value);
    }, 500);

    watch(search, (value) => {
      searchReport(value);
    });
    const goToReport = (reportLink: string) => {
      router.push(reportLink);
      console.log('ir al reporte:', reportLink);
    };



    return {
      title,
      t,

      reportsFilter,
      groupedData,
      search,
      data,
      modalInformation,
      currentItemId,
      goToReport,
      initData,
    };
  },
});
</script>

<style scoped>
.form-control {
  height: 50px;
}

.icons {
  display: flex;
}

.icons .childs-icons:first-child {
  margin-right: 1px;
}

.icons .childs-icons:last-child {
  margin-left: 1px;
}
</style>
