<template>
  <div class="certificate-editor">
    <!-- Panel principal izquierdo (10% ancho) -->
    <div class="sidebar-main">
      <CertificateEditorSidebar />
    </div>

    <!-- Panel de opciones secundario (pegado al sidebar) -->
    <div class="sidebar-secondary" :style="{ width: `${uiStore.secondaryPanelWidth}%` }">
      <CertificateEditorSecondaryPanel :dataImages="dataImages" />
    </div>

    <!-- Contenedor principal -->
    <div class="editor-main-content" :style="mainContentStyle">
      <!-- Barra de herramientas superior -->
      <div class="toolbar-top">
        <CertificateEditorToolbar @preview="openPreview" />
      </div>

      <!-- Área del lienzo -->
      <div class="canvas-container">
        <CertificateEditorCanvas />
      </div>
    </div>

    <!-- Panel de propiedades flotante (si está activo) -->
    <div v-if="uiStore.showPropertiesPanel && editorStore.selectedObjectId" class="properties-panel">
      <CertificateEditorProperties />
    </div>

    <!-- Modal de previsualización -->
    <AppModal v-model="showPreview" size="xl">
      <CertificatePreviewModal v-if="showPreview" :initialJson="editorStore.exportToJSON()" />
    </AppModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useCertificateEditorStore } from '../../../stores/certificateEditor.store';
import { useEditorUIStore } from '../../../stores/editorUI.store';

// Componentes del editor
import CertificateEditorSidebar from './CertificateEditorSidebar.vue';
import CertificateEditorSecondaryPanel from './CertificateEditorSecondaryPanel.vue';
import CertificateEditorToolbar from './CertificateEditorToolbar.vue';
import CertificatePreviewModal from './CertificatePreviewModal.vue';
import CertificateEditorCanvas from './CertificateEditorCanvas.vue';
import CertificateEditorProperties from './CertificateEditorProperties.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';

import { certificateService } from '../services/certificate.service';
import { GetCertificatesTemplatesService } from '../services/getCertificatesTemplates.service';

const getCertificatesTemplatesService = new GetCertificatesTemplatesService();

export default defineComponent({
  name: 'CertificateEditor',
  components: {
    CertificateEditorSidebar,
    CertificateEditorSecondaryPanel,
    CertificateEditorToolbar,
    CertificateEditorCanvas,
    CertificateEditorProperties,
    CertificatePreviewModal,
    AppModal,
  },
  props: {
    templateId: {
      type: String,
      default: null,
    },
    isSaving: {
      type: Boolean,
    },
  },
  setup(props) {
    const editorStore = useCertificateEditorStore();
    const uiStore = useEditorUIStore();
    const dataImages = ref<{}>({});

    // Computed para el estilo del contenido principal
    const showPreview = ref(false);
    const openPreview = () => {
      showPreview.value = true;
    };
    const mainContentStyle = computed(() => {
      let width = 100 - uiStore.sidebarWidth;
      if (uiStore.isSecondaryPanelVisible) {
        width -= uiStore.secondaryPanelWidth;
      }
      return {
        width: `${width}%`,
      };
    });

    // Lifecycle hooks
    onMounted(() => {
      // Inicializar el editor
      if (props.templateId) {
        loadTemplate(props.templateId);
      } else {
        editorStore.initializeTemplate();
      }
    });

    onUnmounted(() => {
      // Limpiar stores
      // No se llama a clearTemplate aquí para evitar errores al limpiar un canvas que Vue ya está desmontando..
      // editorStore.clearTemplate();
      uiStore.resetUI();
    });

    // Métodos
    const loadTemplate = async (templateId: string) => {
      try {
        // 1️⃣ metadata del certificado (trae urlJsonTemplate)
        const certificate = await getCertificatesTemplatesService.run(Number(templateId));
        const logoObj = certificate?.institution?.logo ? { url: certificate.institution.logo, type: 'images' } : null;
        const logoInstitutionalObj = certificate?.institution?.logoInstitutional ? { url: certificate.institution.logoInstitutional, type: 'images' } : null;
        const extras = [logoObj, logoInstitutionalObj].filter(Boolean) as any[];
        // Unimos + evitamos duplicados por url
        const mergedImages = [...(certificate?.images ?? []), ...extras.filter((x) => !(certificate?.images ?? []).some((img: any) => img.url === x.url))];
        console.log('mergedImages Images:', mergedImages);
        await editorStore.importImages(mergedImages);

        const exportedImages = editorStore.exportImages();
        dataImages.value = exportedImages;

        // 2️⃣ si existe el JSON en S3 → traerlo
        if (certificate?.urlJsonTemplate) {
          const res = await fetch(certificate.urlJsonTemplate, {
            cache: 'no-store', // opcional: evita cache raro
          });

          if (!res.ok) {
            throw new Error(`Fetch JSON failed: ${res.status} ${res.statusText}`);
          }

          const jsonData = await res.json();

          // 3️⃣ Importar tal cual (ya viene {template, canvas})
          await editorStore.importFromJSON({
            template: jsonData.template,
            canvas: jsonData.canvas,
          });

          return;
        }

        // 4️⃣ si no hay urlJsonTemplate → fallback
        console.warn('⚠️ No urlJsonTemplate found. Initializing empty template...');
        editorStore.initializeTemplate({
          id: certificate?.id?.toString() || templateId,
          name: certificate?.name || 'Template cargado',
          description: certificate?.description,
          size: { width: 1123, height: 794, format: 'A4' },
          background: { type: 'color', value: '#ffffff' },
          createdAt: certificate?.createdAt ? new Date(certificate.createdAt) : new Date(),
          updatedAt: certificate?.updatedAt ? new Date(certificate.updatedAt) : new Date(),
        });
      } catch (error) {
        console.error('❌ Error loading template:', error);
        editorStore.initializeTemplate();
      }
    };

    const saveTemplate = async () => {
      try {
        const templateData = editorStore.exportToJSON();
        if (templateData) {
          // TODO: Enviar al backend
        }
      } catch (error) {
        console.error('Error saving template:', error);
      }
    };
    watch(
      () => props.isSaving,
      async (newVal) => {
        if (newVal) {
          saveTemplate();
        }
      }
    );
    return {
      editorStore,
      uiStore,
      mainContentStyle,
      loadTemplate,
      saveTemplate,
      showPreview,
      openPreview,
      dataImages,
    };
  },
});
</script>

<style scoped>
.certificate-editor {
  display: flex;
  height: 100%;
  background-color: #f9fafb;
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - 160px);
}

/* Panel lateral principal */
.sidebar-main {
  background-color: white;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 0;
  min-width: 80px;
  max-width: 120px;
}

/* Panel lateral secundario */
.sidebar-secondary {
  background-color: #f9fafb;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 0;
  min-width: 200px;
  max-width: 300px;
}

/* Contenido principal */
.editor-main-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

/* Toolbar superior */
.toolbar-top {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  height: 52px;
}

/* Contenedor del canvas */
.canvas-container {
  flex: 1;
  background-color: #f3f4f6;
  padding: 1rem; /* Padding estándar */
  overflow: auto;
  position: relative;
}

/* Panel de propiedades flotante */
.properties-panel {
  position: absolute;
  top: 4rem;
  right: 1rem;
  width: 20rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  z-index: 50;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 1024px) {
  .certificate-editor {
    min-height: calc(100vh - 120px);
  }

  .sidebar-main {
    min-width: 60px;
    max-width: 80px;
  }

  .sidebar-secondary {
    min-width: 180px;
    max-width: 220px;
  }

  .properties-panel {
    width: 18rem;
  }
}

@media (max-width: 768px) {
  .properties-panel {
    width: 16rem;
    right: 0.5rem;
  }
}

/* Estados de interacción */
.certificate-editor.dragging {
  user-select: none;
}

.certificate-editor.resizing {
  user-select: none;
}

/* Animaciones */
.sidebar-secondary {
  transition: width 0.2s ease-in-out;
}

.editor-main-content {
  transition: width 0.2s ease-in-out;
}

.properties-panel {
  animation: slideInRight 0.2s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
