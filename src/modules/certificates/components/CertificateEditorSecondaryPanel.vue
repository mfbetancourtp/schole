<template>
  <div class="secondary-panel-container">
    <!-- Header del panel secundario -->
    <div class="panel-header">
      <h3 class="panel-title">{{ panelTitle }}</h3>
    </div>

    <!-- Contenido dinámico según la herramienta activa -->
    <div class="panel-content">
      <!-- Panel de Templates -->
      <!-- por el momento lo dejamos comentado -->
      <!-- <div v-if="uiStore.activeTool === 'templates'" class="templates-section">
        <h4 class="section-title">
          <AppIcon icon="file-alt" />
          Templates
        </h4>

        <div class="templates-grid">
          <div
            v-for="template in sampleTemplates"
            :key="template.id"
            @click="selectTemplate(template)"
            class="template-card"
            :title="template.name"
          >
            <div class="template-preview">
              <div class="template-thumbnail">
                <AppIcon :icon="template.icon" />
              </div>
            </div>
            <div class="template-info">
              <span class="template-name">{{ template.name }}</span>
              <span class="template-description">{{
                template.description
              }}</span>
            </div>
          </div>
        </div>
      </div> -->

      <!-- Panel de Texto -->
      <div v-if="uiStore.activeTool === 'text'" class="text-options">
        <h4 class="section-title">Estilos de Texto</h4>

        <div class="text-presets">
          <button v-for="preset in textPresets" :key="preset.id" @click="addText(preset)" class="preset-button" :title="`Añadir ${preset.name}`">
            <!-- <div class="preset-icon">
              <AppIcon :icon="preset.icon" />
            </div> -->
            <div class="preset-info">
              <span class="preset-name">{{ preset.name }}</span>
              <span class="preset-example" :style="getPresetPreviewStyle(preset)">
                {{ preset.defaultContent }}
              </span>
            </div>
          </button>
        </div>
      </div>

      <!-- Panel de Imagen -->
      <div v-if="uiStore.activeTool === 'image'" class="image-options">
        <h4 class="section-title">Añadir Imagen</h4>

        <div class="image-actions">
          <button @click="triggerImageUpload" class="action-button primary">
            <AppIcon icon="upload" />
            <span>Subir Imagen</span>
          </button>

          <input ref="imageInput" type="file" accept="image/*" @change="handleImageUpload" class="hidden-input" />

          <!-- <div class="url-input-section">
            <input
              v-model="imageUrl"
              type="url"
              placeholder="URL de la imagen..."
              class="url-input"
              @keydown.enter="addImageFromUrl"
            />
            <button
              @click="addImageFromUrl"
              :disabled="!imageUrl"
              class="action-button secondary"
            >
              <AppIcon icon="link" />
            </button>
          </div> -->
        </div>

        <div class="predefined-images">
          <h5 class="subsection-title">Imágenes de Muestra</h5>
          <div class="sample-images-grid">
            <button v-for="sample in sampleImages" :key="sample.id" @click="addImage(sample.url)" class="sample-image-button" :title="''">
              <img :src="sample.url" :alt="''" />
            </button>
          </div>
        </div>
      </div>

      <!-- Panel de Variables -->
      <div v-if="uiStore.activeTool === 'variable'" class="variables-options">
        <h4 class="section-title">
          <AppIcon icon="code" />
          Variables Dinámicas
        </h4>

        <p class="variables-description">Inserta variables que se reemplazarán automáticamente con datos reales al generar los certificados.</p>

        <div class="variables-categories">
          <div v-for="group in parsedVariableGroups" :key="group.code" class="variable-category">
            <!-- Header de categoría -->
            <div class="category-header">
              <AppIcon :icon="group.icon || 'code'" class="category-icon" />
              <h5 class="category-title">
                {{ group.label || group.code }}
              </h5>
            </div>

            <!-- Variables -->
            <div class="variables-grid">
              <button v-for="variable in group.fields" :key="variable.key" @click="addVariable(variable)" class="variable-card" :title="`Insertar ${variable.label}`">
                <div class="variable-card-header">
                  <span class="variable-label">
                    {{ variable.label }}
                  </span>
                  <span class="variable-key">
                    {{ variable.key }}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de Fondo -->
      <div v-if="uiStore.activeTool === 'background'" class="background-options">
        <h4 class="section-title">Fondo del Certificado</h4>

        <div class="background-tabs">
          <button @click="backgroundType = 'color'" :class="['tab-button', { active: backgroundType === 'color' }]">
            <AppIcon icon="palette" />
            Color
          </button>
          <button @click="backgroundType = 'image'" :class="['tab-button', { active: backgroundType === 'image' }]">
            <AppIcon icon="image" />
            Imagen
          </button>
        </div>

        <!-- Selector de color -->
        <div v-if="backgroundType === 'color'" class="color-options">
          <div class="color-picker-section">
            <input v-model="backgroundColor" type="color" class="color-input" @change="updateBackgroundColor" />
            <input v-model="backgroundColor" type="text" class="color-text-input" @blur="updateBackgroundColor" placeholder="#ffffff" />
          </div>

          <div class="preset-colors">
            <button
              v-for="color in presetColors"
              :key="color.name"
              @click="setBackgroundColor(color.value)"
              :style="{ backgroundColor: color.value }"
              class="preset-color-button"
              :title="color.name"
            ></button>
          </div>
        </div>

        <!-- Selector de imagen -->
        <div v-if="backgroundType === 'image'" class="background-image-options">
          <button @click="triggerBackgroundImageUpload" class="action-button primary">
            <AppIcon icon="upload" />
            <span>Subir Imagen de Fondo</span>
          </button>

          <input ref="backgroundImageInput" type="file" accept="image/*" @change="handleBackgroundImageUpload" class="hidden-input" />

          <div class="preset-backgrounds">
            <h5 class="subsection-title">Fondos Predeterminados</h5>
            <div v-if="presetBackgrounds.length > 0" class="backgrounds-grid">
              <button v-for="bg in presetBackgrounds" :key="bg.id" @click="setBackgroundImage(bg.url)" class="background-preset-button" :title="bg.name">
                <img :src="bg.url" :alt="bg.name" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de Capas -->
      <div v-if="uiStore.activeTool === 'layers'" class="layers-options">
        <h4 class="section-title">Gestión de Capas</h4>

        <div class="layers-info">
          <span class="layers-count">{{ canvasObjects.length }} elementos</span>
        </div>

        <LayerList
          v-model:objects="canvasObjects"
          :selected-id="selectedObjectId"
          @select="selectObject"
          @reorder="handleLayerReorder"
          @toggle-lock="handleToggleLock"
          @toggle-visibility="handleToggleVisibility"
          @delete="deleteObject"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onUnmounted, onMounted } from 'vue';
import { useEditorUIStore } from '../../../stores/editorUI.store';
import { useCertificateEditorStore } from '../../../stores/certificateEditor.store';
import AppIcon from '../../../shared/components/AppIcon.vue';
import type { AddBaseTypePlugin, WorkspacePlugin, LayerPlugin } from '../plugins';
import LayerList from './LayerList.vue';
import { GetCertificateVarsService } from '../services/getCertificatesVars.service';
import { CreateFilesUploadService } from '../services/createFilesUpload.service';
import { CreateTemplatesImagesService } from '../services/createFilesUploadImages.service';
import { useRoute } from 'vue-router';
import { GetCertificatesTemplatesService } from '../services/getCertificatesTemplates.service';

const getCertificateVarsService = new GetCertificateVarsService();
const getCertificatesTemplatesService = new GetCertificatesTemplatesService();
const createFilesUploadService = new CreateFilesUploadService();

const createTemplatesImagesService = new CreateTemplatesImagesService();

export default defineComponent({
  name: 'CertificateEditorSecondaryPanel',
  components: {
    AppIcon,
    LayerList,
  },
  props: {
    dataImages: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  setup(props) {
    const editorStore = useCertificateEditorStore();
    const uiStore = useEditorUIStore();
    const route = useRoute();

    const templateId = computed(() => (route.params.id as string) || null);
    // Refs para elementos del DOM
    const imageInput = ref<HTMLInputElement | null>(null);
    const backgroundImageInput = ref<HTMLInputElement | null>(null);
    // Datos predeterminados
    const sampleImages = ref<any[]>([]);
    const presetBackgrounds = ref<any[]>([]);
    // Usar computed para obtener la instancia del editor desde el store de forma reactiva
    const editor = computed(() => editorStore.editorInstance);

    const activeTool = computed(() => uiStore.activeTool);
    const isVisible = computed(() => uiStore.isSecondaryPanelVisible);
    const imageUrl = ref('');
    const backgroundType = ref<'color' | 'image'>('color');
    const backgroundColor = ref('#ffffff');

    // Estado local para objetos del canvas para evitar reactividad recursiva
    const canvasObjects = ref<any[]>([]);

    // ✅ Variable: guardamos lo que trae la API "tal cual"
    const variableGroups = ref<any[]>([]);

    // Actualizar lista de objetos
    const updateCanvasObjects = () => {
      if (!editor.value) {
        canvasObjects.value = [];
        return;
      }
      const objects = editor.value.canvas.getObjects();
      // Filtrar el workspace y obtener solo objetos editables
      // Revertimos (.reverse()) para que el Index 0 del array sea la capa SUPERIOR (Visualmente #1)
      canvasObjects.value = objects
        .filter((obj: any) => obj.id !== 'workspace')
        .map((obj: any) => {
          // Asegurar que el objeto tenga ID para poder encontrarlo después
          if (!obj.id) {
            obj.id = `id-${Math.random().toString(36).substr(2, 9)}`;
          }

          return {
            id: obj.id,
            type: obj.type,
            name: getObjectName(obj),
            visible: obj.visible,
            locked: obj.lockMovementX && obj.lockMovementY,
          };
        })
        .reverse();
    };

    // Observar cambios en el editor para suscribirse a eventos
    watch(
      () => editor.value,
      (newEditor) => {
        if (newEditor) {
          updateCanvasObjects();
          newEditor.canvas.on('object:added', updateCanvasObjects);
          newEditor.canvas.on('object:removed', updateCanvasObjects);
          newEditor.canvas.on('object:modified', updateCanvasObjects);
        }
      },
      { immediate: true }
    );
    watch(
      () => props.dataImages,
      (val) => {
        sampleImages.value = val?.images ?? [];
        presetBackgrounds.value = val?.founds ?? [];
      },
      { immediate: true, deep: true }
    );
    const loadCertificateVariables = async () => {
      try {
        variableGroups.value = await getCertificateVarsService.run();
      } catch (error) {
        console.error('Error cargando variables dinámicas:', error);
        variableGroups.value = [];
      }
    };
    onMounted(() => {
      loadCertificateVariables();
    });
    // ✅ Parse “simple” del campoJson (necesario sí o sí)
    const parsedVariableGroups = computed(() => {
      return (variableGroups.value || []).map((group) => {
        let fields: Array<{ label: string }> = [];
        try {
          fields = JSON.parse(group.campoJson || '{{}}');
        } catch (e) {
          console.warn('campoJson inválido:', group?.code, e);
          fields = [];
        }

        return {
          ...group,
          // Lo dejamos listo para el template
          fields: fields.map((f) => ({
            key: `{{${f.label}}}`,
            label: f.label,
          })),
        };
      });
    });
    // Limpiar eventos al desmontar
    onUnmounted(() => {
      if (editor.value) {
        editor.value.canvas.off('object:added', updateCanvasObjects);
        editor.value.canvas.off('object:removed', updateCanvasObjects);
        editor.value.canvas.off('object:modified', updateCanvasObjects);
      }
    });

    // Presets de texto
    const textPresets = ref([
      {
        id: 1,
        name: 'Título Principal',
        icon: 'heading',
        defaultContent: 'CERTIFICADO',
        fontSize: 48,
        fontFamily: 'Playfair Display',
        fontWeight: 'bold',
        fill: '#000000',
      },
      {
        id: 2,
        name: 'Subtítulo',
        icon: 'text-height',
        defaultContent: 'De Reconocimiento',
        fontSize: 32,
        fontFamily: 'Montserrat',
        fontWeight: '600',
        fill: '#374151',
      },
      {
        id: 3,
        name: 'Texto Normal',
        icon: 'font',
        defaultContent: 'Texto del certificado',
        fontSize: 20,
        fontFamily: 'Open Sans',
        fontWeight: 'normal',
        fill: '#000000',
      },
      {
        id: 4,
        name: 'Firma',
        icon: 'signature',
        defaultContent: 'Firma Autorizada',
        fontSize: 24,
        fontFamily: 'Dancing Script',
        fontWeight: 'normal',
        fill: '#000000',
      },
    ]);

    // Variables dinámicas (ahora con corchetes [])

    const presetColors = ref([
      { name: 'Blanco', value: '#ffffff' },
      { name: 'Negro', value: '#000000' },
      { name: 'Azul', value: '#2563eb' },
      { name: 'Verde', value: '#16a34a' },
      { name: 'Rojo', value: '#dc2626' },
      { name: 'Dorado', value: '#ca8a04' },
      { name: 'Púrpura', value: '#9333ea' },
      { name: 'Gris', value: '#6b7280' },
    ]);

    const sampleTemplates = ref([
      {
        id: 1,
        name: 'Clásico',
        description: 'Certificado tradicional',
        icon: 'scroll',
      },
      {
        id: 2,
        name: 'Moderno',
        description: 'Diseño contemporáneo',
        icon: 'certificate',
      },
      {
        id: 3,
        name: 'Elegante',
        description: 'Estilo profesional',
        icon: 'award',
      },
      {
        id: 4,
        name: 'Diploma',
        description: 'Formato académico',
        icon: 'graduation-cap',
      },
      {
        id: 5,
        name: 'Logro',
        description: 'Reconocimiento especial',
        icon: 'trophy',
      },
      {
        id: 6,
        name: 'Participación',
        description: 'Constancia simple',
        icon: 'handshake',
      },
    ]);

    // Computed
    const panelTitle = computed(() => {
      switch (uiStore.activeTool) {
        case 'text':
          return 'Opciones de Texto';
        case 'image':
          return 'Opciones de Imagen';
        case 'variable':
          return 'Variables Dinámicas';
        case 'background':
          return 'Fondo del Certificado';
        case 'layers':
          return 'Gestión de Capas';
        case 'templates':
          return 'Templates';
        default:
          return 'Herramientas';
      }
    });

    const selectedObjectId = computed(() => editorStore.selectedObjectId);

    // Métodos de texto
    const addText = (preset: any) => {
      if (!editor.value) return;
      const plugin = editor.value.getPlugin<AddBaseTypePlugin>('AddBaseTypePlugin');
      plugin?.addText({
        text: preset.defaultContent,
        fontSize: preset.fontSize,
        fontFamily: preset.fontFamily,
        fontWeight: preset.fontWeight,
        fill: preset.fill,
      });
    };

    const getPresetPreviewStyle = (preset: any) => {
      return {
        fontSize: '0.75rem',
        fontFamily: preset.fontFamily,
        fontWeight: preset.fontWeight,
        color: preset.fill,
      };
    };

    // Métodos de imagen
    const triggerImageUpload = () => {
      imageInput.value?.click();
    };

    const handleImageUpload = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file && editor.value) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const response = await createFilesUploadService.run({ file: file });
          await createTemplatesImagesService.run({
            url: response.data.url,
            type: 'images',
            certificateTemplateId: Number(templateId.value),
          });
          await loadTemplateImages();
          const imageUrl = response.data.url;
          const plugin = editor.value!.getPlugin<AddBaseTypePlugin>('AddBaseTypePlugin');
          await plugin?.addImage({ src: imageUrl });
        };
        reader.readAsDataURL(file);
      }
    };

    const loadTemplateImages = async () => {
      try {
        // 1️⃣ metadata del certificado (trae urlJsonTemplate)
        const certificate = await getCertificatesTemplatesService.run(Number(templateId.value));
        const logoObj = certificate?.institution?.logo ? { url: certificate.institution.logo, type: 'images' } : null;

        const logoInstitutionalObj = certificate?.institution?.logoInstitutional ? { url: certificate.institution.logoInstitutional, type: 'images' } : null;
        const extras = [logoObj, logoInstitutionalObj].filter(Boolean) as any[];
        // Unimos + evitamos duplicados por url
        const mergedImages = [...(certificate?.images ?? []), ...extras.filter((x) => !(certificate?.images ?? []).some((img: any) => img.url === x.url))];
        console.log('mergedImages Images:', mergedImages);
        await editorStore.importImages(mergedImages);

        const exportedImages = editorStore.exportImages();
        sampleImages.value = exportedImages.images;
        presetBackgrounds.value = exportedImages.founds ?? [];
      } catch (error) {
        console.error('❌ Error loading template:', error);
        editorStore.initializeTemplate();
      }
    };
    const addImageFromUrl = async () => {
      if (imageUrl.value && editor.value) {
        const plugin = editor.value.getPlugin<AddBaseTypePlugin>('AddBaseTypePlugin');
        await plugin?.addImage({ src: imageUrl.value });
        imageUrl.value = '';
      }
    };

    const addImage = async (src: string) => {
      if (!editor.value) return;
      const plugin = editor.value.getPlugin<AddBaseTypePlugin>('AddBaseTypePlugin');
      await plugin?.addImage({ src });
    };

    // Métodos de variables
    const addVariable = (variable: any) => {
      if (!editor.value) return;
      const plugin = editor.value.getPlugin<AddBaseTypePlugin>('AddBaseTypePlugin');
      plugin?.addText({
        text: variable.key, // Ahora inserta la variable con corchetes [nombre]
        fontSize: 20,
        fontFamily: 'Open Sans',
        fill: '#2563eb', // Color azul para distinguir las variables
        fontWeight: '600',
      });
    };

    const formatCategoryName = (category: string) => {
      const names: Record<string, string> = {
        user: 'Datos del Usuario',
        course: 'Información del Curso',
        date: 'Fechas',
        institution: 'Datos de la Institución',
      };
      return names[category] || category;
    };

    const getVariableIcon = (category: string) => {
      const icons: Record<string, string> = {
        user: 'user',
        course: 'graduation-cap',
        date: 'calendar',
        institution: 'building',
      };
      return icons[category] || 'code';
    };

    // Métodos de fondo
    const updateBackgroundColor = () => {
      if (!editor.value) return;
      editor.value.setBackgroundColor(backgroundColor.value);
    };

    const setBackgroundColor = (color: string) => {
      backgroundColor.value = color;
      updateBackgroundColor();
    };

    const triggerBackgroundImageUpload = () => {
      backgroundImageInput.value?.click();
    };

    const handleBackgroundImageUpload = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file && editor.value) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const response = await createFilesUploadService.run({ file: file });
          await createTemplatesImagesService.run({
            url: response.data.url,
            type: 'founds',
            certificateTemplateId: Number(templateId.value),
          });
          const imageUrl = response.data.url;
          await loadTemplateImages();
          setBackgroundImage(imageUrl);
        };
        reader.readAsDataURL(file);
      }
    };

    const setBackgroundImage = (url: string) => {
      if (!editor.value) return;
      editor.value.setBackgroundImage(url);
    };

    // Métodos de capas
    const selectObject = (objectId: string) => {
      if (!editor.value) return;
      const objects = editor.value.canvas.getObjects();
      const obj = objects.find((o: any) => o.id === objectId || o.name === objectId);
      if (obj) {
        editor.value.canvas.setActiveObject(obj);
        editor.value.canvas.renderAll();
      }
    };

    const deleteObject = (objectId: string) => {
      if (!editor.value) return;
      const objects = editor.value.canvas.getObjects();
      const obj = objects.find((o: any) => o.id === objectId || o.name === objectId);
      if (obj) {
        // Usar el plugin de eliminación para consistencia
        const deletePlugin = editor.value.getPlugin<any>('DeleteHotKeyPlugin');
        if (deletePlugin) {
          deletePlugin.deleteObject(obj);
        } else {
          // Fallback: eliminar directamente pero verificar workspace
          if ((obj as any).id !== 'workspace') {
            editor.value.canvas.remove(obj);
            editor.value.canvas.renderAll();
          }
        }
      }
    };

    const getObjectIcon = (type: string) => {
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
    };

    const getObjectName = (obj: any) => {
      return obj.name || obj.text || `${formatObjectType(obj.type)}`;
    };

    const formatObjectType = (type: string) => {
      const types: Record<string, string> = {
        text: 'Texto',
        'i-text': 'Texto',
        textbox: 'Texto',
        image: 'Imagen',
        rect: 'Rectángulo',
        circle: 'Círculo',
        triangle: 'Triángulo',
      };
      return types[type] || type;
    };

    // Métodos de gestión de capas
    const moveLayerUp = (index: number) => {
      if (!editor.value || index === 0) return;
      const layerPlugin = editor.value.getPlugin<LayerPlugin>('LayerPlugin');
      const objectToMove = getObjectById(canvasObjects.value[index].id);
      if (objectToMove && layerPlugin) {
        layerPlugin.bringForward(objectToMove);
      }
    };

    const moveLayerDown = (index: number) => {
      if (!editor.value || index === canvasObjects.value.length - 1) return;
      const layerPlugin = editor.value.getPlugin<LayerPlugin>('LayerPlugin');
      const objectToMove = getObjectById(canvasObjects.value[index].id);
      if (objectToMove && layerPlugin) {
        layerPlugin.sendBackward(objectToMove);
      }
    };

    const bringLayerToFront = (objectId: string) => {
      if (!editor.value) return;
      const layerPlugin = editor.value.getPlugin<LayerPlugin>('LayerPlugin');
      const objectToMove = getObjectById(objectId);
      if (objectToMove && layerPlugin) {
        layerPlugin.bringToFront(objectToMove);
      }
    };

    const sendLayerToBack = (objectId: string) => {
      if (!editor.value) return;
      const layerPlugin = editor.value.getPlugin<LayerPlugin>('LayerPlugin');
      const objectToMove = getObjectById(objectId);
      if (objectToMove && layerPlugin) {
        layerPlugin.sendToBack(objectToMove);
      }
    };

    const getObjectById = (objectId: string) => {
      if (!editor.value) return null;
      const objects = editor.value.canvas.getObjects();
      return objects.find((o: any) => o.id === objectId || o.name === objectId);
    };

    // --- Nuevos handlers para LayerList ---

    const handleLayerReorder = (newOrderedList: any[]) => {
      if (!editor.value) return;

      // La lista llega ordenada visualmente (Top -> Bottom)
      // Fabric necesita ordenamiento Bottom -> Top (z-index ascendente)
      // Iteramos la lista visual al revés (empezando por el fondo) y asignamos índices

      const bottomUp = [...newOrderedList].reverse();

      // Asumimos que Workspace está en índice 0 siempre
      // Si hubiera otros objetos de fondo fijos, habría que calcular el offset
      let currentIndex = 1;

      bottomUp.forEach((item) => {
        const obj = getObjectById(item.id);
        if (obj) {
          // moveObjectTo solo cambia el z-index si es diferente
          editor.value!.canvas.moveTo(obj, currentIndex);
          currentIndex++;
        }
      });

      editor.value.canvas.renderAll();
    };

    const handleToggleLock = (item: any) => {
      const obj = getObjectById(item.id);
      if (obj) {
        const newLockState = !item.locked;
        // Bloquear movimiento, rotación y escalado
        obj.set({
          lockMovementX: newLockState,
          lockMovementY: newLockState,
          lockRotation: newLockState,
          lockScalingX: newLockState,
          lockScalingY: newLockState,
          selectable: !newLockState, // Opcional: ¿queremos poder seleccionarlo aunque esté bloqueado?
          evented: !newLockState, // Si está bloqueado, ¿deja pasar clicks a lo de abajo?
        });

        // Si queremos que sea seleccionable pero estático, selectable=true
        // Por ahora lo hacemos totalmente bloqueado (fondo)

        // Actualizamos estado local optimista
        item.locked = newLockState;

        editor.value?.canvas.renderAll();
      }
    };

    const handleToggleVisibility = (item: any) => {
      const obj = getObjectById(item.id);
      if (obj) {
        obj.visible = !obj.visible;
        // Si ocultamos el objeto seleccionado, deseleccionar
        if (!obj.visible && editorStore.selectedObjectId === (obj as any).id) {
          editor.value?.canvas.discardActiveObject();
          editorStore.selectedObjectId = null;
        }
        item.visible = obj.visible;
        editor.value?.canvas.requestRenderAll();
      }
    };

    // Templates
    const selectTemplate = (template: any) => {
      // TODO: Implementar carga de template
    };

    return {
      uiStore,
      editorStore,
      imageInput,
      backgroundImageInput,
      imageUrl,
      backgroundType,
      backgroundColor,
      textPresets,
      variableGroups,
      parsedVariableGroups,
      sampleImages,
      presetColors,
      presetBackgrounds,
      sampleTemplates,
      panelTitle,
      canvasObjects,
      selectedObjectId,
      addText,
      getPresetPreviewStyle,
      triggerImageUpload,
      handleImageUpload,
      addImageFromUrl,
      addImage,
      addVariable,
      formatCategoryName,
      getVariableIcon,
      updateBackgroundColor,
      setBackgroundColor,
      triggerBackgroundImageUpload,
      handleBackgroundImageUpload,
      setBackgroundImage,
      selectObject,
      deleteObject,
      getObjectIcon,
      getObjectName,
      formatObjectType,
      moveLayerUp,
      moveLayerDown,
      bringLayerToFront,
      handleLayerReorder,
      handleToggleLock,
      handleToggleVisibility,
      selectTemplate,
    };
  },
});
</script>

<style scoped>
.secondary-panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f9fafb;
}

/* Header */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

/* Content */
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.subsection-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin: 1rem 0 0.5rem 0;
}

/* Text Presets */
.text-presets {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preset-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.preset-button:hover {
  border-color: var(--color-primary);
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.1);
}

.preset-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  color: #6b7280;
}

.preset-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.preset-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.preset-example {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Image Options */
.image-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.action-button.primary {
  background-color: var(--color-primary);
  color: white;
}

.action-button.primary:hover {
  background-color: #1d4ed8;
}

.action-button.secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-button.secondary:hover {
  background-color: #e5e7eb;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.url-input-section {
  display: flex;
  gap: 0.5rem;
}

.url-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.url-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.sample-images-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.sample-image-button {
  aspect-ratio: 1;
  padding: 0;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.sample-image-button:hover {
  border-color: var(--color-primary);
  transform: scale(1.05);
}

.sample-image-button img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Variables */
.variables-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-left: 3px solid var(--color-primary);
  border-radius: 0.375rem;
}

.variables-categories {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.variable-category {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f3f4f6;
}

.category-icon {
  color: var(--color-primary);
  font-size: 1.125rem;
}

.category-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.variables-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.variable-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.variable-card:hover {
  background-color: #eff6ff;
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.1);
}

.variable-card-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.variable-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  /* 👇 CLAVE */
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  max-width: 100%;
}

.variable-key {
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
  color: var(--color-primary);
  background-color: #dbeafe;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 600;

  /* 👇 CLAVE */
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  max-width: 100%;
}

.variable-card-footer {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.variable-example-label {
  font-size: 0.625rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.variable-example {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

/* Background Options */
.background-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.tab-button:hover {
  border-color: #d1d5db;
}

.tab-button.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.color-picker-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.color-input {
  width: 4rem;
  height: 3rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
}

.color-text-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.preset-colors {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.preset-color-button {
  aspect-ratio: 1;
  border: 2px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-color-button:hover {
  transform: scale(1.1);
  border-color: var(--color-primary);
}

.backgrounds-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.background-preset-button {
  aspect-ratio: 1.414;
  padding: 0;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.background-preset-button:hover {
  border-color: var(--color-primary);
  transform: scale(1.05);
}

.background-preset-button img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Layers */
.layers-info {
  margin-bottom: 1rem;
}

.layers-count {
  font-size: 0.875rem;
  color: #6b7280;
}

.layers-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.layer-item:hover {
  border-color: #d1d5db;
}

.layer-item.active {
  border-color: var(--color-primary);
  background-color: #eff6ff;
}

.layer-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  color: #6b7280;
}

.layer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.layer-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.layer-type {
  font-size: 0.75rem;
  color: #6b7280;
}

.layer-controls {
  display: flex;
  gap: 0.25rem;
}

.control-button {
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
}

.control-button:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.control-button.delete:hover {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.control-button.layer-move {
  border: 1px solid #d1d5db;
  background-color: white;
}

.control-button.layer-move:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.control-button.layer-move:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.control-button.layer-priority {
  border: 1px solid #d1d5db;
  background-color: white;
}

.control-button.layer-priority:hover {
  background-color: #eff6ff;
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Templates */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.template-card {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.1);
}

.template-preview {
  margin-bottom: 0.5rem;
}

.template-thumbnail {
  aspect-ratio: 1.414;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  font-size: 2rem;
  color: #6b7280;
}

.template-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.template-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.template-description {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Hidden input */
.hidden-input {
  display: none;
}
</style>
