<template>
  <AppDrawer :isVisible="isVisible" size="lg" @update:isVisible="$emit('update:isVisible', $event)">
    <template #head>
      <AppDrawerHeader variant="view" icon="file-alt" :title="studentName" :subtitle="scholarshipName" />
    </template>

    <template #body>
      <!-- Loading -->
      <div v-if="isLoading" class="ar-loading">
        <AppIcon icon="circle-notch" class="ar-loading__icon" />
        Cargando detalle...
      </div>

      <div v-else class="ar-body">
        <!-- Status badge -->
        <div class="ar-status-row">
          <span
            v-if="currentStatusName"
            class="ar-status-badge"
            :style="{
              background: `${currentStatusColor}18`,
              color: currentStatusColor,
              borderColor: currentStatusColor,
            }"
          >
            {{ currentStatusName }}
          </span>
          <span v-if="detail?.progress" class="ar-progress-text">
            {{ detail.progress.approved }}/{{ detail.progress.total }}
            documentos aprobados
          </span>
        </div>

        <!-- Resumen -->
        <div class="ar-section">
          <p class="ar-section__title">RESUMEN</p>
          <div class="ar-summary-grid">
            <div class="ar-summary-card">
              <p class="ar-summary-card__label">Porcentaje de Beca</p>
              <p class="ar-summary-card__value">{{ detail?.scholarshipSettings?.percentage ?? '—' }}%</p>
            </div>
            <div class="ar-summary-card">
              <p class="ar-summary-card__label">Tipo</p>
              <p class="ar-summary-card__value">
                {{ detail?.scholarshipSettings?.typeScholarship?.name ?? '—' }}
              </p>
            </div>
            <div v-if="detail?.progress" class="ar-summary-card ar-summary-card--wide">
              <p class="ar-summary-card__label">Progreso</p>
              <div class="ar-progress-bar">
                <div class="ar-progress-bar__fill" :style="{ width: `${detail.progress.percentage}%` }"></div>
              </div>
              <p class="ar-progress-bar__label">{{ detail.progress.percentage }}% completado</p>
            </div>
            <div class="ar-summary-card ar-summary-card--wide">
              <p class="ar-summary-card__label">Carta de Motivación</p>
              <p class="ar-summary-card__value ar-summary-card__value--motivation">
                {{ detail?.motivation || 'Sin motivación registrada.' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Validación de Documentos -->
        <div class="ar-section">
          <p class="ar-section__title">DOCUMENTOS ADJUNTOS</p>

          <p v-if="!localDocs.length" class="ar-empty">Sin documentos adjuntos.</p>

          <div v-for="doc in localDocs" :key="doc.id" class="ar-doc-card" :class="{ 'ar-doc-card--rejecting': doc.showRejectInput }">
            <div class="ar-doc-card__main">
              <AppIcon icon="file-alt" class="ar-doc-card__icon" />
              <div class="ar-doc-card__info">
                <span class="ar-doc-card__name">{{ doc.name }}</span>
                <span class="ar-doc-card__date">{{ doc.date }}</span>
              </div>
              <div class="ar-doc-card__actions">
                <a v-if="doc.fileUrl" :href="doc.fileUrl" target="_blank" class="ar-doc-btn ar-doc-btn--view">
                  <AppIcon icon="eye" class="ar-doc-btn__icon" />
                </a>
                <button
                  type="button"
                  class="ar-doc-btn ar-doc-btn--approve"
                  :class="{
                    'ar-doc-btn--active': doc.pendingStatus === 'Aprobado',
                  }"
                  :disabled="doc.saving || doc.showRejectInput"
                  @click="setDocStatus(doc, 'Aprobado')"
                >
                  <AppIcon icon="check-circle" class="ar-doc-btn__icon" />
                  Aprobar
                </button>
                <button
                  type="button"
                  class="ar-doc-btn ar-doc-btn--reject"
                  :class="{
                    'ar-doc-btn--active-red': doc.pendingStatus === 'Rechazado',
                  }"
                  :disabled="doc.saving"
                  @click="onRejectClick(doc)"
                >
                  <AppIcon icon="times-circle" class="ar-doc-btn__icon" />
                  Rechazar
                </button>
                <AppIcon v-if="doc.saving" icon="circle-notch" class="ar-doc-saving" />
              </div>
            </div>

            <!-- Inline reject comment -->
            <div v-if="doc.showRejectInput" class="ar-reject-input">
              <label class="ar-reject-input__label">Motivo del rechazo <span class="ar-reject-input__required">*</span></label>
              <textarea v-model="doc.rejectComment" class="ar-reject-input__textarea" rows="2" placeholder="Describe el motivo del rechazo..." :disabled="doc.saving" />
              <div class="ar-reject-input__actions">
                <button type="button" class="ar-doc-btn ar-doc-btn--cancel-reject" :disabled="doc.saving" @click="onCancelReject(doc)">Cancelar</button>
                <button type="button" class="ar-doc-btn ar-doc-btn--confirm-reject" :disabled="doc.saving" @click="onConfirmReject(doc)">
                  <AppIcon v-if="doc.saving" icon="circle-notch" class="ar-doc-saving ar-doc-saving--inline" />
                  <AppIcon v-else icon="times-circle" class="ar-doc-btn__icon" />
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Historial -->
        <div class="ar-section">
          <p class="ar-section__title">HISTORIAL DE ESTADOS</p>
          <p v-if="!logs.length" class="ar-empty">Sin historial registrado.</p>
          <TimelineList v-else :items="logs" :dotSize="20" :gap="12" :getDotVariant="() => 'primary'" :getLineVariant="() => 'primary'">
            <template #item="{ item }">
              <div class="ar-history-item">
                <div class="ar-history-item__row">
                  <span class="ar-history-item__title">{{ item.title }}</span>
                  <span class="ar-history-item__date">
                    <AppIcon icon="calendar" class="ar-history-item__date-icon" />
                    {{ item.date }}
                  </span>
                </div>
                <p v-if="item.author" class="ar-history-item__author">
                  <AppIcon icon="user-circle" class="ar-history-item__author-icon" />
                  {{ item.author }}
                </p>
              </div>
            </template>
          </TimelineList>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch, reactive } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import TimelineList from '../../../shared/components/TimeLine/TimelineList.vue';
import { ToastService } from '../../../shared/services/toast.service';
import { useUserStore } from '../../../stores/user';
import { GetScholarshipApplicationAdminByIdService } from '../services/getScholarshipApplicationAdminById.service';
import { GetScholarshipApplicationLogsService } from '../services/getScholarshipApplicationLogs.service';
import { ReviewScholarshipDocumentService } from '../services/reviewScholarshipDocument.service';
import type { AdminApplicationListItemDto, AdminApplicationDetailDto, ApplicationLogEntryDto } from '../dtos/adminApplications.dto';

const detailService = new GetScholarshipApplicationAdminByIdService();
const logsService = new GetScholarshipApplicationLogsService();
const reviewService = new ReviewScholarshipDocumentService();
const toast = new ToastService();

interface LocalDoc {
  id: number;
  name: string;
  date: string;
  fileUrl?: string;
  pendingStatus: 'Aprobado' | 'Rechazado' | null;
  saving: boolean;
  showRejectInput: boolean;
  rejectComment: string;
}

interface LogItem {
  id: number;
  title: string;
  date: string;
  author?: string;
}

function normalizeReviewStatus(raw?: string | null): 'Aprobado' | 'Rechazado' | null {
  const s = (raw ?? '').toLowerCase();
  if (s.includes('aprob')) return 'Aprobado';
  if (s.includes('rechaz')) return 'Rechazado';
  return null;
}

export default defineComponent({
  name: 'AdminApplicationReview',
  components: { AppDrawer, AppDrawerHeader, AppIcon, TimelineList },
  emits: ['update:isVisible'],
  props: {
    isVisible: { type: Boolean, default: false },
    application: {
      type: Object as PropType<AdminApplicationListItemDto>,
      required: true,
    },
  },

  setup(props, { emit }) {
    const userStore = useUserStore();

    const isLoading = ref(false);
    const detail = ref<AdminApplicationDetailDto | null>(null);
    const localDocs = reactive<LocalDoc[]>([]);
    const logs = ref<LogItem[]>([]);

    const studentName = computed(() => {
      const p = props.application.people;
      return [p?.names, p?.lastnames].filter(Boolean).join(' ') || '—';
    });
    const scholarshipName = computed(() => props.application.scholarshipSettings?.name ?? '—');
    const currentStatusName = computed(() => detail.value?.scholarshipStatus?.name ?? props.application.scholarshipStatus?.name ?? '');
    const currentStatusColor = computed(() => detail.value?.scholarshipStatus?.color ?? props.application.scholarshipStatus?.color ?? '#2563eb');

    const loadDetail = async () => {
      isLoading.value = true;
      localDocs.splice(0);
      logs.value = [];
      detail.value = null;

      const [detailRes, logsRes] = await Promise.allSettled([detailService.run(props.application.id), logsService.run(props.application.id)]);

      if (detailRes.status === 'fulfilled') {
        const d: AdminApplicationDetailDto = detailRes.value?.data ?? detailRes.value;
        detail.value = d;
        localDocs.splice(
          0,
          localDocs.length,
          ...(d?.documents ?? []).map((doc) => ({
            id: doc.id,
            name: doc.requiredDocument?.scholarshipDocument?.name ?? '—',
            date: doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString('es-ES') : '—',
            fileUrl: doc.fileUrl,
            pendingStatus: normalizeReviewStatus(doc.review?.status),
            saving: false,
            showRejectInput: false,
            rejectComment: '',
          }))
        );
      }

      if (logsRes.status === 'fulfilled') {
        const rawLogs: ApplicationLogEntryDto[] = Array.isArray(logsRes.value) ? logsRes.value : logsRes.value?.data ?? [];
        logs.value = rawLogs.map((l) => ({
          id: l.id,
          title: l.action ?? l.description ?? l.scholarshipStatus?.name ?? 'Evento',
          date: l.createdAt ? new Date(l.createdAt).toLocaleDateString('es-ES') : '—',
          author: l.user ? [l.user.names ?? l.user.name, l.user.lastnames].filter(Boolean).join(' ') : undefined,
        }));
      }

      isLoading.value = false;
    };

    watch(
      () => props.isVisible,
      (visible) => {
        if (visible && props.application?.id) loadDetail();
      },
      { immediate: true }
    );

    const setDocStatus = async (doc: LocalDoc, status: 'Aprobado' | 'Rechazado', comment = '') => {
      if (doc.pendingStatus === status) return;
      doc.saving = true;
      try {
        await reviewService.run(doc.id, status, comment, userStore.user?.id);
        doc.pendingStatus = status;
        doc.showRejectInput = false;
        doc.rejectComment = '';
      } catch {
        toast.show('Error al revisar el documento', 'danger');
      } finally {
        doc.saving = false;
      }
    };

    const onRejectClick = (doc: LocalDoc) => {
      if (doc.pendingStatus === 'Rechazado') return;
      doc.showRejectInput = true;
    };

    const onCancelReject = (doc: LocalDoc) => {
      doc.showRejectInput = false;
      doc.rejectComment = '';
    };

    const onConfirmReject = (doc: LocalDoc) => {
      if (!doc.rejectComment.trim()) {
        toast.show('Debes ingresar el motivo del rechazo', 'warning');
        return;
      }
      setDocStatus(doc, 'Rechazado', doc.rejectComment.trim());
    };

    return {
      isLoading,
      detail,
      localDocs,
      logs,
      studentName,
      scholarshipName,
      currentStatusName,
      currentStatusColor,
      setDocStatus,
      onRejectClick,
      onCancelReject,
      onConfirmReject,
    };
  },
});
</script>

<style scoped>
.ar-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px;
  font-size: 13px;
  color: #94a3b8;
}
.ar-loading__icon {
  animation: ar-spin 0.8s linear infinite;
}

.ar-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Status row */
.ar-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.ar-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
}
.ar-progress-text {
  font-size: 12px;
  color: #64748b;
}

/* Section */
.ar-section__title {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 12px;
}

/* Summary grid */
.ar-summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.ar-summary-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  background: #f8fafc;
}
.ar-summary-card--wide {
  grid-column: span 2;
}
.ar-summary-card__label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 4px;
}
.ar-summary-card__value {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
.ar-summary-card__value--motivation {
  font-size: 12px;
  font-weight: 400;
  color: #475569;
  line-height: 1.6;
  max-height: 80px;
  overflow-y: auto;
  overflow-x: hidden;
  word-break: break-word;
  white-space: pre-wrap;
}

/* Progress bar */
.ar-progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 4px;
}
.ar-progress-bar__fill {
  height: 100%;
  background: #2563eb;
  border-radius: 999px;
  transition: width 0.4s ease;
}
.ar-progress-bar__label {
  font-size: 11px;
  color: #64748b;
  margin: 0;
}

/* Document cards */
.ar-doc-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ar-doc-card--rejecting {
  border-color: #dc2626;
  background: #fff8f8;
}
.ar-doc-card__main {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ar-doc-card__icon {
  color: #64748b;
  font-size: 16px;
  flex-shrink: 0;
}
.ar-doc-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.ar-doc-card__name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ar-doc-card__date {
  font-size: 11px;
  color: #94a3b8;
}
.ar-doc-card__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* Doc buttons */
.ar-doc-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background: #fff;
  transition: all 0.15s;
  text-decoration: none;
}
.ar-doc-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ar-doc-btn__icon {
  font-size: 11px;
}
.ar-doc-btn--view {
  border-color: #94a3b8;
  color: #64748b;
  padding: 4px 8px;
}
.ar-doc-btn--view:hover {
  background: #f1f5f9;
}
.ar-doc-btn--approve {
  border-color: #16a34a;
  color: #16a34a;
}
.ar-doc-btn--approve:hover {
  background: #f0fdf4;
}
.ar-doc-btn--approve.ar-doc-btn--active {
  background: #16a34a;
  color: #fff;
}
.ar-doc-btn--reject {
  border-color: #dc2626;
  color: #dc2626;
}
.ar-doc-btn--reject:hover {
  background: #fff1f2;
}
.ar-doc-btn--reject.ar-doc-btn--active-red {
  background: #dc2626;
  color: #fff;
}
.ar-doc-saving {
  font-size: 13px;
  color: #94a3b8;
  animation: ar-spin 0.8s linear infinite;
}
.ar-doc-saving--inline {
  margin-right: 4px;
}

/* Inline reject input */
.ar-reject-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 4px;
  border-top: 1px solid #fecaca;
}
.ar-reject-input__label {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
.ar-reject-input__required {
  color: #dc2626;
}
.ar-reject-input__textarea {
  width: 100%;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: #1e293b;
  resize: vertical;
  outline: none;
  background: #fff;
}
.ar-reject-input__textarea:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1);
}
.ar-reject-input__textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.ar-reject-input__actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}
.ar-doc-btn--cancel-reject {
  border-color: #94a3b8;
  color: #64748b;
  background: #fff;
}
.ar-doc-btn--cancel-reject:hover {
  background: #f1f5f9;
}
.ar-doc-btn--confirm-reject {
  border-color: #dc2626;
  color: #fff;
  background: #dc2626;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.ar-doc-btn--confirm-reject:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}
.ar-doc-btn--confirm-reject:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Timeline */
.ar-history-item {
  padding-bottom: 4px;
}
.ar-history-item__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}
.ar-history-item__title {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
}
.ar-history-item__date {
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}
.ar-history-item__date-icon {
  font-size: 10px;
}
.ar-history-item__author {
  font-size: 11px;
  color: #64748b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}
.ar-history-item__author-icon {
  font-size: 10px;
}

.ar-empty {
  font-size: 13px;
  color: #94a3b8;
}

@keyframes ar-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
