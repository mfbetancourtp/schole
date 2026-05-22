<template>
  <div class="certificate-card">
    <!-- Imagen del certificado -->
    <div class="container-image">
      <div class="certificate-image">
        <div class="preview-viewport" ref="viewportRef">
          <div class="preview-scale" :style="previewScaleStyle">
            <div class="html-preview" v-html="htmlContent"></div>
          </div>
        </div>

        <div class="image-overlay">
          <AppButton @click="$emit('preview', certificate)" variant="primary" icon="eye" size="sm" class="preview-btn" v-tooltip="'Vista previa'" />
        </div>
      </div>
    </div>

    <!-- Información del certificado -->
    <div class="certificate-info">
      <div class="certificate-header">
        <div class="certificate-title-section">
          <h3 class="certificate-title">{{ certificate.name }}</h3>
          <!-- <p
            v-if="certificate.typeDocument?.description"
            class="certificate-description"
          >
            {{ certificate.typeDocument?.description }}
          </p> -->
        </div>
        <!-- <div class="certificate-status">
          <span :class="['status-badge', `status-${certificate.status}`]">
            {{ getStatusLabel(certificate.status) }}
          </span>
        </div> -->
      </div>

      <div class="certificate-meta">
        <div class="meta-item">
          <AppIcon icon="calendar" class="meta-icon" />
          <span class="meta-text">{{ formatDate(certificate.createdAt) }}</span>
        </div>
        <div class="meta-item">
          <!-- <AppIcon icon="layer-group" class="meta-icon" /> -->
          <!-- <span class="meta-text">{{ certificate.variables.length }} variables</span> -->
        </div>
      </div>

      <!-- Acciones -->
      <div class="certificate-actions">
        <AppButtonGroup size="sm">
          <AppButton @click="$emit('preview', certificate)" variant="secondary" icon="eye" v-tooltip="'Vista previa'" outlined />
          <AppButton @click="$emit('edit', certificate)" variant="primary" icon="edit" v-tooltip="'Editar'" outlined />
          <!-- <AppButton @click="$emit('duplicate', certificate)" variant="success" icon="copy" v-tooltip="'Duplicar'" outlined /> -->
          <AppButton @click="$emit('delete', certificate)" variant="danger" icon="trash" v-tooltip="'Eliminar'" outlined />
        </AppButtonGroup>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, onMounted, watch, ref } from 'vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import type { Certificate } from '../dtos/certificate.dto';

export default defineComponent({
  name: 'CertificateCard',
  components: {
    AppButton,
    AppButtonGroup,
    AppIcon,
  },
  props: {
    certificate: {
      type: Object as PropType<Certificate>,
      required: true,
    },
  },
  emits: ['preview', 'edit', 'duplicate', 'delete'],
  setup(props, { emit }) {
    // Métodos
    const htmlContent = ref<any>();
    const viewportRef = ref<HTMLElement | null>(null);

    const baseWidth = ref(794); // A4 approx a 96dpi (ancho)
    const baseHeight = ref(1123); // A4 approx a 96dpi (alto)

    // escala para que quepa en 200x150 sin deformar
    const previewScaleStyle = computed(() => {
      const containerW = 200;
      const containerH = 150;

      const docW = baseWidth.value; // 794
      const docH = baseHeight.value; // 1123

      // COVER
      const scale = Math.max(containerW / docW, containerH / docH);

      const scaledW = docW * scale;
      const scaledH = docH * scale;

      // offset centrado
      let offsetX = (containerW - scaledW) / 2;
      let offsetY = (containerH - scaledH) / 2;

      // ✅ CLAMP: evita que se "salga" mostrando espacio vacío
      // X: si scaledW > containerW => offsetX debe estar entre [containerW - scaledW, 0]
      //    si scaledW <= containerW => offsetX = (containerW - scaledW)/2 (no debería pasar en cover, pero por seguridad)
      if (scaledW > containerW) {
        offsetX = Math.min(0, Math.max(containerW - scaledW, offsetX));
      } else {
        offsetX = (containerW - scaledW) / 2;
      }

      // Y: si scaledH > containerH => offsetY entre [containerH - scaledH, 0]
      if (scaledH > containerH) {
        offsetY = Math.min(0, Math.max(containerH - scaledH, offsetY));
      } else {
        offsetY = (containerH - scaledH) / 2;
      }

      return {
        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
        transformOrigin: 'top left',
      };
    });

    const getStatusLabel = (status: string): string => {
      const labels = {
        draft: 'Borrador',
        published: 'Publicado',
        archived: 'Archivado',
      };
      return labels[status as keyof typeof labels] || status;
    };
    const sanitizeSvgNaN = (html: string) => {
      // Reemplaza transform="matrix(...NaN...)" por identidad
      return html.replace(/transform="matrix\([^"]*NaN[^"]*\)"/g, 'transform="matrix(1 0 0 1 0 0)"');
    };

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };
    const loadHtml = async () => {
      try {
        const res = await fetch(String(props.certificate?.urlHtmlTemplate));
        const text = await res.text();
        htmlContent.value = sanitizeSvgNaN(text);
      } catch (e) {
        console.error('Error cargando HTML:', e);
      }
    };

    onMounted(loadHtml);
    watch(() => props.certificate.urlHtmlTemplate, loadHtml);
    return {
      getStatusLabel,
      formatDate,
      htmlContent,
      previewScaleStyle,
    };
  },
});
</script>

<style scoped>
.certificate-card {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.certificate-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}
.container-image {
  padding: 1.25rem;
  background-color: #fafafa;
}
.certificate-image {
  position: relative;
  width: 200px;
  min-width: 200px;
  height: 150px;
  overflow: hidden;
  background: #f3f4f6;
}

.preview-viewport {
  width: 100%;
  height: 100%;
  overflow: hidden; /* 🔥 clave: nunca scroll */
  background: #fff;
  position: relative;
}

/* Contenedor escalado */
.preview-scale {
  position: absolute; /* 🔥 clave: que translate funcione bien */
  top: 42px;
  left: 0;
  will-change: transform;
}

/* "Documento" base */
.html-preview {
  width: 794px;
  height: 1123px;
  background: white;
  overflow: hidden; /* 🔥 evita scroll interno */
}

/* 🔥 MUY IMPORTANTE: reset dentro del HTML embebido */
.html-preview :deep(html),
.html-preview :deep(body) {
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}

/* 🔥 Evita que elementos internos generen overflow */
.html-preview :deep(*) {
  box-sizing: border-box;
  max-width: 100%;
}

.certificate-image .image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.certificate-card:hover .certificate-image .image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.certificate-card:hover .image-overlay {
  opacity: 1;
}

.preview-btn {
  transform: scale(0.9);
  transition: transform 0.2s ease;
}

.image-overlay:hover .preview-btn {
  transform: scale(1);
}

.certificate-info {
  flex: 1;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.certificate-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.certificate-title-section {
  flex: 1;
}

.certificate-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.certificate-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.certificate-status {
  flex-shrink: 0;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-draft {
  background: #fef3c7;
  color: #92400e;
}

.status-published {
  background: #d1fae5;
  color: #065f46;
}

.status-archived {
  background: #e5e7eb;
  color: #374151;
}

.certificate-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.meta-icon {
  font-size: 0.875rem;
  color: #9ca3af;
}

.certificate-actions {
  align-self: flex-start;
}

/* Responsive */
@media (max-width: 768px) {
  .certificate-card {
    flex-direction: column;
  }

  .container-image {
    width: 100%;
  }

  .certificate-image {
    width: 100%;
    min-width: unset;
    height: 200px;
  }

  .certificate-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .certificate-status {
    align-self: flex-start;
  }

  .certificate-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .certificate-actions {
    align-self: stretch;
  }

  .certificate-actions :deep(.btn-group) {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .certificate-info {
    padding: 1rem;
  }

  .certificate-actions :deep(.btn-group) {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .certificate-actions :deep(.btn-group .btn) {
    flex: 1;
    min-width: calc(50% - 0.25rem);
  }
}
</style>
