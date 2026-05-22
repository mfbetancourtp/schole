<template>
  <AppFormModal :title="modalTitle">
    <template #content>
      <div v-if="document" class="previewModal">
        <div class="previewModal__summary">
          <div class="previewModal__summaryCopy">
            <p class="previewModal__section">{{ document.sectionLabel }}</p>
            <p class="previewModal__hint">{{ document.subtitle }}</p>
          </div>

          <AppBadge :label="document.documentStatus" :variant="statusVariant" />
        </div>

        <div v-if="hasViewer" class="previewModal__viewer previewModal__viewer--loaded">
          <img v-if="viewer.kind === 'image'" :src="viewer.src" :alt="document.title" class="previewModal__image" />
          <iframe v-else :src="viewer.src" :title="`Soporte ampliado de ${document.title}`"></iframe>
        </div>

        <div v-else class="previewModal__viewer previewModal__viewer--empty">
          <AppIcon icon="file-alt" class="previewModal__emptyIcon" />
          <p class="previewModal__emptyText">Este registro todavía no tiene un soporte disponible para visualización.</p>
        </div>
      </div>
    </template>

    <template #actions>
      <div class="previewModal__actions">
        <AppButton v-if="document?.certificateUrl" type="button" outlined @click="emit('openSupport', document)">
          <AppIcon icon="eye" class="me-2" />
          Abrir soporte
        </AppButton>

        <AppButton v-if="document" type="button" variant="success" :outlined="false" :disabled="isSubmittingStatus" @click="emit('approve', document)">
          <AppIcon icon="check-circle" class="me-2" />
          Aprobar
        </AppButton>

        <AppButton v-if="document" type="button" variant="danger" :outlined="false" :disabled="isSubmittingStatus" @click="emit('reject', document)">
          <AppIcon icon="times-circle" class="me-2" />
          Rechazar
        </AppButton>
      </div>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import AppBadge from '../../../shared/components/AppBadge.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

interface PreviewDocument {
  title: string;
  subtitle: string;
  sectionLabel: string;
  documentStatus: string;
  certificateUrl?: string | null;
}

interface PreviewViewer {
  src: string;
  kind: '' | 'iframe' | 'image';
  extension: string;
}

export default defineComponent({
  name: 'AttachmentValidationPreviewModal',
  components: {
    AppBadge,
    AppButton,
    AppIcon,
    AppFormModal,
  },
  props: {
    document: {
      type: Object as PropType<PreviewDocument | null>,
      default: null,
    },
    viewer: {
      type: Object as PropType<PreviewViewer>,
      default: () => ({
        src: '',
        kind: '',
        extension: '',
      }),
    },
    hasViewer: {
      type: Boolean,
      default: false,
    },
    statusVariant: {
      type: String,
      default: 'secondary',
    },
    isSubmittingStatus: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['approve', 'reject', 'openSupport'],
  setup(props, { emit }) {
    const modalTitle = computed(() => props.document?.title || 'Vista ampliada');

    return {
      emit,
      modalTitle,
    };
  },
});
</script>

<style scoped>
:deep(.o-modal-body) {
  padding: 1rem;
  overflow: hidden;
}

.previewModal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: calc(100vh - 22rem);
  min-height: 0;
}

.previewModal__summary {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.previewModal__summaryCopy {
  min-width: 0;
}

.previewModal__section {
  margin: 0;
  color: #2563eb;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.previewModal__hint {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.5;
}

.previewModal__viewer {
  min-height: 0;
  background: #f8fafc;
  border: 1px solid #eaecf0;
  border-radius: 14px;
  padding: 20px;
  flex: 1;
}

.previewModal__viewer--loaded {
  height: auto;
  padding: 0;
  overflow: hidden;
  background: #ffffff;
}

.previewModal__viewer--loaded iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #ffffff;
}

.previewModal__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #ffffff;
}

.previewModal__viewer--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}

.previewModal__emptyIcon {
  font-size: 3rem;
  color: #98a2b3;
}

.previewModal__emptyText {
  margin: 0;
  color: #667085;
  font-size: 14px;
}

.previewModal__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

:deep(.previewModal__actions .o-btn),
:deep(.o-modal-footer > .o-btn) {
  min-height: 36px;
  padding: 0.45rem 0.75rem;
  font-size: 0.82rem;
}

:deep(.previewModal__actions .o-btn .me-2),
:deep(.o-modal-footer > .o-btn .me-2) {
  margin-right: 0.35rem !important;
}

@media (max-width: 768px) {
  :deep(.o-modal-body) {
    padding: 0.85rem;
  }

  .previewModal {
    height: calc(100vh - 18rem);
  }

  .previewModal__summary {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
