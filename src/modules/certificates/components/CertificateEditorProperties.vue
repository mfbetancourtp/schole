<template>
  <div class="properties-panel">
    <!-- Header del panel -->
    <div class="panel-header">
      <div class="element-info">
        <AppIcon :icon="elementIcon" class="element-icon" />
        <div class="element-details">
          <span class="element-name">{{ elementName }}</span>
          <span class="element-type">{{ elementTypeText }}</span>
        </div>
      </div>
      <button @click="closePanel" class="close-button" title="Cerrar">
        <AppIcon icon="times" />
      </button>
    </div>

    <!-- Contenido del panel -->
    <div class="panel-content" v-if="selectedObject">
      <!-- Propiedades de posición y tamaño -->
      <div class="property-section">
        <h4 class="section-title">Posición y Tamaño</h4>

        <div class="property-grid">
          <div class="property-item">
            <label class="property-label">X</label>
            <input :value="Math.round(selectedObject.left || 0)" @input="updateProperty('left', parseInt(($event.target as HTMLInputElement).value))" type="number" class="property-input" />
          </div>

          <div class="property-item">
            <label class="property-label">Y</label>
            <input :value="Math.round(selectedObject.top || 0)" @input="updateProperty('top', parseInt(($event.target as HTMLInputElement).value))" type="number" class="property-input" />
          </div>

          <div class="property-item">
            <label class="property-label">Ancho</label>
            <input
              :value="Math.round((selectedObject.width || 0) * (selectedObject.scaleX || 1))"
              @change="updateDimension('width', parseInt(($event.target as HTMLInputElement).value))"
              type="number"
              min="10"
              class="property-input"
            />
          </div>

          <div class="property-item">
            <label class="property-label">Alto</label>
            <input
              :value="Math.round((selectedObject.height || 0) * (selectedObject.scaleY || 1))"
              @change="updateDimension('height', parseInt(($event.target as HTMLInputElement).value))"
              type="number"
              min="10"
              class="property-input"
            />
          </div>
        </div>
      </div>

      <!-- Propiedades de transformación -->
      <div class="property-section">
        <h4 class="section-title">Transformación</h4>

        <div class="property-row">
          <label class="property-label">Rotación</label>
          <div class="rotation-control">
            <input :value="selectedObject.angle || 0" @input="updateProperty('angle', parseInt(($event.target as HTMLInputElement).value))" type="range" min="0" max="360" class="rotation-slider" />
            <input
              :value="Math.round(selectedObject.angle || 0)"
              @input="updateProperty('angle', parseInt(($event.target as HTMLInputElement).value))"
              type="number"
              min="0"
              max="360"
              class="rotation-input"
            />
            <span class="rotation-unit">°</span>
          </div>
        </div>

        <div class="property-row">
          <label class="property-label">Opacidad</label>
          <div class="opacity-control">
            <input
              :value="(selectedObject.opacity || 1) * 100"
              @input="updateProperty('opacity', parseFloat(($event.target as HTMLInputElement).value) / 100)"
              type="range"
              min="0"
              max="100"
              class="opacity-slider"
            />
            <input
              :value="Math.round((selectedObject.opacity || 1) * 100)"
              @input="updateProperty('opacity', parseFloat(($event.target as HTMLInputElement).value) / 100)"
              type="number"
              min="0"
              max="100"
              class="opacity-input"
            />
            <span class="opacity-unit">%</span>
          </div>
        </div>
      </div>

      <!-- Propiedades específicas de texto -->
      <div v-if="isTextObject" class="property-section">
        <h4 class="section-title">Tipografía</h4>

        <div class="property-row">
          <label class="property-label">Fuente</label>
          <select :value="selectedObject.fontFamily" @change="updateProperty('fontFamily', ($event.target as HTMLSelectElement).value)" class="property-select">
            <option v-for="font in availableFonts" :key="font" :value="font">
              {{ font }}
            </option>
          </select>
        </div>

        <div class="property-row">
          <label class="property-label">Tamaño</label>
          <div class="size-control">
            <input :value="selectedObject.fontSize || 16" @input="updateProperty('fontSize', parseInt(($event.target as HTMLInputElement).value))" type="range" min="8" max="200" class="size-slider" />
            <input :value="selectedObject.fontSize || 16" @input="updateProperty('fontSize', parseInt(($event.target as HTMLInputElement).value))" type="number" class="size-input" />
          </div>
        </div>

        <div class="property-row">
          <label class="property-label">Color</label>
          <div class="color-control">
            <input :value="selectedObject.fill" @input="updateProperty('fill', ($event.target as HTMLInputElement).value)" type="color" class="color-input" />
            <span class="color-value">{{ selectedObject.fill }}</span>
          </div>
        </div>

        <div class="property-row">
          <label class="property-label">Alineación</label>
          <div class="alignment-buttons">
            <button @click="updateProperty('textAlign', 'left')" :class="{ active: selectedObject.textAlign === 'left' }" title="Izquierda">
              <AppIcon icon="align-left" />
            </button>
            <button @click="updateProperty('textAlign', 'center')" :class="{ active: selectedObject.textAlign === 'center' }" title="Centro">
              <AppIcon icon="align-center" />
            </button>
            <button @click="updateProperty('textAlign', 'right')" :class="{ active: selectedObject.textAlign === 'right' }" title="Derecha">
              <AppIcon icon="align-right" />
            </button>
            <button @click="updateProperty('textAlign', 'justify')" :class="{ active: selectedObject.textAlign === 'justify' }" title="Justificado">
              <AppIcon icon="align-justify" />
            </button>
          </div>
        </div>
      </div>

      <!-- Acciones de capa -->
      <div class="property-section">
        <h4 class="section-title">Organización</h4>
        <div class="layer-actions">
          <button @click="bringToFront" class="layer-button" title="Traer al frente">
            <AppIcon icon="arrow-up" />
            <span>Al frente</span>
          </button>
          <button @click="sendToBack" class="layer-button" title="Enviar al fondo">
            <AppIcon icon="arrow-down" />
            <span>Al fondo</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, onUnmounted } from 'vue';
import { useCertificateEditorStore } from '../../../stores/certificateEditor.store';
import { useEditorUIStore } from '../../../stores/editorUI.store';
import AppIcon from '../../../shared/components/AppIcon.vue';
import type { LayerPlugin } from '../plugins';

export default defineComponent({
  name: 'CertificateEditorProperties',
  components: {
    AppIcon,
  },
  setup() {
    const editorStore = useCertificateEditorStore();
    const uiStore = useEditorUIStore();

    // Usar computed para obtener la instancia del editor desde el store
    const editor = computed(() => editorStore.editorInstance);
    const selectedObject = ref<any>(null);

    // Computed properties
    const isTextObject = computed(() => {
      if (!selectedObject.value) return false;
      const type = selectedObject.value.type;
      return type === 'text' || type === 'i-text' || type === 'textbox';
    });

    const elementName = computed(() => {
      if (!selectedObject.value) return 'Elemento';
      if (isTextObject.value) return (selectedObject.value as any).text?.substring(0, 15) + '...' || 'Texto';
      return selectedObject.value.type;
    });

    const elementTypeText = computed(() => {
      if (!selectedObject.value) return '';
      const type = selectedObject.value.type;
      const types: Record<string, string> = {
        text: 'Texto',
        'i-text': 'Texto Editable',
        textbox: 'Caja de Texto',
        image: 'Imagen',
        rect: 'Rectángulo',
        circle: 'Círculo',
        triangle: 'Triángulo',
      };
      return types[type] || type;
    });

    const elementIcon = computed(() => {
      if (!selectedObject.value) return 'square';
      const type = selectedObject.value.type;
      const icons: Record<string, string> = {
        text: 'font',
        'i-text': 'font',
        textbox: 'font',
        image: 'image',
        rect: 'square',
        circle: 'circle',
        triangle: 'play',
      };
      return icons[type] || 'square';
    });

    const availableFonts = ref([
      'Arial',
      'Times New Roman',
      'Helvetica',
      'Georgia',
      'Verdana',
      'Courier New',
      'Playfair Display',
      'Montserrat',
      'Open Sans',
      'Roboto',
      'Dancing Script',
      'Pacifico',
      'Great Vibes',
    ]);

    // Métodos
    const closePanel = () => {
      uiStore.togglePropertiesPanel();
      if (editor.value) {
        editor.value.canvas.discardActiveObject();
        editor.value.canvas.requestRenderAll();
      }
    };

    const updateProperty = (prop: string, value: any) => {
      if (!selectedObject.value || !editor.value) return;
      selectedObject.value.set(prop, value);
      editor.value.canvas.requestRenderAll();
    };

    const updateDimension = (prop: 'width' | 'height', value: number) => {
      if (!selectedObject.value || !editor.value) return;

      if (selectedObject.value.type === 'image') {
        // Para imágenes, ajustamos la escala
        if (prop === 'width') {
          selectedObject.value.scaleToWidth(value);
        } else {
          selectedObject.value.scaleToHeight(value);
        }
      } else {
        // Para otros objetos, ajustamos la dimensión directamente
        selectedObject.value.set(prop, value);
      }
      editor.value.canvas.requestRenderAll();
    };

    const bringToFront = () => {
      if (!editor.value) return;
      const layerPlugin = editor.value.getPlugin<LayerPlugin>('LayerPlugin');
      layerPlugin?.bringToFront();
    };

    const sendToBack = () => {
      if (!editor.value) return;
      const layerPlugin = editor.value.getPlugin<LayerPlugin>('LayerPlugin');
      layerPlugin?.sendToBack();
    };

    // Event Listeners
    const handleSelectionCreated = (e: any) => {
      selectedObject.value = e.selected?.[0] || null;
    };

    const handleSelectionUpdated = (e: any) => {
      selectedObject.value = e.selected?.[0] || null;
    };

    const handleSelectionCleared = () => {
      selectedObject.value = null;
    };

    const handleObjectModified = () => {
      // Forzar actualización de la vista
      selectedObject.value = { ...selectedObject.value };
    };

    onMounted(() => {
      // Esperar a que el editor esté disponible
      const checkEditor = setInterval(() => {
        if (editor.value) {
          clearInterval(checkEditor);
          editor.value.canvas.on('selection:created', handleSelectionCreated);
          editor.value.canvas.on('selection:updated', handleSelectionUpdated);
          editor.value.canvas.on('selection:cleared', handleSelectionCleared);
          editor.value.canvas.on('object:modified', handleObjectModified);

          // Si ya hay selección, cargarla
          const activeObj = editor.value.canvas.getActiveObject();
          if (activeObj) {
            selectedObject.value = activeObj;
          }
        }
      }, 100);
    });

    onUnmounted(() => {
      if (editor.value) {
        editor.value.canvas.off('selection:created', handleSelectionCreated);
        editor.value.canvas.off('selection:updated', handleSelectionUpdated);
        editor.value.canvas.off('selection:cleared', handleSelectionCleared);
        editor.value.canvas.off('object:modified', handleObjectModified);
      }
    });

    return {
      selectedObject,
      isTextObject,
      elementName,
      elementTypeText,
      elementIcon,
      availableFonts,
      closePanel,
      updateProperty,
      updateDimension,
      bringToFront,
      sendToBack,
    };
  },
});
</script>

<style scoped>
.properties-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.element-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.element-icon {
  font-size: 1.25rem;
  color: #4b5563;
}

.element-details {
  display: flex;
  flex-direction: column;
}

.element-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.element-type {
  font-size: 0.75rem;
  color: #6b7280;
}

.close-button {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.close-button:hover {
  color: #4b5563;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.property-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

.property-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.property-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.property-label {
  font-size: 0.75rem;
  color: #4b5563;
}

.property-input {
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.property-row {
  margin-bottom: 1rem;
}

.rotation-control,
.opacity-control,
.size-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rotation-slider,
.opacity-slider,
.size-slider {
  flex: 1;
}

.rotation-input,
.opacity-input,
.size-input {
  width: 3.5rem;
  padding: 0.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  text-align: center;
}

.rotation-unit,
.opacity-unit {
  font-size: 0.875rem;
  color: #6b7280;
  width: 1rem;
}

.property-select {
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
}

.color-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-input {
  width: 2rem;
  height: 2rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0;
  cursor: pointer;
}

.color-value {
  font-size: 0.875rem;
  color: #4b5563;
  font-family: monospace;
}

.alignment-buttons {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  overflow: hidden;
}

.alignment-buttons button {
  flex: 1;
  background-color: white;
  border: none;
  border-right: 1px solid #d1d5db;
  padding: 0.375rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.alignment-buttons button:last-child {
  border-right: none;
}

.alignment-buttons button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.alignment-buttons button.active {
  background-color: #eff6ff;
  color: #2563eb;
}

.layer-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.layer-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.layer-button:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}
</style>
