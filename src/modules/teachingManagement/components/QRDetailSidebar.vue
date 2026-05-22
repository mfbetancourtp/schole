<template>
  <div class="sidebar">
    <div class="sidebar__card">
      <div class="sidebar__header">
        <span class="sidebar__title">Código QR</span>
        <span class="sidebar__check">
          <AppIcon icon="check-circle" />
        </span>
      </div>

      <div class="sidebar__qr-container">
        <img v-if="qrImageUrl" :src="qrImageUrl" alt="Código QR" class="sidebar__qr-image" />

        <div v-else class="sidebar__qr-empty">No hay código QR disponible</div>
      </div>

      <div class="sidebar__status">
        <span class="sidebar__status-dot"></span>
        <span class="sidebar__status-text">{{ qrStatus }}</span>
      </div>

      <div class="sidebar__actions">
        <button class="sidebar__btn sidebar__btn--png" type="button" @click="handleDownloadPng" :disabled="!qrImageUrl">
          <AppIcon icon="download" />
          Descargar PNG
        </button>

        <button class="sidebar__btn sidebar__btn--pdf" type="button" @click="handleDownloadPdf" :disabled="!qrImageUrl">
          <AppIcon icon="file-pdf" />
          Descargar PDF (Carné)
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import QRCode from 'qrcode';
import AppIcon from '../../../shared/components/AppIcon.vue';

interface UserPeople {
  id?: number | string;
  identification?: string;
  firstName?: string;
  secondName?: string;
  firstLastname?: string;
  secondLastname?: string;
  names?: string;
  lastnames?: string;
  institutionId?: number | string;
  userId?: number | string;
  [key: string]: any;
}

interface UserLocalStorage {
  id?: number | string;
  userToken?: string;
  avatar?: string | null;
  people?: UserPeople;
  [key: string]: any;
}

export default defineComponent({
  name: 'SidebarQrCard',
  components: {
    AppIcon,
  },
  emits: ['downloadPng', 'downloadPdf'],
  setup(_, { emit }) {
    const qrImageUrl = ref<string>('');
    const qrPayload = ref<string>('');

    const qrStatus = computed(() => {
      return qrImageUrl.value ? 'Activo y disponible' : 'No disponible';
    });

    const generateQR = async () => {
      const raw = localStorage.getItem('user');

      console.log('============================');
      console.log('RAW localStorage user:', raw);

      if (!raw) {
        console.warn('No existe "user" en localStorage');
        qrImageUrl.value = '';
        qrPayload.value = '';
        return;
      }

      try {
        const user: UserLocalStorage = JSON.parse(raw);

        console.log('Usuario parseado:', user);
        console.log('People parseado:', user.people);

        const userData = {
          id: user.id ?? null,
          peopleId: user.people?.id ?? null,
          institutionId: user.people?.institutionId ?? null,
          userId: user.people?.userId ?? null,
          names: user.people?.names ?? '',
          lastnames: user.people?.lastnames ?? '',
          firstName: user.people?.firstName ?? '',
          secondName: user.people?.secondName ?? '',
          firstLastname: user.people?.firstLastname ?? '',
          secondLastname: user.people?.secondLastname ?? '',
          identification: String(user.people?.identification) ?? '',
        };

        console.log('Data que se enviará dentro del QR:', userData);

        const payload = JSON.stringify(userData);
        qrPayload.value = payload;

        console.log('Payload final del QR:', payload);

        qrImageUrl.value = await QRCode.toDataURL(payload, {
          width: 220,
          margin: 0,
          errorCorrectionLevel: 'L',
        });

        console.log('QR generado correctamente');
        console.log('============================');
      } catch (error) {
        console.error('Error generando QR:', error);
        qrImageUrl.value = '';
        qrPayload.value = '';
      }
    };

    const downloadBase64File = (base64Url: string, fileName: string) => {
      const link = document.createElement('a');
      link.href = base64Url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleDownloadPng = () => {
      if (!qrImageUrl.value) return;

      console.log('Descargando PNG');
      console.log('Payload QR:', qrPayload.value);

      downloadBase64File(qrImageUrl.value, 'codigo-qr-docente.png');
      emit('downloadPng', qrImageUrl.value);
    };

    const handleDownloadPdf = () => {
      if (!qrImageUrl.value) return;

      console.log('Descargando PDF');
      console.log('Payload QR:', qrPayload.value);

      emit('downloadPdf', qrImageUrl.value);
    };

    onMounted(() => {
      generateQR();
    });

    return {
      qrImageUrl,
      qrPayload,
      qrStatus,
      generateQR,
      handleDownloadPng,
      handleDownloadPdf,
    };
  },
});
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
}

.sidebar__card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
}

.sidebar__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.sidebar__title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.sidebar__check {
  color: #22c55e;
  font-size: 1rem;
}

.sidebar__qr-container {
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  min-height: 220px;
}

.sidebar__qr-image {
  width: 180px;
  height: 180px;
  object-fit: contain;
  border-radius: 8px;
}

.sidebar__qr-empty {
  font-size: 0.9rem;
  color: #64748b;
  text-align: center;
}

.sidebar__status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding-left: 4px;
}

.sidebar__status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
}

.sidebar__status-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: #22c55e;
}

.sidebar__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.sidebar__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sidebar__btn--png {
  background: #3b82f6;
  color: #ffffff;
}

.sidebar__btn--png:hover:not(:disabled) {
  background: #2563eb;
}

.sidebar__btn--pdf {
  background: #f97316;
  color: #ffffff;
}

.sidebar__btn--pdf:hover:not(:disabled) {
  background: #ea580c;
}
</style>
