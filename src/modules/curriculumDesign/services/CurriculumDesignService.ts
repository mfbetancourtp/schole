import { CurriculumPlanDto } from '../dtos/CurriculumPlanDto';
import { CurriculumFormatDto } from '../dtos/CurriculumFormatDto';
import { ProgramTypeDto } from '../dtos/ProgramTypeDto';
import { OperationalSchemeDto } from '../dtos/OperationalSchemeDto';

const STORAGE_KEYS = {
  FORMATS: 'akademia_curriculum_formats',
  PROGRAM_TYPES: 'akademia_program_types',
  OPERATIONAL_SCHEMES: 'akademia_operational_schemes',
};

const initialFormats: CurriculumFormatDto[] = [
  { id: 1, code: 'F-001', description: 'Formato de Microcurrículo' },
  { id: 2, code: 'F-002', description: 'Formato de Guía de Cátedra' },
  { id: 3, code: 'F-003', description: 'Formato de Sílabo' },
];

const initialProgramTypes: ProgramTypeDto[] = [
  {
    id: 1,
    code: 'PRE',
    description: 'Pregrado',
    specification: 'Programas de nivel técnico, tecnológico y profesional',
    isCurricular: true,
    status: 'active',
    classWeeks: 16,
    evaluationWeeks: 1,
    credits: 161,
    semesterHours: 510,
    semesters: 3,
  },
  {
    id: 2,
    code: 'POS',
    description: 'Posgrado',
    specification: 'Programas de especialización y maestría',
    isCurricular: true,
    status: 'active',
    classWeeks: 16,
    evaluationWeeks: 1,
    credits: 120,
    semesterHours: 360,
    semesters: 4,
  },
  {
    id: 3,
    code: 'CEL',
    description: 'Educación Continua',
    specification: 'Cursos, diplomados y talleres',
    isCurricular: false,
    status: 'draft',
    classWeeks: 4,
    evaluationWeeks: 0,
    credits: 0,
    semesterHours: 40,
    semesters: 1,
  },
];

const initialSchemes: OperationalSchemeDto[] = [];

// Helper para persistencia
const getFromStorage = <T>(key: string, initial: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : initial;
};

const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

let localFormats = getFromStorage(STORAGE_KEYS.FORMATS, initialFormats);
let localProgramTypes = getFromStorage(STORAGE_KEYS.PROGRAM_TYPES, initialProgramTypes);
// Cargar esquemas operativos locales y limpiar ejemplos antiguos
let localSchemes: OperationalSchemeDto[] = getFromStorage(STORAGE_KEYS.OPERATIONAL_SCHEMES, initialSchemes);

// MIGRACIÓN: Eliminar esquemas de ejemplo antiguos si existen
const hasExampleSchemes = localSchemes.some((s) => s.id === 1 || s.id === 2);
if (hasExampleSchemes) {
  localSchemes = localSchemes.filter((s) => s.id !== 1 && s.id !== 2);
  saveToStorage(STORAGE_KEYS.OPERATIONAL_SCHEMES, localSchemes);
}

export class CurriculumDesignService {
  async getCurriculumPlans(): Promise<CurriculumPlanDto[]> {
    return [
      {
        id: 1,
        name: 'Plan de Ingeniería de Sistemas 2024',
        code: 'IS-2024',
        description: 'Plan de estudios actualizado para la carrera de Ingeniería.',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  async getFormats(params: any): Promise<any> {
    let filtered = [...localFormats];

    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter((f) => f.code.toLowerCase().includes(search) || f.description.toLowerCase().includes(search));
    }

    return {
      data: filtered,
      total: filtered.length,
      page: 1,
    };
  }

  async getProgramTypes(params: any): Promise<any> {
    let filtered = [...localProgramTypes];

    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter((p) => p.code.toLowerCase().includes(search) || p.description.toLowerCase().includes(search) || p.specification.toLowerCase().includes(search));
    }

    return {
      data: filtered,
      total: filtered.length,
      page: 1,
    };
  }

  async getOperationalSchemes(programTypeId: number): Promise<OperationalSchemeDto[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return localSchemes.filter((s) => s.programTypeId === programTypeId);
  }

  async createFormat(data: CurriculumFormatDto): Promise<void> {
    const newFormat = { ...data, id: Date.now() };
    localFormats.push(newFormat);
    saveToStorage(STORAGE_KEYS.FORMATS, localFormats);
  }

  async updateFormat(id: number, data: CurriculumFormatDto): Promise<void> {
    const index = localFormats.findIndex((f) => f.id === id);
    if (index !== -1) {
      localFormats[index] = { ...data };
      saveToStorage(STORAGE_KEYS.FORMATS, localFormats);
    }
  }

  async deleteFormat(id: number): Promise<void> {
    localFormats = localFormats.filter((f) => f.id !== id);
    saveToStorage(STORAGE_KEYS.FORMATS, localFormats);
  }

  async createProgramType(data: ProgramTypeDto): Promise<void> {
    const newType = { ...data, id: Date.now() };
    localProgramTypes.push(newType);
    saveToStorage(STORAGE_KEYS.PROGRAM_TYPES, localProgramTypes);
  }

  async updateProgramType(id: number, data: ProgramTypeDto): Promise<void> {
    const index = localProgramTypes.findIndex((p) => p.id === id);
    if (index !== -1) {
      localProgramTypes[index] = { ...data };
      saveToStorage(STORAGE_KEYS.PROGRAM_TYPES, localProgramTypes);
    }
  }

  async deleteProgramType(id: number): Promise<void> {
    localProgramTypes = localProgramTypes.filter((p) => p.id !== id);
    saveToStorage(STORAGE_KEYS.PROGRAM_TYPES, localProgramTypes);
  }

  async createOperationalScheme(data: OperationalSchemeDto): Promise<void> {
    if (data.id > 0) {
      const index = localSchemes.findIndex((s) => s.id === data.id);
      if (index !== -1) {
        localSchemes[index] = { ...data };
      }
    } else {
      const newScheme = {
        ...data,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      localSchemes.push(newScheme);
    }
    saveToStorage(STORAGE_KEYS.OPERATIONAL_SCHEMES, localSchemes);
  }

  async updateOperationalScheme(data: OperationalSchemeDto): Promise<void> {
    const index = localSchemes.findIndex((s) => s.id === data.id);
    if (index !== -1) {
      localSchemes[index] = { ...data };
      saveToStorage(STORAGE_KEYS.OPERATIONAL_SCHEMES, localSchemes);
    }
  }

  async deleteOperationalScheme(id: number): Promise<void> {
    localSchemes = localSchemes.filter((s) => s.id !== id);
    saveToStorage(STORAGE_KEYS.OPERATIONAL_SCHEMES, localSchemes);
  }
}
