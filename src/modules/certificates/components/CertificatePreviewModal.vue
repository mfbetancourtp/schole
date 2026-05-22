<template>
  <AppFormModal :title="'Vista Previa del Certificado'">
    <template v-slot:content>
      <div class="preview-content-wrapper">
        <!-- Sidebar: Variables -->
        <div class="preview-sidebar">
          <h3 class="sidebar-title">Variables Dinámicas</h3>

          <div v-if="variables.length === 0" class="no-variables">
            <AppIcon icon="code" class="no-variables__icon" />
            <p>No se encontraron variables en el diseño.</p>
            <p class="hint">Usa variable en tus textos.</p>
          </div>

          <div v-else class="variables-list">
            <div v-for="variable in variables" :key="variable.key" class="variable-item">
              <!-- Mostrar literal {{key}} -->
              <label class="variable-label" v-text="'{{' + variable.key + '}}'"></label>

              <AppInput v-model="variable.value" :placeholder="`Ingrese ${variable.key}`" @update:modelValue="updatePreview" />
            </div>
          </div>
        </div>

        <!-- Preview Area -->
        <div class="preview-area">
          <div v-if="isLoading" class="loading-overlay">
            <div class="spinner"></div>
            <p>Cargando vista previa...</p>
          </div>

          <div class="canvas-container">
            <canvas ref="previewCanvas"></canvas>
          </div>
        </div>
      </div>
    </template>

    <template v-slot:actions>
      <AppButton label="Exportar PNG" variant="primary" icon="image" @click="exportImage" />
      <AppButton label="Exportar JSON" variant="primary" outlined icon="file-code" @click="exportJSON" />
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick, onMounted } from 'vue';
import { fabric } from 'fabric';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';

interface Variable {
  key: string;
  value: string;
}

export default defineComponent({
  name: 'CertificatePreviewModal',
  components: { AppFormModal, AppIcon, AppButton, AppInput },
  props: {
    initialJson: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const previewCanvas = ref<HTMLCanvasElement | null>(null);
    const fabricCanvas = ref<fabric.StaticCanvas | null>(null);
    const variables = ref<Variable[]>([]);
    const isLoading = ref(false);

    // Dimensiones por defecto (A4 Landscape)
    const DEFAULT_WIDTH = 1123;
    const DEFAULT_HEIGHT = 794;

    // Inicializar canvas
    const initCanvas = async () => {
      if (!previewCanvas.value) return;

      isLoading.value = true;

      // Destruir instancia anterior si existe
      if (fabricCanvas.value) {
        fabricCanvas.value.dispose();
      }

      // Crear nueva instancia estática
      fabricCanvas.value = new fabric.StaticCanvas(previewCanvas.value, {
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        backgroundColor: '#ffffff',
        enableRetinaScaling: true,
        renderOnAddRemove: false,
      });

      // Cargar JSON del canvas
      if (props.initialJson && (props.initialJson as any).canvas && (props.initialJson as any).canvas.objects && (props.initialJson as any).canvas.objects.length > 0) {
        const canvasJson = JSON.parse(JSON.stringify((props.initialJson as any).canvas));

        if (canvasJson.viewportTransform) delete canvasJson.viewportTransform;
        if (canvasJson.clipPath) delete canvasJson.clipPath;
        if (!canvasJson.background) canvasJson.background = '#ffffff';

        await new Promise<void>((resolve) => {
          fabricCanvas.value?.loadFromJSON(canvasJson, () => {
            const objects = fabricCanvas.value?.getObjects() || [];
            objects.forEach((obj: any) => {
              obj.objectCaching = false;
              obj.setCoords();

              if (obj.id === 'workspace') {
                fabricCanvas.value?.sendToBack(obj);
              } else {
                fabricCanvas.value?.bringToFront(obj);
              }
            });

            resolve();
          });
        });
      } else {
        console.warn('⚠️ No canvas data found or objects array is empty');

        const defaultWorkspace = new fabric.Rect({
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
          fill: '#ffffff',
          id: 'workspace',
          selectable: false,
          evented: false,
        } as any);

        fabricCanvas.value?.add(defaultWorkspace);
        fabricCanvas.value?.sendToBack(defaultWorkspace);
      }

      // Configurar fondo si existe en el template (y no en el canvas)
      if ((props.initialJson as any)?.template?.background && !fabricCanvas.value?.backgroundImage) {
        const bg = (props.initialJson as any).template.background;
        if (bg.type === 'image' && bg.value) {
          try {
            await new Promise<void>((resolve) => {
              fabric.Image.fromURL(
                bg.value,
                (img) => {
                  if (img && fabricCanvas.value) {
                    const cvs = fabricCanvas.value as any;
                    const scaleX = (cvs.width || DEFAULT_WIDTH) / (img.width || 1);
                    const scaleY = (cvs.height || DEFAULT_HEIGHT) / (img.height || 1);

                    fabricCanvas.value.setBackgroundImage(
                      img,
                      () => {
                        fabricCanvas.value?.renderAll();
                        resolve();
                      },
                      {
                        scaleX,
                        scaleY,
                        originX: 'left',
                        originY: 'top',
                        crossOrigin: 'anonymous',
                      }
                    );
                  } else {
                    resolve();
                  }
                },
                { crossOrigin: 'anonymous' }
              );
            });
          } catch (e) {
            console.error('Error loading background image', e);
          }
        }
      }

      extractVariables();

      requestAnimationFrame(() => {
        fitToContainer();
        fabricCanvas.value?.renderAll();
        isLoading.value = false;
      });
    };

    // Ajustar canvas al contenedor
    const fitToContainer = () => {
      if (!fabricCanvas.value || !previewCanvas.value) return;

      const container = previewCanvas.value.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth || 800;
      const containerHeight = container.clientHeight || 600;

      let contentWidth = DEFAULT_WIDTH;
      let contentHeight = DEFAULT_HEIGHT;

      const objects = fabricCanvas.value.getObjects();
      const workspace = objects.find((obj: any) => obj.id === 'workspace');

      if (workspace) {
        contentWidth = (workspace.width || 0) * (workspace.scaleX || 1);
        contentHeight = (workspace.height || 0) * (workspace.scaleY || 1);
      } else {
        const cvs = fabricCanvas.value as any;
        contentWidth = cvs.width || DEFAULT_WIDTH;
        contentHeight = cvs.height || DEFAULT_HEIGHT;
      }

      const scaleX = containerWidth / contentWidth;
      const scaleY = containerHeight / contentHeight;
      const scale = Math.min(scaleX, scaleY) * 0.95;

      fabricCanvas.value.setDimensions({
        width: contentWidth * scale,
        height: contentHeight * scale,
      });

      fabricCanvas.value.setZoom(scale);
      fabricCanvas.value.renderAll();
    };

    // ✅ Extraer variables del texto: {{variable}} (y opcional [variable])
    const extractVariables = () => {
      if (!fabricCanvas.value) return;

      const vars = new Set<string>();
      const objects = fabricCanvas.value.getObjects();

      objects.forEach((obj: any) => {
        if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
          const text = obj.text || '';

          // Nuevo: {{ variable }}
          const curlyMatches = text.match(/\{\{\s*([^}]+?)\s*\}\}/g);
          if (curlyMatches) {
            curlyMatches.forEach((match: string) => {
              const varName = match.replace(/^\{\{\s*|\s*\}\}$/g, '').trim();
              if (varName) vars.add(varName);
            });
          }

          // Viejo (opcional): [variable]
          const bracketMatches = text.match(/\[\s*([^\]]+?)\s*\]/g);
          if (bracketMatches) {
            bracketMatches.forEach((match: string) => {
              const varName = match.replace(/^\[\s*|\s*\]$/g, '').trim();
              if (varName) vars.add(varName);
            });
          }
        }
      });

      variables.value = Array.from(vars).map((key) => ({
        key,
        value: getExampleValue(key),
      }));

      if (variables.value.length > 0) {
        updatePreview();
      }
    };

    // Obtener valor de ejemplo para una variable
    const getExampleValue = (varName: string): string => {
      const examples: Record<string, string> = {
        nombre: 'Juan Pérez',
        name: 'Juan Pérez',
        fecha: new Date().toLocaleDateString('es-ES'),
        date: new Date().toLocaleDateString('es-ES'),
        curso: 'Desarrollo Web',
        course: 'Desarrollo Web',
        instructor: 'María García',
        duracion: '40 horas',
        duration: '40 hours',
        nota: '95',
        grade: '95',
        documento: '123456789',
        institucion: 'Academia Tech',
        director: 'Dr. Carlos Ruiz',
        año: new Date().getFullYear().toString(),
        mes: new Date().toLocaleString('es-ES', { month: 'long' }),
        'estudiante.identificacion': '1020304050',
        'estudiante.nombre': 'Juan Pérez',
      };

      const lowerVarName = varName.toLowerCase();
      for (const [key, value] of Object.entries(examples)) {
        if (lowerVarName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerVarName)) {
          return value;
        }
      }

      return `Ejemplo ${varName}`;
    };

    // ✅ Actualizar vista previa: reemplaza {{key}} (y opcional [key])
    const updatePreview = () => {
      if (!fabricCanvas.value) return;

      const objects = fabricCanvas.value.getObjects();

      objects.forEach((obj: any) => {
        if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
          if (!obj._originalText) {
            obj._originalText = obj.text;
          }

          let newText = obj._originalText;

          variables.value.forEach((v) => {
            const escapedKey = v.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // Nuevo: {{ variable }}
            const regexCurly = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'g');
            newText = newText.replace(regexCurly, v.value || `{{${v.key}}}`);

            // Viejo (opcional): [variable]
            const regexBracket = new RegExp(`\\[\\s*${escapedKey}\\s*\\]`, 'g');
            newText = newText.replace(regexBracket, v.value || `[${v.key}]`);
          });

          // Corrección de alineación
          if (obj.originX === 'center' && (obj.textAlign === 'left' || !obj.textAlign)) {
            const centerPoint = obj.getPointByOrigin('center', obj.originY);
            const leftPoint = centerPoint.x - obj.getScaledWidth() / 2;

            obj.set({
              originX: 'left',
              left: leftPoint,
            });
          }

          obj.set('text', newText);
        }
      });

      fabricCanvas.value.renderAll();
    };

    // Exportar Imagen
    const exportImage = () => {
      if (!fabricCanvas.value) return;

      const dataURL = fabricCanvas.value.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2,
      });

      const link = document.createElement('a');
      link.download = 'certificado-preview.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Exportar JSON
    const exportJSON = () => {
      const json = JSON.stringify(props.initialJson, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = 'certificado-template.json';
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    // Watchers
    watch(
      () => props.initialJson,
      () => {
        nextTick(() => {
          initCanvas();
        });
      },
      { deep: true, immediate: false }
    );

    onMounted(() => {
      nextTick(() => {
        initCanvas();
      });
    });

    return {
      previewCanvas,
      variables,
      isLoading,
      updatePreview,
      exportImage,
      exportJSON,
    };
  },
});
</script>

<style scoped>
.preview-content-wrapper {
  display: flex;
  gap: 1.5rem;
  min-height: 500px;
  max-height: 70vh;
}

.preview-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.sidebar-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6c757d;
  margin: 0 0 0.5rem 0;
}

.no-variables {
  text-align: center;
  padding: 2rem 1rem;
  color: #adb5bd;
}

.no-variables__icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  display: block;
  text-align: center;
}

.no-variables p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
}

.hint {
  font-size: 0.75rem;
  color: #ced4da;
}

.variables-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.variable-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.variable-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
}

.preview-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1rem;
  position: relative;
  overflow: auto;
  min-width: 0;
}

.canvas-container {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-container canvas {
  max-width: 100%;
  max-height: 100%;
  height: auto !important;
  background: white;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 10;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e9ecef;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 992px) {
  .preview-content-wrapper {
    flex-direction: column;
  }

  .preview-sidebar {
    width: 100%;
    max-height: 200px;
  }

  .preview-area {
    min-height: 400px;
  }
}
</style>
