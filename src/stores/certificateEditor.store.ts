import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { EditorCore } from '../modules/certificates/core';

export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string;
  size: {
    width: number;
    height: number;
    format: 'A4' | 'US_LETTER' | 'CUSTOM';
  };
  background?: {
    type: 'color' | 'image';
    value: string;
  };
  images?: Array<{
    id: string;
    url: string;
    type?: string;
  }>;
  founds?: Array<{
    id: string;
    url: string;
    type?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export const useCertificateEditorStore = defineStore('certificateEditor', () => {
  // Estado reactivo
  const currentTemplate = ref<CertificateTemplate | null>(null);
  const currentImages = ref<[]>([]);
  const selectedObjectId = ref<string | null>(null);
  const editorInstance = ref<EditorCore | null>(null);

  const canvasSize = ref<{
    width: number;
    height: number;
    format: 'A4' | 'US_LETTER' | 'CUSTOM';
  }>({
    width: 1123, // A4 landscape default
    height: 794,
    format: 'A4',
  });

  // Computed
  const canvasBackground = computed(() => {
    return currentTemplate.value?.background || { type: 'color', value: '#ffffff' };
  });

  // Métodos principales
  const initializeTemplate = (template?: Partial<CertificateTemplate>) => {
    const defaultTemplate: CertificateTemplate = {
      id: crypto.randomUUID(),
      name: 'Nuevo Certificado',
      size: {
        width: 1123,
        height: 794,
        format: 'A4',
      },
      background: {
        type: 'color',
        value: '#ffffff',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    currentTemplate.value = { ...defaultTemplate, ...template };
    canvasSize.value = currentTemplate.value.size;
  };

  const setCanvasSize = (format: 'A4' | 'US_LETTER' | 'CUSTOM', landscape?: boolean, customSize?: { width: number; height: number }) => {
    let width: number, height: number;

    switch (format) {
      case 'A4':
        width = 1123;
        height = 794;
        break;
      case 'US_LETTER':
        width = 1056;
        height = 816;
        break;
      case 'CUSTOM':
        if (customSize) {
          width = customSize.width;
          height = customSize.height;
        } else {
          return;
        }
        break;
      default:
        return;
    }

    // Si landscape es false, intercambiar dimensiones para orientación vertical
    if (landscape === false) {
      [width, height] = [height, width];
    }

    canvasSize.value = { width, height, format };

    if (currentTemplate.value) {
      currentTemplate.value.size = canvasSize.value;
      currentTemplate.value.updatedAt = new Date();
    }
  };

  const setBackground = (background: { type: 'color' | 'image'; value: string }) => {
    if (currentTemplate.value) {
      currentTemplate.value.background = background;
      currentTemplate.value.updatedAt = new Date();
    }

    // Aplicar al editor si está disponible
    if (editorInstance.value) {
      if (background.type === 'color') {
        editorInstance.value.setBackgroundColor(background.value);
      } else {
        editorInstance.value.setBackgroundImage(background.value);
      }
    }
  };
  const setTemplateName = (name: string) => {
    if (!currentTemplate.value) return;

    const clean = name.trim() || 'Nuevo Certificado';

    currentTemplate.value.name = clean;
    currentTemplate.value.updatedAt = new Date();
  };

  const exportToJSON = (): any | null => {
    if (!editorInstance.value) return null;

    return {
      template: currentTemplate.value,
      canvas: editorInstance.value.toJSON(),
    };
  };

  const importFromJSON = async (data: any): Promise<void> => {
    console.log('Importing from JSON hola:', data);
    if (data.template) {
      currentTemplate.value = data.template;
      canvasSize.value = data.template.size;
    }

    if (data.canvas && editorInstance.value) {
      await editorInstance.value.fromJSON(data.canvas);
    }

    console.log('currentTemplate.value holi', currentTemplate.value);
  };
  const importImages = async (data: any): Promise<void> => {
    if (data) {
      currentImages.value = data;
    }
    console.log('Imported images currentTemplate:', currentImages.value);
    console.log('Imported images:', data);
  };
  const exportImages = (): any | null => {
    const data = currentImages.value;
    console.log('currentImages.value', currentImages.value);

    return {
      images: data?.filter((img: any) => img.type === 'images') || [],
      founds: data?.filter((img: any) => img.type === 'founds') || [],
    };
  };
  const clearTemplate = () => {
    currentTemplate.value = null;
    selectedObjectId.value = null;
    canvasSize.value = { width: 1123, height: 794, format: 'A4' };

    if (editorInstance.value && editorInstance.value.canvas) {
      editorInstance.value.clear();
    }
  };

  const exportToHTMLFromJSON = async (params?: { template?: any; canvas?: any }): Promise<string> => {
    const data = params?.template && params?.canvas ? params : exportToJSON();

    if (!data?.template || !data?.canvas) {
      console.warn('❌ No hay template o canvas para convertir a HTML');
      return '';
    }

    // 🔥 Import dinámico para evitar líos de ESM/TS con fabric
    const fabricModule: any = await import('fabric');
    const fabric: any = fabricModule.fabric ?? fabricModule;

    const template = data.template;
    const canvasJson = data.canvas;

    // medidas
    const width = template.width ?? template.size?.width ?? 1123;
    const height = template.height ?? template.size?.height ?? 794;

    // background (color o imagen)
    const bgType = template.background?.type ?? 'color';
    const bgValue = template.backgroundColor ?? template.background?.value ?? '#ffffff';

    const backgroundStyle = bgType === 'image' ? `background-image:url('${bgValue}'); background-size:cover; background-position:center; background-repeat:no-repeat;` : `background:${bgValue};`;

    // Canvas offscreen
    const offscreenEl = document.createElement('canvas');
    offscreenEl.width = width;
    offscreenEl.height = height;

    const c = new fabric.Canvas(offscreenEl, {
      renderOnAddRemove: false,
      backgroundColor: bgType === 'color' ? bgValue : undefined,
    });

    // Si quieres que el SVG no dependa del background del wrapper,
    // puedes forzar el background de Fabric también cuando sea imagen,
    // pero normalmente el wrapper es suficiente.
    await new Promise<void>((resolve) => {
      c.loadFromJSON(canvasJson, () => {
        c.renderAll();
        resolve();
      });
    });

    const svg = c.toSVG();

    const html = `
      <div style="
        width:${width}px;
        height:${height}px;
        ${backgroundStyle}
        overflow:hidden;
        position:relative;
      ">
        ${svg}
      </div>
    `.trim();

    c.dispose();

    return html;
  };

  return {
    // Estado
    currentTemplate,
    selectedObjectId,
    editorInstance,
    canvasSize,

    // Computed
    canvasBackground,

    // Métodos
    initializeTemplate,
    setCanvasSize,
    setBackground,
    setTemplateName,
    exportToJSON,
    importFromJSON,
    clearTemplate,
    importImages,
    exportToHTMLFromJSON,
    exportImages,
  };
});
