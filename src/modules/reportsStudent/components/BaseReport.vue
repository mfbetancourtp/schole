<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="routeBack"></AppButtonBack>
    </template>
    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <form @submit.prevent="generate">
          <div>
            <slot></slot>

            <div v-if="showBtnGenerate" class="d-flex justify-content-center">
              <ButtonGenerate @selectFormat="generate"></ButtonGenerate>
            </div>

            <div class="mt-2" v-if="reportId">
              <ReportProgress :report-id="reportId"></ReportProgress>
            </div>
          </div>
        </form>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import ButtonGenerate from './ButtonGenerate.vue';
import ReportProgress from './ReportProgress.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { RouteRecordRaw } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';
import { useHeaderStore } from '../../../stores/header.store';
import AppLoading from '../../../shared/components/AppLoading.vue';

export default defineComponent({
  name: 'BaseReport',
  components: {
    ReportProgress,
    ButtonGenerate,
    AppButtonBack,
    AppBaseList,
    AppLoading,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    showBtnGenerate: {
      type: Boolean,
      default: true,
    },
    routes: {
      type: Array as PropType<BreadCrumbsType[]>,
      default: () => [],
    },
    service: {
      type: Object,
      required: true,
    },
    params: {
      type: Object,
    },
    routeBack: {
      type: Object as PropType<RouteRecordRaw>,
      default: () => ({
        name: 'reportsStudent',
      }),
    },
    v$: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const loading = ref(false);

    useMeta({
      title: t(props.title),
    });
    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Informes', url: '' };
    headerStorage.moduleItem = { name: 'Mis informes', url: '' };
    headerStorage.moduleSubItem = { name: props.title, url: '' };
    const reportId = ref(null);

    const generate = async (convertTo: string) => {
      loading.value = false;

      const isValid = await props.v$.$validate();

      if (!isValid) return;

      try {
        const response = await props.service.run({
          ...props.params,
          convertTo,
        });

        reportId.value = response.reportId;
        loading.value = false;
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      generate,
      reportId,
      loading,
    };
  },
});
</script>

<style scoped></style>
