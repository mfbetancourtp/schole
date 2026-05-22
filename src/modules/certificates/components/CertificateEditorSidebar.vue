<template>
  <div class="sidebar-main-container">
    <!-- Herramientas principales -->
    <div class="tools-section">
      <!-- por el momento lo dejamos comentado -->
      <!-- <button @click="selectTool('templates')" :class="toolButtonClass('templates')" title="Añadir Templates">
        <AppGetIcon name="tablerCertificate" />
        <span class="tool-label">Templates</span>
      </button> -->

      <!-- Herramienta de Texto -->
      <button @click="selectTool('text')" :class="toolButtonClass('text')" title="Añadir Texto">
        <AppGetIcon name="tablerTextSize" />
        <span class="tool-label">Texto</span>
      </button>

      <!-- Herramienta de Imagen -->
      <button @click="selectTool('image')" :class="toolButtonClass('image')" title="Añadir Imagen">
        <AppGetIcon name="tablerLibraryPhoto" />
        <span class="tool-label">Imagen</span>
      </button>

      <!-- Herramienta de Variables -->
      <button @click="selectTool('variable')" :class="toolButtonClass('variable')" title="Variables Dinámicas">
        <AppGetIcon name="tablerBrackets" />
        <span class="tool-label">Variables</span>
      </button>

      <!-- Herramienta de Fondo -->
      <button @click="selectTool('background')" :class="toolButtonClass('background')" title="Cambiar Fondo">
        <AppGetIcon name="tablerBackground" />
        <span class="tool-label">Fondo</span>
      </button>

      <div class="tools-divider"></div>

      <!-- Herramienta de Capas -->
      <button @click="selectTool('layers')" :class="toolButtonClass('layers')" title="Gestionar Capas">
        <AppGetIcon name="tablerLayerSubtract" />
        <span class="tool-label">Capas</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useEditorUIStore, type ToolType } from '../../../stores/editorUI.store';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';

export default defineComponent({
  name: 'CertificateEditorSidebar',
  components: {
    AppGetIcon,
  },
  setup() {
    const uiStore = useEditorUIStore();

    // Seleccionar la herramienta de Templates por defecto al montar el componente
    onMounted(() => {
      selectTool('text');
      // selectTool('templates');
    });

    // Métodos
    const selectTool = (tool: ToolType) => {
      if (uiStore.activeTool === tool) {
        // Si ya está seleccionada, la deseleccionamos
        uiStore.setActiveTool(null);
      } else {
        uiStore.setActiveTool(tool);
      }
    };

    const toolButtonClass = (tool: ToolType) => {
      const baseClass = 'tool-button';
      const activeClass = uiStore.activeTool === tool ? 'tool-button-active' : '';
      return `${baseClass} ${activeClass}`;
    };

    return {
      uiStore,
      selectTool,
      toolButtonClass,
    };
  },
});
</script>

<style scoped>
.sidebar-main-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Sección de herramientas */
.tools-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tool-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  text-decoration: none;
}

.tool-button:hover {
  background-color: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.tool-button-active {
  background-color: #dbeafe;
  color: #2563eb;
}

.tool-button i {
  font-size: 1.25rem;
}

.tool-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  line-height: 1;
}

.tools-divider {
  height: 1px;
  background-color: #e5e7eb;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .sidebar-main-container {
    padding: 0.375rem;
  }

  .tool-button {
    padding: 0.5rem 0.25rem;
  }

  .tool-label {
    font-size: 0.6875rem;
  }
}

/* Animaciones */
.tool-button {
  position: relative;
}

.tool-button::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0px;
  width: 2px;
  height: 100%;
  background-color: #2563eb;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.tool-button-active::before {
  opacity: 1;
}
</style>
