import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type ToolType = 'templates' | 'text' | 'image' | 'variable' | 'background' | 'layers';

export interface TextPreset {
  id: string;
  name: string;
  type: 'title' | 'subtitle' | 'text';
  defaultStyles: {
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    color: string;
    textAlign: string;
  };
  defaultContent: string;
}

export interface VariableOption {
  key: string;
  label: string;
  description?: string;
  category: 'user' | 'course' | 'date' | 'institution';
  example: string;
}

export const useEditorUIStore = defineStore('editorUI', () => {
  // Estado reactivo
  const activeTool = ref<ToolType | null>(null);
  const showPropertiesPanel = ref(true);
  const showLayersPanel = ref(false);
  const isEditingText = ref(false);
  const sidebarWidth = ref(10); // Porcentaje
  const secondaryPanelWidth = ref(20); // Porcentaje

  // Presets de texto predefinidos
  const textPresets = ref<TextPreset[]>([
    {
      id: 'title',
      name: 'Título Principal',
      type: 'title',
      defaultStyles: {
        fontSize: 32,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
      },
      defaultContent: 'CERTIFICADO DE RECONOCIMIENTO',
    },
    {
      id: 'subtitle',
      name: 'Subtítulo',
      type: 'subtitle',
      defaultStyles: {
        fontSize: 20,
        fontFamily: 'Arial, sans-serif',
        fontWeight: '600',
        color: '#333333',
        textAlign: 'center',
      },
      defaultContent: 'Se otorga a',
    },
    {
      id: 'text',
      name: 'Texto Simple',
      type: 'text',
      defaultStyles: {
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        color: '#666666',
        textAlign: 'left',
      },
      defaultContent: 'Escriba su texto aquí...',
    },
  ]);

  // Variables dinámicas disponibles
  const availableVariables = ref<VariableOption[]>([
    // Variables de usuario
    {
      key: 'user.name',
      label: 'Nombre del Usuario',
      description: 'Nombre completo del usuario',
      category: 'user',
      example: 'Juan Pérez García',
    },
    {
      key: 'user.email',
      label: 'Email del Usuario',
      category: 'user',
      example: 'juan.perez@email.com',
    },
    {
      key: 'user.id',
      label: 'ID del Usuario',
      category: 'user',
      example: '12345',
    },

    // Variables del curso
    {
      key: 'course.name',
      label: 'Nombre del Curso',
      description: 'Título completo del curso',
      category: 'course',
      example: 'Desarrollo Web Avanzado',
    },
    {
      key: 'course.duration',
      label: 'Duración del Curso',
      category: 'course',
      example: '40 horas académicas',
    },
    {
      key: 'course.instructor',
      label: 'Instructor del Curso',
      category: 'course',
      example: 'Dr. María González',
    },

    // Variables de fecha
    {
      key: 'date.completion',
      label: 'Fecha de Finalización',
      description: 'Fecha en que se completó el curso',
      category: 'date',
      example: '15 de Noviembre, 2024',
    },
    {
      key: 'date.issue',
      label: 'Fecha de Emisión',
      description: 'Fecha de emisión del certificado',
      category: 'date',
      example: '20 de Noviembre, 2024',
    },
    {
      key: 'date.current',
      label: 'Fecha Actual',
      category: 'date',
      example: '21 de Noviembre, 2024',
    },

    // Variables institucionales
    {
      key: 'institution.name',
      label: 'Nombre de la Institución',
      category: 'institution',
      example: 'Academia Kamila Innovation',
    },
    {
      key: 'institution.director',
      label: 'Director de la Institución',
      category: 'institution',
      example: 'Ing. Carlos Rodríguez',
    },
    {
      key: 'certificate.code',
      label: 'Código del Certificado',
      description: 'Código único de verificación',
      category: 'institution',
      example: 'CERT-2024-001234',
    },
  ]);

  // Computed
  const isSecondaryPanelVisible = computed(() => {
    return activeTool.value !== null && activeTool.value !== 'layers';
  });

  const currentTextPresets = computed(() => {
    return textPresets.value;
  });

  const variablesByCategory = computed(() => {
    const grouped: Record<string, VariableOption[]> = {};
    availableVariables.value.forEach((variable) => {
      if (!grouped[variable.category]) {
        grouped[variable.category] = [];
      }
      grouped[variable.category].push(variable);
    });
    return grouped;
  });

  // Métodos
  const setActiveTool = (tool: ToolType | null) => {
    activeTool.value = tool;
    if (tool === 'layers') {
      showLayersPanel.value = true;
    } else {
      showLayersPanel.value = false;
    }
  };

  const togglePropertiesPanel = () => {
    showPropertiesPanel.value = !showPropertiesPanel.value;
  };

  const toggleLayersPanel = () => {
    showLayersPanel.value = !showLayersPanel.value;
    if (showLayersPanel.value) {
      activeTool.value = 'layers';
    }
  };

  const setTextEditMode = (editing: boolean) => {
    isEditingText.value = editing;
  };

  const getTextPresetById = (id: string): TextPreset | undefined => {
    return textPresets.value.find((preset) => preset.id === id);
  };

  const getVariableByKey = (key: string): VariableOption | undefined => {
    return availableVariables.value.find((variable) => variable.key === key);
  };

  const addCustomTextPreset = (preset: Omit<TextPreset, 'id'>) => {
    const newPreset: TextPreset = {
      ...preset,
      id: crypto.randomUUID(),
    };
    textPresets.value.push(newPreset);
    return newPreset;
  };

  const removeTextPreset = (id: string) => {
    const index = textPresets.value.findIndex((preset) => preset.id === id);
    if (index > -1) {
      textPresets.value.splice(index, 1);
    }
  };

  const setSidebarWidth = (width: number) => {
    sidebarWidth.value = Math.max(8, Math.min(15, width)); // Entre 8% y 15%
  };

  const setSecondaryPanelWidth = (width: number) => {
    secondaryPanelWidth.value = Math.max(15, Math.min(30, width)); // Entre 15% y 30%
  };

  const resetUI = () => {
    activeTool.value = null;
    showPropertiesPanel.value = true;
    showLayersPanel.value = false;
    isEditingText.value = false;
  };

  return {
    // Estado
    activeTool,
    showPropertiesPanel,
    showLayersPanel,
    isEditingText,
    sidebarWidth,
    secondaryPanelWidth,
    textPresets,
    availableVariables,

    // Computed
    isSecondaryPanelVisible,
    currentTextPresets,
    variablesByCategory,

    // Métodos
    setActiveTool,
    togglePropertiesPanel,
    toggleLayersPanel,
    setTextEditMode,
    getTextPresetById,
    getVariableByKey,
    addCustomTextPreset,
    removeTextPreset,
    setSidebarWidth,
    setSecondaryPanelWidth,
    resetUI,
  };
});
