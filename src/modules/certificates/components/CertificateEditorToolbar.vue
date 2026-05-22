<template>
  <div class="toolbar-container">
    <!-- Información del documento -->
    <div class="document-info">
      <span
        ref="documentNameEl"
        class="document-name"
        contenteditable="true"
        spellcheck="false"
        title="Click para editar"
        @input="onNameChange"
        @keydown.enter.prevent="blurName"
        @blur="saveName"
      ></span>
    </div>

    <!-- Controles cuando HAY un elemento seleccionado -->
    <div v-if="selectedObject" class="element-controls">
      <!-- Controles de texto -->
      <div v-if="isTextObject" class="text-controls">
        <select :value="textFontFamily" @change="changeFontFamily(($event.target as HTMLSelectElement).value)" class="font-selector">
          <optgroup v-for="category in fontCategories" :key="category.name" :label="category.label">
            <option v-for="font in category.fonts" :key="font.family" :value="font.family" :style="{ fontFamily: font.family }">
              {{ font.name }}
            </option>
          </optgroup>
        </select>

        <input :value="textFontSize" @input="updateTextProperty('fontSize', parseInt(($event.target as HTMLInputElement).value))" type="number" min="8" max="200" class="font-size-input" />

        <div class="text-style-buttons">
          <button @click="toggleBold" :class="['style-button', { active: isBold }]" title="Negrita">
            <AppIcon icon="bold" />
          </button>

          <button @click="toggleItalic" :class="['style-button', { active: isItalic }]" title="Cursiva">
            <AppIcon icon="italic" />
          </button>

          <button @click="toggleUnderline" :class="['style-button', { active: isUnderline }]" title="Subrayado">
            <AppIcon icon="underline" />
          </button>

          <button @click="toggleLinethrough" :class="['style-button', { active: isLinethrough }]" title="Tachado">
            <AppIcon icon="strikethrough" />
          </button>
        </div>

        <button @click="cycleAlignment" class="align-button" :title="'Alineación: ' + textAlign">
          <AppIcon :icon="alignmentIcon" />
        </button>

        <input :value="textColor" @input="updateTextProperty('fill', ($event.target as HTMLInputElement).value)" type="color" class="color-picker" title="Color de Texto" />
      </div>

      <!-- Controles universales -->
      <div class="universal-controls">
        <button @click="duplicateObject" class="action-button" title="Duplicar">
          <AppIcon icon="copy" />
        </button>

        <button @click="deleteObject" class="action-button danger" title="Eliminar">
          <AppIcon icon="trash" />
        </button>
      </div>
    </div>

    <!-- Controles cuando NO hay elemento seleccionado -->
    <div v-else class="general-actions">
      <div class="format-selector-container">
        <div class="format-options">
          <button @click="changeCanvasFormat('A4')" :class="['format-button-compact', { active: canvasFormat === 'A4' }]" title="A4">
            <span>A4</span>
          </button>

          <button @click="changeCanvasFormat('US_LETTER')" :class="['format-button-compact', { active: canvasFormat === 'US_LETTER' }]" title="US Letter">
            <span>Letter</span>
          </button>
        </div>

        <button @click="toggleCanvasOrientation" class="orientation-button" :title="isLandscape ? 'Cambiar a Vertical' : 'Cambiar a Horizontal'">
          <span :class="['orientation-icon', { 'orientation-icon--landscape': !isLandscape }]">
            <AppIcon icon="file-alt" />
          </span>
        </button>
      </div>
    </div>

    <!-- Controles de historial (siempre visibles) -->
    <div class="history-controls">
      <button @click="undo" :disabled="!canUndo" class="action-button" title="Deshacer (Ctrl+Z)">
        <AppIcon icon="undo" />
      </button>

      <button @click="redo" :disabled="!canRedo" class="action-button" title="Rehacer (Ctrl+Y)">
        <AppIcon icon="redo" />
      </button>
    </div>

    <!-- Acciones de documento -->
    <div class="document-actions">
      <button @click="preview" class="control-button success" title="Vista Previa">
        <AppIcon icon="eye" />
        <span>Vista Previa</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

import { useCertificateEditorStore } from '../../../stores/certificateEditor.store';
import AppIcon from '../../../shared/components/AppIcon.vue';
import type { HistoryPlugin, FontPlugin } from '../plugins';

export default defineComponent({
  name: 'CertificateEditorToolbar',
  components: { AppIcon },
  emits: ['preview'],
  setup(_, { emit }) {
    const editorStore = useCertificateEditorStore();
    const editor = computed(() => editorStore.editorInstance);

    const canUndo = ref(false);
    const canRedo = ref(false);
    const selectedObject = ref<any>(null);

    // ✅ Nombre del documento editable (real string)
    const documentName = ref<string>('Nuevo Certificado');
    const documentNameEl = ref<HTMLElement | null>(null);

    const setNameInDom = (value: string) => {
      if (!documentNameEl.value) return;
      documentNameEl.value.innerText = value || 'Nuevo Certificado';
    };

    const blurName = () => {
      documentNameEl.value?.blur();
    };

    const onNameChange = (e: Event) => {
      documentName.value = (e.target as HTMLElement).innerText.trim();
    };

    const saveName = () => {
      const name = documentName.value.trim() || 'Nuevo Certificado';

      documentName.value = name;
      setNameInDom(name);

      // ✅ Aquí guardas en Pinia
      editorStore.setTemplateName(name);
    };

    // Fuentes disponibles desde FontPlugin
    const fontCategories = ref<any[]>([]);

    const loadFontsFromPlugin = () => {
      if (!editor.value) return;
      const fontPlugin = editor.value.getPlugin<FontPlugin>('FontPlugin');
      if (!fontPlugin) return;

      const allFonts = fontPlugin.getAvailableFonts();

      const categories = [
        { name: 'handwriting', label: 'Handwriting', fonts: [] as any[] },
        { name: 'serif', label: 'Serif', fonts: [] as any[] },
        { name: 'sans-serif', label: 'Sans-serif', fonts: [] as any[] },
        { name: 'display', label: 'Display', fonts: [] as any[] },
      ];

      allFonts.forEach((font) => {
        const category = categories.find((c) => c.name === font.category);
        if (category) category.fonts.push(font);
      });

      fontCategories.value = categories.filter((c) => c.fonts.length > 0);
    };

    // Computed
    const canvasFormat = computed(() => editorStore.canvasSize.format);
    const isLandscape = computed(() => editorStore.canvasSize.width > editorStore.canvasSize.height);

    const isTextObject = computed(() => {
      if (!selectedObject.value) return false;
      const type = selectedObject.value.type;
      return type === 'text' || type === 'i-text' || type === 'textbox';
    });

    const textFontFamily = computed(() => selectedObject.value?.fontFamily || 'Arial');
    const textFontSize = computed(() => selectedObject.value?.fontSize || 16);
    const textColor = computed(() => selectedObject.value?.fill || '#000000');
    const isBold = computed(() => selectedObject.value?.fontWeight === 'bold');
    const isItalic = computed(() => selectedObject.value?.fontStyle === 'italic');
    const isUnderline = computed(() => selectedObject.value?.underline === true);
    const isLinethrough = computed(() => selectedObject.value?.linethrough === true);
    const textAlign = computed(() => selectedObject.value?.textAlign || 'left');

    const alignmentIcon = computed(() => {
      switch (textAlign.value) {
        case 'left':
          return 'align-left';
        case 'center':
          return 'align-center';
        case 'right':
          return 'align-right';
        default:
          return 'align-left';
      }
    });

    // Métodos de texto
    const updateTextProperty = (property: string, value: any) => {
      if (!selectedObject.value || !editor.value) return;
      selectedObject.value.set(property, value);
      editor.value.canvas.fire('object:modified', {
        target: selectedObject.value,
      });
      editor.value.canvas.renderAll();
    };

    const changeFontFamily = async (fontFamily: string) => {
      if (!selectedObject.value || !editor.value) return;

      const fontPlugin = editor.value.getPlugin<FontPlugin>('FontPlugin');

      if (fontPlugin) {
        try {
          await fontPlugin.applyFontToSelected(fontFamily);
          editor.value.canvas.fire('object:modified', {
            target: selectedObject.value,
          });
        } catch (error) {
          console.error('Error applying font:', error);
          selectedObject.value.set('fontFamily', fontFamily);
          editor.value.canvas.fire('object:modified', {
            target: selectedObject.value,
          });
          editor.value.canvas.renderAll();
        }
      } else {
        selectedObject.value.set('fontFamily', fontFamily);
        editor.value.canvas.fire('object:modified', {
          target: selectedObject.value,
        });
        editor.value.canvas.renderAll();
      }
    };

    const toggleBold = () => {
      if (!selectedObject.value || !editor.value) return;
      const newWeight = selectedObject.value.fontWeight === 'bold' ? 'normal' : 'bold';
      selectedObject.value.set('fontWeight', newWeight);
      editor.value.canvas.fire('object:modified', {
        target: selectedObject.value,
      });
      editor.value.canvas.renderAll();
    };

    const toggleItalic = () => {
      if (!selectedObject.value || !editor.value) return;
      const newStyle = selectedObject.value.fontStyle === 'italic' ? 'normal' : 'italic';
      selectedObject.value.set('fontStyle', newStyle);
      editor.value.canvas.fire('object:modified', {
        target: selectedObject.value,
      });
      editor.value.canvas.renderAll();
    };

    const toggleUnderline = () => {
      if (!selectedObject.value || !editor.value) return;
      const current = selectedObject.value.underline || false;
      selectedObject.value.set('underline', !current);
      editor.value.canvas.fire('object:modified', {
        target: selectedObject.value,
      });
      editor.value.canvas.renderAll();
    };

    const toggleLinethrough = () => {
      if (!selectedObject.value || !editor.value) return;
      const current = selectedObject.value.linethrough || false;
      selectedObject.value.set('linethrough', !current);
      editor.value.canvas.fire('object:modified', {
        target: selectedObject.value,
      });
      editor.value.canvas.renderAll();
    };

    const cycleAlignment = () => {
      if (!selectedObject.value || !editor.value) return;
      const alignments = ['left', 'center', 'right'];
      const currentIndex = alignments.indexOf(textAlign.value);
      const nextIndex = (currentIndex + 1) % alignments.length;

      selectedObject.value.set('textAlign', alignments[nextIndex]);
      editor.value.canvas.fire('object:modified', {
        target: selectedObject.value,
      });
      editor.value.canvas.renderAll();
    };

    // Métodos de objeto
    const duplicateObject = () => {
      if (!selectedObject.value || !editor.value) return;
      selectedObject.value.clone((cloned: any) => {
        cloned.set({
          left: cloned.left + 20,
          top: cloned.top + 20,
        });
        editor.value!.canvas.add(cloned);
        editor.value!.canvas.setActiveObject(cloned);
        editor.value!.canvas.renderAll();
      });
    };

    const deleteObject = () => {
      if (!editor.value) return;

      const canvas = editor.value.canvas;
      const activeObjects = canvas.getActiveObjects();

      if (!activeObjects || activeObjects.length === 0) {
        console.warn('No hay objetos seleccionados para eliminar');
        return;
      }

      let removedCount = 0;

      activeObjects.forEach((obj: any) => {
        if (obj.id === 'workspace') {
          console.warn('No se puede eliminar el workspace');
          return;
        }
        canvas.remove(obj);
        removedCount++;
      });

      if (removedCount > 0) {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        selectedObject.value = null;
      }
    };

    // Métodos de formato
    const changeCanvasFormat = (format: 'A4' | 'US_LETTER') => {
      editorStore.setCanvasSize(format, isLandscape.value);
    };

    const toggleCanvasOrientation = () => {
      editorStore.setCanvasSize(canvasFormat.value, !isLandscape.value);
    };

    // Historial
    const undo = () => {
      if (!editor.value) return;
      const historyPlugin = editor.value.getPlugin<HistoryPlugin>('HistoryPlugin');
      historyPlugin?.undo();
    };

    const redo = () => {
      if (!editor.value) return;
      const historyPlugin = editor.value.getPlugin<HistoryPlugin>('HistoryPlugin');
      historyPlugin?.redo();
    };

    const updateHistoryState = () => {
      if (!editor.value) return;
      const historyPlugin = editor.value.getPlugin<HistoryPlugin>('HistoryPlugin');
      if (historyPlugin) {
        canUndo.value = historyPlugin.canUndo();
        canRedo.value = historyPlugin.canRedo();
      }
    };

    // Previsualizar
    const preview = () => emit('preview');

    // Eventos de selección
    const handleSelectionCreated = (e: any) => {
      const target = e.selected?.[0] || e.target || null;
      selectedObject.value = target;
    };

    const handleSelectionUpdated = (e: any) => {
      const target = e.selected?.[0] || e.target || null;
      selectedObject.value = target;
    };

    const handleSelectionCleared = () => {
      selectedObject.value = null;
    };

    const handleHistoryChange = () => updateHistoryState();

    // Watch para suscribirse a eventos cuando el editor esté disponible
    watch(
      () => editor.value,
      (newEditor, oldEditor) => {
        if (oldEditor) {
          oldEditor.canvas.off('selection:created', handleSelectionCreated);
          oldEditor.canvas.off('selection:updated', handleSelectionUpdated);
          oldEditor.canvas.off('selection:cleared', handleSelectionCleared);
        }

        if (newEditor) {
          newEditor.canvas.on('selection:created', handleSelectionCreated);
          newEditor.canvas.on('selection:updated', handleSelectionUpdated);
          newEditor.canvas.on('selection:cleared', handleSelectionCleared);

          loadFontsFromPlugin();
        }
      },
      { immediate: true }
    );

    // ✅ Sincroniza el nombre del DOM cuando cambie el template por API / store
    watch(
      () => editorStore.currentTemplate?.name,
      async (name) => {
        const nextName = (name || 'Nuevo Certificado').trim() || 'Nuevo Certificado';
        documentName.value = nextName;
        await nextTick();
        setNameInDom(nextName);
      },
      { immediate: true }
    );
    watch(
      () => editorStore.currentTemplate?.name,
      async (name) => {
        const nextName = (name || 'Nuevo Certificado').trim() || 'Nuevo Certificado';
        documentName.value = nextName;
        await nextTick();
        setNameInDom(nextName);
      },
      { immediate: true }
    );

    onMounted(async () => {
      window.addEventListener('history:changed', handleHistoryChange);
      updateHistoryState();

      // ✅ Inicializa el DOM con el nombre actual
      await nextTick();
      const initialName = (editorStore.currentTemplate?.name || 'Nuevo Certificado').trim() || 'Nuevo Certificado';
      documentName.value = initialName;
      setNameInDom(initialName);
    });

    onUnmounted(() => {
      if (editor.value) {
        editor.value.canvas.off('selection:created', handleSelectionCreated);
        editor.value.canvas.off('selection:updated', handleSelectionUpdated);
        editor.value.canvas.off('selection:cleared', handleSelectionCleared);
      }
      window.removeEventListener('history:changed', handleHistoryChange);
    });

    return {
      // nombre editable
      documentNameEl,
      documentName,
      onNameChange,
      saveName,
      blurName,

      // el resto
      canvasFormat,
      isLandscape,
      selectedObject,
      isTextObject,
      textFontFamily,
      textFontSize,
      textColor,
      isBold,
      isItalic,
      isUnderline,
      isLinethrough,
      textAlign,
      alignmentIcon,
      fontCategories,
      canUndo,
      canRedo,
      updateTextProperty,
      changeFontFamily,
      toggleBold,
      toggleItalic,
      toggleUnderline,
      toggleLinethrough,
      cycleAlignment,
      duplicateObject,
      deleteObject,
      changeCanvasFormat,
      toggleCanvasOrientation,
      undo,
      redo,
      preview,
    };
  },
});
</script>

<style scoped>
.toolbar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1rem;
  height: 100%;
  background-color: white;
  overflow-x: auto;
}

.document-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  margin-right: 1rem;
  padding-right: 1rem;
  border-right: 1px solid #e5e7eb;
  min-width: 240px;
}

.document-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;

  cursor: text;
  outline: none;
  border-bottom: 1px dashed transparent;
}

.document-name:focus {
  border-bottom-color: #2563eb;
}

.element-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.text-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.font-selector {
  min-width: 10rem;
  max-width: 12rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  cursor: pointer;
}

.font-selector option {
  padding: 0.5rem;
}

.font-selector optgroup {
  font-weight: 600;
  font-style: normal;
  color: #6b7280;
  font-family: Arial, sans-serif;
}

.font-size-input {
  width: 4rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  text-align: center;
}

.text-style-buttons {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  overflow: hidden;
}

.style-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: white;
  border: none;
  border-right: 1px solid #d1d5db;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.style-button:last-child {
  border-right: none;
}

.style-button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.style-button.active {
  background-color: #2563eb;
  color: white;
}

.color-picker {
  width: 2rem;
  height: 2rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
}

.universal-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding-left: 1rem;
  border-left: 1px solid #e5e7eb;
}

.general-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.format-selector-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.format-options {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  overflow: hidden;
}

.format-button-compact {
  padding: 0.5rem 0.625rem;
  background-color: white;
  border: none;
  border-right: 1px solid #d1d5db;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 500;
}

.format-button-compact:last-child {
  border-right: none;
}

.format-button-compact:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.format-button-compact.active {
  background-color: #2563eb;
  color: white;
}

.align-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.align-button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.orientation-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.orientation-button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.orientation-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.orientation-icon--landscape {
  transform: rotate(90deg);
}

.history-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding-left: 1rem;
  border-left: 1px solid #e5e7eb;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.action-button:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

.action-button.danger:hover:not(:disabled) {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.document-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  padding-left: 1rem;
  border-left: 1px solid #e5e7eb;
}

.control-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

.control-button.success {
  background-color: #16a34a;
  color: white;
  border-color: #16a34a;
}

.control-button.success:hover {
  background-color: #15803d;
  border-color: #15803d;
}

@media (max-width: 1024px) {
  .toolbar-container {
    padding: 0 0.5rem;
    gap: 0.5rem;
  }

  .control-button span {
    display: none;
  }
}
</style>
