<template>
  <AppBaseList :title="title" :routes="routes">
    <template v-slot:content>
      <AppLoading v-if="loading" />

      <template v-else-if="data">
        <!-- Top Actions Bar -->
        <div class="qr-page__topbar">
          <!-- <button class="qr-page__back" @click="goBack">
            <AppIcon icon="arrow-left" />
          </button> -->
          <div class="qr-page__topbar-actions">
            <button class="qr-page__btn qr-page__btn--outline" @click="handlePrint">
              <AppIcon icon="print" />
              Imprimir
            </button>
            <button class="qr-page__btn qr-page__btn--green" @click="handleRegenerate">
              <AppIcon icon="sync-alt" />
              Regenerar QR
            </button>
          </div>
        </div>

        <!-- Main Layout -->
        <div class="qr-page__layout">
          <QRDetailSidebar :data="data" @download-png="handleDownloadPng" @download-pdf="handleDownloadPdf" />
          <QRDetailTeacherInfo :data="data" />
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRouter } from 'vue-router';
import { useHeaderStore } from '../../../stores/header.store';

// Shared Components
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

// Module Components
import QRDetailSidebar from '../components/QRDetailSidebar.vue';
import QRDetailTeacherInfo from '../components/QRDetailTeacherInfo.vue';

// DTOs & Services
import { TeacherQRDetailDto } from '../dtos/teacherQRDetail.dto';
import { GetTeacherQRDetailMockService } from '../services/getTeacherQRDetail.mock';

const qrService = new GetTeacherQRDetailMockService();

export default defineComponent({
  name: 'TeacherQRDetailPage',

  components: {
    AppBaseList,
    AppLoading,
    AppIcon,
    QRDetailSidebar,
    QRDetailTeacherInfo,
  },

  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const title = 'Mi Código QR';

    useMeta({ title: t(title) });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Gestión Docente', url: '' };
    headerStore.moduleItem = { name: title, url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const routes = [{ name: 'Dashboard General', url: '/teachingManagement/dashboard' }, { name: title }];
    const loading = ref(true);
    const data: Ref<TeacherQRDetailDto | null> = ref(null);

    const loadData = async () => {
      loading.value = true;
      try {
        data.value = await qrService.getQRDetail();
      } catch (error) {
        console.error('Error loading QR detail:', error);
      }
      loading.value = false;
    };

    const goBack = () => {
      router.push({ name: 'teachingManagement.dashboard' });
    };

    const handlePrint = () => {
      window.print();
    };

    const handleRegenerate = () => {
      console.log('Regenerar QR clicked');
    };

    const handleDownloadPng = () => {
      console.log('Download PNG clicked');
    };

    const handleDownloadPdf = () => {
      console.log('Download PDF clicked');
    };

    onMounted(() => {
      loadData();
    });

    return {
      title,
      routes,
      loading,
      data,
      goBack,
      handlePrint,
      handleRegenerate,
      handleDownloadPng,
      handleDownloadPdf,
    };
  },
});
</script>

<style scoped>
/* Top Bar */
.qr-page__topbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 24px;
}

.qr-page__back {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}
.qr-page__back:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.qr-page__topbar-actions {
  display: flex;
  gap: 10px;
}

.qr-page__btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.qr-page__btn--outline {
  background: #ffffff;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.qr-page__btn--outline:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.qr-page__btn--green {
  background: #22c55e;
  color: #ffffff;
}
.qr-page__btn--green:hover {
  background: #16a34a;
}

/* Layout */
.qr-page__layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  align-items: start;
}

@media (max-width: 900px) {
  .qr-page__layout {
    grid-template-columns: 1fr;
  }
  .qr-page__topbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  .qr-page__topbar-actions {
    justify-content: flex-end;
  }
}
</style>
