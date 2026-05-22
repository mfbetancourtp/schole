<template>
  <AppDrawer :isVisible="isVisible" size="md" @update:isVisible="$emit('update:isVisible', $event)">
    <template #head>
      <AppDrawerHeader variant="view" icon="graduation-cap" :title="current.scholarshipSettings?.name ?? '—'" :subtitle="`ID: REQ-${current.id}`" />
    </template>

    <template #body>
      <div v-if="isLoading" class="add-loading">
        <AppIcon icon="circle-notch" class="add-loading__icon" />
        Cargando...
      </div>
      <div v-else class="add-body">
        <!-- Status + date -->
        <div class="add-section">
          <div class="add-meta-row">
            <span
              class="add-status-badge"
              :style="{
                background: statusBg,
                color: statusColor,
                borderColor: statusColor,
              }"
            >
              <AppIcon :icon="statusIcon" class="add-status-badge__icon" />
              {{ current.scholarshipStatus?.name ?? '—' }}
            </span>
            <span class="add-date">
              <AppIcon icon="calendar" class="add-date__icon" />
              {{ formattedDate }}
            </span>
          </div>
        </div>

        <!-- Timeline -->
        <div class="add-section">
          <p class="add-section__title">ESTADO DE LA SOLICITUD</p>
          <div class="add-timeline">
            <template v-for="(step, i) in APPLICATION_STEPS" :key="step.key">
              <div
                class="add-tl-step"
                :class="{
                  'add-tl-step--done': i < currentStep,
                  'add-tl-step--active': i === currentStep,
                }"
              >
                <div class="add-tl-dot">
                  <AppIcon v-if="i < currentStep" icon="check" class="add-tl-dot__icon" />
                </div>
                <span class="add-tl-label">{{ step.label }}</span>
              </div>
              <div v-if="i < APPLICATION_STEPS.length - 1" class="add-tl-line" :class="{ 'add-tl-line--done': i < currentStep }"></div>
            </template>
          </div>
        </div>

        <!-- Scholarship info -->
        <div class="add-section">
          <p class="add-section__title">INFORMACIÓN DE LA BECA</p>
          <div class="add-info-grid">
            <div class="add-info-card add-info-card--blue">
              <p class="add-info-card__label">Nombre</p>
              <p class="add-info-card__value">
                {{ current.scholarshipSettings?.name ?? '—' }}
              </p>
            </div>
            <div class="add-info-card add-info-card--purple">
              <p class="add-info-card__label">Código</p>
              <p class="add-info-card__value">{{ scholarshipCode }}</p>
            </div>
            <div class="add-info-card add-info-card--green">
              <p class="add-info-card__label">Fecha de Postulación</p>
              <p class="add-info-card__value">{{ formattedDate }}</p>
            </div>
          </div>
        </div>

        <!-- Documents -->
        <div class="add-section">
          <p class="add-section__title">DOCUMENTOS ADJUNTOS</p>
          <div v-if="documents.length > 0">
            <div
              v-for="doc in documents"
              :key="doc.id"
              class="add-doc-card"
              :class="{
                'add-doc-card--rejected': normalizeDocStatus(doc.review?.status ?? doc.status) === 'rechazado',
              }"
            >
              <!-- Main row -->
              <div class="add-doc-card__main">
                <AppIcon icon="file-alt" class="add-doc-card__icon" />
                <div class="add-doc-card__info">
                  <span class="add-doc-card__name">{{ doc.requiredDocument?.scholarshipDocument?.name ?? doc.scholarshipDocument?.name ?? '—' }}</span>
                  <span class="add-doc-card__date">{{ doc.updatedAt ?? doc.createdAt ? new Date(doc.updatedAt ?? doc.createdAt!).toLocaleDateString('es-ES') : '' }}</span>
                </div>
                <div class="add-doc-card__right">
                  <span class="add-doc-status" :class="`add-doc-status--${normalizeDocStatus(doc.review?.status ?? doc.status)}`">
                    {{ docStatusLabel(doc.review?.status ?? doc.status) }}
                  </span>
                  <a v-if="doc.fileUrl" :href="doc.fileUrl" target="_blank" class="add-doc-view-btn">
                    <AppIcon icon="eye" />
                  </a>
                </div>
              </div>

              <!-- Rejection detail + upload corrected -->
              <template v-if="normalizeDocStatus(doc.review?.status ?? doc.status) === 'rechazado'">
                <div v-if="doc.review?.comment" class="add-doc-rejection">
                  <AppIcon icon="comment-alt" class="add-doc-rejection__icon" />
                  <p class="add-doc-rejection__text">
                    {{ doc.review.comment }}
                  </p>
                </div>

                <div class="add-doc-upload">
                  <p class="add-doc-upload__label">
                    <AppIcon icon="upload" class="add-doc-upload__icon" />
                    Subir documento corregido
                  </p>
                  <div class="add-doc-upload__row">
                    <input type="file" class="add-doc-upload__input" :id="`reupload-${doc.id}`" :disabled="uploadingDocId === doc.id" @change="(e) => onReuploadFileChange(e, doc)" />
                    <label
                      :for="`reupload-${doc.id}`"
                      class="add-doc-upload__btn"
                      :class="{
                        'add-doc-upload__btn--loading': uploadingDocId === doc.id,
                      }"
                    >
                      <AppIcon
                        :icon="uploadingDocId === doc.id ? 'circle-notch' : 'paperclip'"
                        :class="{
                          'add-doc-upload__spin': uploadingDocId === doc.id,
                        }"
                      />
                      {{ uploadingDocId === doc.id ? 'Subiendo…' : 'Seleccionar archivo' }}
                    </label>
                    <span v-if="uploadedDocIds.includes(doc.id)" class="add-doc-upload__ok"> <AppIcon icon="check-circle" /> Enviado </span>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <p v-else class="add-empty">Sin documentos registrados.</p>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref, watch } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import type { MyApplicationApiItemDto, ApplicationDetailResponseDto } from '../dtos/application.dto';
import { GetScholarshipApplicationByIdService } from '../services/getScholarshipApplicationById.service';
import { UploadScholarshipApplicationDocumentService } from '../services/uploadScholarshipApplicationDocument.service';
import { ToastService } from '../../../shared/services/toast.service';
import { useUserStore } from '../../../stores/user';

const detailService = new GetScholarshipApplicationByIdService();
const uploadDocumentService = new UploadScholarshipApplicationDocumentService();
const toast = new ToastService();

const APPLICATION_STEPS = [
  { key: 'borrador', label: 'Borrador' },
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'subsanacion', label: 'En Subsanación' },
  { key: 'evaluada', label: 'Evaluada' },
  { key: 'adjudicada', label: 'Adjudicada' },
];

const STATUS_STEP_MAP: Record<string, number> = {
  borrador: 0,
  pendiente: 1,
  subsanacion: 2,
  evaluada: 3,
  adjudicada: 4,
  rechazada: 4,
};

const STATUS_ICON_MAP: Record<string, string> = {
  borrador: 'pencil-alt',
  pendiente: 'clock',
  subsanacion: 'exclamation-triangle',
  evaluada: 'search',
  adjudicada: 'check-circle',
  rechazada: 'times-circle',
};

function normalizeStatusKey(raw?: string): string {
  const s = (raw ?? '').toLowerCase().replace(/\s+/g, '');
  if (s.includes('borrador')) return 'borrador';
  if (s.includes('subsana')) return 'subsanacion';
  if (s.includes('adjudic')) return 'adjudicada';
  if (s.includes('rechaz')) return 'rechazada';
  if (s.includes('evalua')) return 'evaluada';
  return 'pendiente';
}

export default defineComponent({
  name: 'ApplicationDetailDrawer',
  components: { AppDrawer, AppDrawerHeader, AppIcon },
  emits: ['update:isVisible', 'documentUploaded'],
  props: {
    isVisible: { type: Boolean, default: false },
    item: { type: Object as PropType<MyApplicationApiItemDto>, required: true },
  },
  setup(props, { emit }) {
    const userStore = useUserStore();
    const detail = ref<MyApplicationApiItemDto | null>(null);
    const isLoading = ref(false);
    const uploadingDocId = ref<number | null>(null);
    const uploadedDocIds = ref<number[]>([]);

    watch(
      () => props.isVisible,
      async (visible) => {
        if (visible && props.item?.id) {
          isLoading.value = true;
          try {
            const peopleId = userStore.user?.people?.id;
            const res: ApplicationDetailResponseDto = await detailService.run(props.item.id, peopleId);
            detail.value = res?.data ?? props.item;
          } catch {
            detail.value = props.item;
          } finally {
            isLoading.value = false;
          }
        } else if (!visible) {
          detail.value = null;
          uploadedDocIds.value = [];
        }
      },
      { immediate: true }
    );

    const current = computed(() => detail.value ?? props.item);

    const scholarshipCode = computed(() => current.value.scholarshipSettings?.code ?? props.item.scholarshipSettings?.code ?? '—');

    const statusKey = computed(() => normalizeStatusKey(current.value.scholarshipStatus?.name));
    const currentStep = computed(() => STATUS_STEP_MAP[statusKey.value] ?? 0);
    const statusIcon = computed(() => STATUS_ICON_MAP[statusKey.value] ?? 'circle');

    const apiColor = computed(() => current.value.scholarshipStatus?.color ?? '#2563eb');
    const statusColor = computed(() => apiColor.value);
    const statusBg = computed(() => `${apiColor.value}18`);

    const formattedDate = computed(() =>
      current.value.createdAt
        ? new Date(current.value.createdAt).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : '—'
    );

    const documents = computed(() => current.value.documents ?? []);

    const normalizeDocStatus = (raw?: string) => {
      const s = (raw ?? '').toLowerCase();
      if (s.includes('aprob')) return 'aprobado';
      if (s.includes('rechaz')) return 'rechazado';
      return 'pendiente';
    };

    const docStatusLabel = (raw?: string) => {
      const k = normalizeDocStatus(raw);
      return (
        {
          pendiente: 'Pendiente',
          aprobado: 'Aprobado',
          rechazado: 'Rechazado',
        }[k] ??
        raw ??
        ''
      );
    };

    const onReuploadFileChange = async (event: Event, doc: NonNullable<MyApplicationApiItemDto['documents']>[number]) => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;

      const applicationId = current.value.id;
      const requiredDocumentId = doc.requiredDocument?.id ?? doc.requiredDocumentId;
      const peopleId = userStore.user?.people?.id;

      if (!applicationId || !requiredDocumentId) {
        toast.show('No se pudo identificar el documento', 'danger');
        return;
      }

      uploadingDocId.value = doc.id;
      try {
        await uploadDocumentService.run(applicationId, file, requiredDocumentId, peopleId);
        uploadedDocIds.value.push(doc.id);
        toast.show('Documento enviado correctamente', 'success');
        emit('documentUploaded');

        // Refresh detail to show updated status
        const res: ApplicationDetailResponseDto = await detailService.run(applicationId, peopleId);
        detail.value = res?.data ?? detail.value;
      } catch {
        toast.show('Error al subir el documento', 'danger');
      } finally {
        uploadingDocId.value = null;
        input.value = '';
      }
    };

    return {
      APPLICATION_STEPS,
      current,
      scholarshipCode,
      currentStep,
      statusIcon,
      statusColor,
      statusBg,
      formattedDate,
      documents,
      normalizeDocStatus,
      docStatusLabel,
      isLoading,
      uploadingDocId,
      uploadedDocIds,
      onReuploadFileChange,
    };
  },
});
</script>

<style scoped>
.add-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.add-section__title {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 12px;
}

/* Status + date row */
.add-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.add-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
}
.add-status-badge__icon {
  font-size: 11px;
}
.add-date {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #64748b;
}
.add-date__icon {
  font-size: 11px;
  color: #94a3b8;
}

/* Timeline */
.add-timeline {
  display: flex;
  align-items: center;
}
.add-tl-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}
.add-tl-dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-tl-dot__icon {
  font-size: 10px;
  color: #fff;
}
.add-tl-step--done .add-tl-dot {
  background: #2563eb;
  border-color: #2563eb;
}
.add-tl-step--active .add-tl-dot {
  background: #2563eb;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.18);
}
.add-tl-label {
  font-size: 10px;
  color: #94a3b8;
  white-space: nowrap;
  font-weight: 500;
}
.add-tl-step--done .add-tl-label,
.add-tl-step--active .add-tl-label {
  color: #2563eb;
  font-weight: 700;
}
.add-tl-line {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  margin-bottom: 16px;
}
.add-tl-line--done {
  background: #2563eb;
}

/* Info grid */
.add-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.add-info-card {
  border-radius: 10px;
  padding: 12px 14px;
}
.add-info-card--blue {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}
.add-info-card--purple {
  background: #faf5ff;
  border: 1px solid #e9d5ff;
}
.add-info-card--green {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  grid-column: span 2;
}
.add-info-card__label {
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #64748b;
}
.add-info-card__value {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

/* Documents */
.add-doc-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.add-doc-card--rejected {
  border-color: #fecdd3;
  background: #fff8f8;
}
.add-doc-card__main {
  display: flex;
  align-items: center;
  gap: 10px;
}
.add-doc-card__right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.add-doc-view-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  color: #64748b;
  font-size: 12px;
  text-decoration: none;
  background: #fff;
  transition: background 0.15s;
}
.add-doc-view-btn:hover {
  background: #f1f5f9;
}
.add-doc-card__icon {
  color: #64748b;
  font-size: 16px;
  flex-shrink: 0;
}
.add-doc-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.add-doc-card__name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.add-doc-card__date {
  font-size: 11px;
  color: #94a3b8;
}

/* Rejection comment */
.add-doc-rejection {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 8px;
  padding: 8px 12px;
}
.add-doc-rejection__icon {
  color: #dc2626;
  font-size: 13px;
  margin-top: 1px;
  flex-shrink: 0;
}
.add-doc-rejection__text {
  font-size: 12px;
  color: #991b1b;
  margin: 0;
  line-height: 1.5;
}

/* Re-upload area */
.add-doc-upload {
  background: #fffbeb;
  border: 1px dashed #fcd34d;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.add-doc-upload__label {
  font-size: 12px;
  font-weight: 600;
  color: #92400e;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.add-doc-upload__icon {
  font-size: 12px;
}
.add-doc-upload__row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.add-doc-upload__input {
  display: none;
}
.add-doc-upload__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 6px;
  border: 1px solid #d97706;
  background: #fff;
  color: #d97706;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.add-doc-upload__btn:hover {
  background: #fffbeb;
}
.add-doc-upload__btn--loading {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}
.add-doc-upload__spin {
  animation: spin 0.8s linear infinite;
}
.add-doc-upload__ok {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #16a34a;
}
.add-doc-status {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
.add-doc-status--pendiente {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}
.add-doc-status--aprobado {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}
.add-doc-status--rechazado {
  background: #fff1f2;
  color: #dc2626;
  border: 1px solid #fecdd3;
}

.add-empty {
  font-size: 13px;
  color: #94a3b8;
}

.add-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  font-size: 13px;
  color: #94a3b8;
}
.add-loading__icon {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
