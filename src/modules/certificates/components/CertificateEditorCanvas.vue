<template>
  <div class="canvas-wrapper">
    <!-- Área del lienzo -->
    <div
      class="canvas-area"
      ref="canvasArea"
      :style="{
        '--canvas-width': canvasSize.width,
        '--canvas-height': canvasSize.height,
      }"
    >
      <!-- Canvas de Fabric.js -->
      <canvas ref="fabricCanvas"></canvas>
    </div>

    <!-- Controles de zoom -->
    <div class="zoom-controls">
      <button class="zoom-button" @click="zoomOut" title="Alejar (Ctrl -)">
        <AppIcon icon="search-minus" />
      </button>
      <button class="zoom-button" @click="zoomToFit" title="Ajustar al viewport (Ctrl 0)">
        <AppIcon icon="compress" />
      </button>
      <button class="zoom-button" @click="zoomToActual" title="Tamaño real 100% (Ctrl 1)">
        <AppIcon icon="expand" />
      </button>
      <button class="zoom-button" @click="zoomIn" title="Acercar (Ctrl +)">
        <AppIcon icon="search-plus" />
      </button>
      <div class="zoom-percentage">{{ zoomPercentage }}%</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, shallowRef, computed, onMounted, onUnmounted, provide, watch, markRaw } from 'vue';
import { fabric } from 'fabric';
import { EditorCore } from '../core';
import { WorkspacePlugin, HistoryPlugin, FontPlugin, AddBaseTypePlugin, LayerPlugin, CenterAlignPlugin, CopyPlugin, DeleteHotKeyPlugin, SnapGuidesPlugin } from '../plugins';
import { useCertificateEditorStore } from '../../../stores/certificateEditor.store';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'CertificateEditorCanvas',
  components: {
    AppIcon,
  },
  setup() {
    const editorStore = useCertificateEditorStore();

    const canvasArea = ref<HTMLElement>();
    const fabricCanvas = ref<HTMLCanvasElement>();
    const editor = shallowRef<EditorCore>();
    const currentZoom = ref<number>(1);
    const resizeObserver = ref<ResizeObserver>();

    // Computed
    const canvasSize = computed(() => editorStore.canvasSize);
    const zoomPercentage = computed(() => Math.round(currentZoom.value * 100));

    // Métodos
    const initializeEditor = () => {
      if (!fabricCanvas.value) return;

      // Crear instancia del editor
      editor.value = markRaw(
        new EditorCore(fabricCanvas.value, {
          width: canvasSize.value.width,
          height: canvasSize.value.height,
          backgroundColor: '#ffffff',
        })
      );

      // Registrar plugins
      editor.value!.registerPlugin(new WorkspacePlugin());
      editor.value!.registerPlugin(new HistoryPlugin());
      const fontPlugin = new FontPlugin();
      editor.value!.registerPlugin(fontPlugin);
      editor.value!.registerPlugin(new AddBaseTypePlugin());
      editor.value!.registerPlugin(new LayerPlugin());
      editor.value!.registerPlugin(new CenterAlignPlugin());
      editor.value!.registerPlugin(new CopyPlugin());
      editor.value!.registerPlugin(new DeleteHotKeyPlugin());
      editor.value!.registerPlugin(new SnapGuidesPlugin());

      // Cargar todas las fuentes de Google Fonts
      fontPlugin.loadAllFonts().catch((error) => {
        console.warn('Some fonts failed to load:', error);
      });

      // Guardar referencia del editor en el store
      editorStore.editorInstance = editor.value;

      // Configurar eventos
      setupEditorEvents();
      setupZoomEvents();

      // Ajustar canvas al área disponible
      setTimeout(() => {
        resizeCanvasToContainer();
        autoFit();
      }, 100);

      // Iniciar observador de resize
      initResizeObserver();
    };

    const setupEditorEvents = () => {
      if (!editor.value) return;

      editor.value.on('selection:created', (obj) => {
        editorStore.selectedObjectId = (obj as any).id || null;
      });

      editor.value.on('selection:updated', (obj) => {
        editorStore.selectedObjectId = (obj as any).id || null;
      });

      editor.value.on('selection:cleared', () => {
        editorStore.selectedObjectId = null;
      });

      window.addEventListener('history:changed', (e: Event) => {
        // Handle history events
      });
    };

    /**
     * Configurar eventos de zoom
     */
    const setupZoomEvents = () => {
      if (!editor.value) return;

      // Zoom con rueda del mouse
      editor.value.canvas.on('mouse:wheel', (opt: any) => {
        const delta = opt.e.deltaY;
        let zoom = editor.value!.canvas.getZoom();

        // Fórmula suave para zoom con mouse wheel
        zoom *= 0.999 ** delta;

        // Limitar zoom entre 10% y 200%
        zoom = Math.min(Math.max(0.1, zoom), 2);

        // Aplicar zoom hacia el centro del canvas
        const center = editor.value!.canvas.getCenter();
        editor.value!.canvas.zoomToPoint({ x: center.left, y: center.top }, zoom);

        currentZoom.value = zoom;
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });
    };

    /**
     * Inicializar ResizeObserver para detectar cambios de tamaño
     */
    const initResizeObserver = () => {
      if (!canvasArea.value) return;

      resizeObserver.value = new ResizeObserver(() => {
        // Cuando cambia el tamaño del contenedor, recalcular
        resizeCanvasToContainer();
        autoFit();
      });

      resizeObserver.value.observe(canvasArea.value);
    };

    /**
     * Obtener el punto central del canvas
     */
    const getCenterPoint = () => {
      if (!editor.value) return { x: 0, y: 0 };
      const center = editor.value.canvas.getCenter();
      return { x: center.left, y: center.top };
    };

    /**
     * 📺 Ajustar el CANVAS HTML al tamaño del contenedor (dinámico)
     * El workspace (certificado) mantiene su tamaño FIJO
     */
    const resizeCanvasToContainer = () => {
      if (!editor.value || !canvasArea.value) return;

      const containerRect = canvasArea.value.getBoundingClientRect();

      // El canvas HTML se adapta al contenedor
      editor.value.canvas.setDimensions({
        width: containerRect.width,
        height: containerRect.height,
      });

      editor.value.canvas.calcOffset();
      editor.value.centerWorkspace();
    };

    /**
     * 🎯 Auto Fit - Ajustar zoom automáticamente usando findScaleToFit
     * Calcula la escala óptima y aplica zoom al 85% para dejar márgenes
     */
    const autoFit = () => {
      if (!editor.value || !canvasArea.value) return;

      const containerRect = canvasArea.value.getBoundingClientRect();
      const realWidth = canvasSize.value.width;
      const realHeight = canvasSize.value.height;

      // Resetear viewport para asegurar cálculos limpios
      editor.value.canvas.viewportTransform = [1, 0, 0, 1, 0, 0];

      // Crear objeto temporal para calcular la escala
      const workspace = {
        width: realWidth,
        height: realHeight,
      };

      const container = {
        width: containerRect.width,
        height: containerRect.height,
      };

      // Usar fabric.util.findScaleToFit para calcular la escala óptima
      const scale = (fabric as any).util.findScaleToFit(workspace, container);

      // Aplicar zoom al 85% para dejar márgenes
      const zoomLevel = scale * 0.85;

      // Aplicar zoom y centrar la cámara en el workspace
      editor.value.canvas.setZoom(zoomLevel);
      editor.value.centerWorkspace();

      // Actualizar recorte (Clipping)
      editor.value.updateClipping();

      currentZoom.value = zoomLevel;
      editor.value.canvas.renderAll();
    };

    /**
     * ➕ Acercar (Zoom In) - Incremento de 5%
     */
    const zoomIn = () => {
      if (!editor.value) return;
      let zoom = editor.value.canvas.getZoom();
      zoom += 0.05; // +5%
      zoom = Math.min(zoom, 2); // Máximo 200%

      const center = getCenterPoint();
      editor.value.canvas.zoomToPoint(center, zoom);
      currentZoom.value = zoom;
    };

    /**
     * ➖ Alejar (Zoom Out) - Decremento de 5%
     */
    const zoomOut = () => {
      if (!editor.value) return;
      let zoom = editor.value.canvas.getZoom();
      zoom -= 0.05; // -5%
      zoom = Math.max(zoom, 0.1); // Mínimo 10%

      const center = getCenterPoint();
      editor.value.canvas.zoomToPoint(center, zoom);
      currentZoom.value = zoom;
    };

    /**
     * 🎯 Ajustar al Viewport (Auto Fit)
     */
    const zoomToFit = () => {
      autoFit();
    };

    /**
     * 🔄 Zoom 1:1 (100% - Tamaño Real)
     */
    const zoomToActual = () => {
      if (!editor.value) return;
      const center = getCenterPoint();
      editor.value.canvas.zoomToPoint(center, 1);
      currentZoom.value = 1;
    };

    // Watch para cambios en el tamaño del canvas
    watch(
      canvasSize,
      (newSize) => {
        if (editor.value) {
          const workspace = editor.value.getPlugin<WorkspacePlugin>('WorkspacePlugin');
          workspace?.setCanvasSize(newSize.width, newSize.height);
          autoFit();
        }
      },
      { deep: true }
    );

    // Lifecycle
    onMounted(() => {
      initializeEditor();

      // Asegurar que el contenedor tenga foco para eventos de teclado
      if (canvasArea.value) {
        canvasArea.value.addEventListener('click', () => {
          canvasArea.value?.focus();
        });
      }
    });

    onUnmounted(() => {
      // Limpiar ResizeObserver
      if (resizeObserver.value) {
        resizeObserver.value.disconnect();
      }

      if (editor.value) {
        editor.value.destroy();
      }
    });

    return {
      canvasArea,
      fabricCanvas,
      canvasSize,
      zoomPercentage,
      zoomIn,
      zoomOut,
      zoomToFit,
      zoomToActual,
    };
  },
});
</script>

<style scoped>
.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem; /* Padding horizontal para que no quede pegado a los lados */
  background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.canvas-area {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  overflow: hidden;
}

.canvas-area canvas {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

/* Información del lienzo */
.canvas-info {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
  z-index: 100;
}

.canvas-dimensions {
  font-weight: 600;
}

.canvas-format {
  color: #d1d5db;
}

/* Controles de zoom */
.zoom-controls {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.25rem;
  background-color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  z-index: 100;
}

.zoom-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 600;
}

.zoom-button:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}

.zoom-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-button i {
  font-size: 0.875rem;
}

.zoom-percentage {
  padding: 0.375rem 0.75rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  font-family: 'Courier New', monospace;
  min-width: 3.5rem;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .canvas-area {
    padding: 1rem;
  }

  .canvas-info {
    font-size: 0.6875rem;
    bottom: 0.5rem;
    left: 0.5rem;
  }

  .zoom-controls {
    bottom: 0.5rem;
    right: 0.5rem;
    padding: 0.375rem;
  }

  .zoom-button {
    width: 1.75rem;
    height: 1.75rem;
  }
}

/* Asegurar que el contenedor de Fabric tenga prioridad */
:deep(.canvas-container) {
  z-index: 10;
}
</style>
