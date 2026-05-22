<template>
  <AppBaseList :title="t('Seguimiento de Avances')">
    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="progress-tracking">
        <!-- Header -->
        <div class="progress-tracking__welcome">
          <h2 class="progress-tracking__title">
            {{ t('Seguimiento de Avances') }}
          </h2>
          <p class="progress-tracking__subtitle">
            {{ t('Línea de tiempo con el progreso de entregas y capítulos') }}
          </p>
        </div>

        <!-- Summary cards -->
        <div class="progress-tracking__stats">
          <AppStatCard :label="t('Completados')" :value="`${data.summary.completed} / ${data.summary.totalChapters}`" :caption="t('Capítulos finalizados')" icon="check-circle" variant="white" />
          <AppStatCard :label="t('En Progreso')" :value="data.summary.inProgress" :caption="t('Capítulo actual')" icon="clock" variant="white" />
          <AppStatCard :label="t('Comentarios')" :value="data.summary.totalComments" :caption="t('Retroalimentación total')" icon="comment" variant="white" />
        </div>

        <!-- Project Timeline -->
        <AppCardDashboard class="progress-tracking__timeline-card">
          <template #title>
            <div class="timeline-header">
              <h3 class="timeline-header__title">
                {{ t('Línea de Tiempo del Proyecto') }}
              </h3>
              <p class="timeline-header__subtitle">
                {{ t('Haga clic en cada hito para ver detalles y comentarios') }}
              </p>
            </div>
          </template>
          <template #body>
            <TimelineList :items="data.chapters" :getDotIcon="getChapterIcon" :getDotVariant="getChapterVariant" :getLineVariant="getChapterLineVariant" :dotSize="40" :gap="20">
              <template #item="{ item }">
                <ChapterTimelineCard :chapter="item" @click="openChapterDetail" @upload="openUploadDrawer" />
              </template>
            </TimelineList>
          </template>
        </AppCardDashboard>
      </div>

      <!-- Chapter detail drawer -->
      <AppDrawer :isVisible="drawerVisible" @update:isVisible="drawerVisible = $event" size="lg">
        <template #head>
          <span class="drawer-title">{{ chapterDetail?.title ?? '' }}</span>
        </template>
        <template #body>
          <AppLoading v-if="drawerLoading" />
          <ChapterDetailDrawer v-else-if="chapterDetail" ref="detailDrawerRef" :detail="chapterDetail" @submit-reply="handleSubmitReply" />
        </template>
        <template #footer>
          <div v-if="chapterDetail && chapterDetail.status !== 'pending'" class="detail-footer">
            <AppButton :label="t('Enviar')" variant="primary" @click="triggerDetailSubmit" />
          </div>
        </template>
      </AppDrawer>

      <!-- Upload drawer -->
      <AppDrawer :isVisible="uploadDrawerVisible" @update:isVisible="uploadDrawerVisible = $event" size="lg">
        <template #head>
          <span class="drawer-title">{{ t('Subir Avance') }} - {{ uploadChapter?.title ?? '' }}</span>
        </template>
        <template #body>
          <ChapterUploadDrawer v-if="uploadChapter" ref="uploadDrawerRef" :chapter="uploadChapter" @submit="handleUploadSubmit" @cancel="uploadDrawerVisible = false" />
        </template>
        <template #footer>
          <div class="upload-footer">
            <AppButton :label="t('Enviar para Revisión')" variant="primary" icon="upload" @click="triggerUploadSubmit" />
            <AppButton :label="t('Cancelar')" variant="secondary" outlined @click="uploadDrawerVisible = false" />
          </div>
        </template>
      </AppDrawer>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';

// Shared components
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import TimelineList from '../../../shared/components/TimeLine/TimelineList.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';

import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';

// Module components
import ChapterTimelineCard from '../components/ChapterTimelineCard.vue';
import ChapterDetailDrawer from '../components/ChapterDetailDrawer.vue';
import ChapterUploadDrawer from '../components/ChapterUploadDrawer.vue';

// Service & types
import { trackingService } from '../services/tracking.service';
import type { TrackingData, ChapterTimeline, ChapterDetail, ChapterStatus } from '../dtos/tracking.dto';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import type { TimelineVariant } from '../../../shared/components/TimeLine/TimelineList.vue';

const iconMap: Record<ChapterStatus, string> = {
  completed: 'check-circle',
  in_review: 'exclamation-circle',
  in_progress: 'clock',
  pending: 'circle',
};

const variantMap: Record<ChapterStatus, TimelineVariant> = {
  completed: 'success',
  in_review: 'warning',
  in_progress: 'primary',
  pending: 'neutral',
};

export default defineComponent({
  name: 'ProgressTracking',
  components: {
    AppBaseList,
    AppLoading,
    AppCardDashboard,
    TimelineList,
    AppDrawer,
    AppStatCard,
    ChapterTimelineCard,
    ChapterDetailDrawer,
    ChapterUploadDrawer,
    AppButton,
  },
  setup() {
    const { t } = useI18n();
    useMeta({ title: 'Seguimiento de Avances' });

    const loading = ref(true);
    const data = ref<TrackingData>({
      summary: {
        completed: 0,
        totalChapters: 0,
        inProgress: 0,
        totalComments: 0,
      },
      chapters: [],
    });

    // Detail drawer
    const drawerVisible = ref(false);
    const drawerLoading = ref(false);
    const chapterDetail = ref<ChapterDetail | null>(null);
    const detailDrawerRef = ref<InstanceType<typeof ChapterDetailDrawer> | null>(null);

    // Upload drawer
    const uploadDrawerVisible = ref(false);
    const uploadChapter = ref<ChapterTimeline | null>(null);
    const uploadDrawerRef = ref<InstanceType<typeof ChapterUploadDrawer> | null>(null);

    // Timeline helpers
    const getChapterIcon = (item: ChapterTimeline) => iconMap[item.status] || 'circle';
    const getChapterVariant = (item: ChapterTimeline) => variantMap[item.status] || 'neutral';
    const getChapterLineVariant = (item: ChapterTimeline) => variantMap[item.status] || 'neutral';

    const openChapterDetail = async (chapter: ChapterTimeline) => {
      drawerVisible.value = true;
      drawerLoading.value = true;
      chapterDetail.value = null;

      const detail = await trackingService.getChapterDetail(chapter.id);
      chapterDetail.value = detail ?? null;
      drawerLoading.value = false;
    };

    const triggerDetailSubmit = () => {
      detailDrawerRef.value?.submitReply();
    };

    const openUploadDrawer = (chapter: ChapterTimeline) => {
      uploadChapter.value = chapter;
      uploadDrawerVisible.value = true;
    };

    const triggerUploadSubmit = () => {
      uploadDrawerRef.value?.handleSubmit();
    };

    const handleUploadSubmit = () => {
      // TODO: integrate with real upload service
      uploadDrawerVisible.value = false;
      uploadChapter.value = null;
    };

    const handleSubmitReply = ({ message }: { chapterId: number; message: string }) => {
      if (!chapterDetail.value) return;
      chapterDetail.value.comments.push({
        id: Date.now(),
        author: 'Juan Díaz',
        role: 'Estudiante',
        date: '13 de Marzo, 2026',
        time: new Date()
          .toLocaleTimeString('es', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
          .toUpperCase(),
        message: message,
      });
    };

    const loadData = async () => {
      loading.value = true;
      try {
        data.value = await trackingService.getTrackingData();
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Grados y títulos', url: '' };
      headerStorage.moduleItem = { name: 'Seguimiento de Avances', url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      loadData();
    });

    return {
      t,
      loading,
      data,
      drawerVisible,
      drawerLoading,
      chapterDetail,
      getChapterIcon,
      getChapterVariant,
      getChapterLineVariant,
      openChapterDetail,
      detailDrawerRef,
      triggerDetailSubmit,
      openUploadDrawer,
      uploadDrawerVisible,
      uploadChapter,
      uploadDrawerRef,
      triggerUploadSubmit,
      handleUploadSubmit,
      handleSubmitReply,
    };
  },
});
</script>

<style scoped>
.progress-tracking {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0;
}

.progress-tracking__welcome {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-tracking__title {
  font-family: 'Roboto', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.progress-tracking__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 0;
}

.progress-tracking__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .progress-tracking__stats {
    grid-template-columns: 1fr;
  }
}

.progress-tracking__timeline-card {
  width: 100%;
}

.timeline-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.timeline-header__title {
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.timeline-header__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  margin: 0;
}

.drawer-title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.detail-footer {
  display: flex;
  gap: 12px;
  align-items: center;
}

.upload-footer {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Force timeline cards to full width */
:deep(.timelineList) {
  width: 100%;
  padding-left: 16px;
}

:deep(.timelineList .row) {
  width: 100%;
}

:deep(.timelineList .row .content) {
  flex: 1;
  width: 100%;
}
</style>
