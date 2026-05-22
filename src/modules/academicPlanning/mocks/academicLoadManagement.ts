import type { LoadAssignment, LoadAssignmentState, LoadingRule, PreviousPeriodSummary, SelectOption, TeacherAvailabilityState, TeacherBankTeacher } from '../dtos/academicLoadManagement.dto';

export const academicLoadPeriodOptions: SelectOption<string>[] = [
  { id: '2026-1', name: '2026-1' },
  { id: '2026-2', name: '2026-2' },
  { id: '2025-2', name: '2025-2' },
  { id: '2025-1', name: '2025-1' },
];

export const academicLoadProgramOptions: SelectOption<string>[] = [
  { id: 'Ingeniería de Sistemas', name: 'Ingeniería de Sistemas' },
  { id: 'Ingeniería Civil', name: 'Ingeniería Civil' },
  { id: 'Medicina', name: 'Medicina' },
  { id: 'Derecho', name: 'Derecho' },
];

export const academicLoadSemesterOptions: SelectOption<number>[] = [
  { id: 1, name: 'Semestre 1' },
  { id: 2, name: 'Semestre 2' },
  { id: 3, name: 'Semestre 3' },
];

export const academicLoadStateOptions: SelectOption<LoadAssignmentState>[] = [
  { id: 'asignado', name: 'Asignado' },
  { id: 'pendiente', name: 'Pendiente' },
  { id: 'error', name: 'Con conflicto' },
];

export const academicLoadAvailabilityOptions: SelectOption<TeacherAvailabilityState>[] = [
  { id: 'disponible', name: 'Disponible' },
  { id: 'cercano', name: 'Cercano al límite' },
  { id: 'completo', name: 'Sin disponibilidad' },
];

export const academicLoadContractOptions: SelectOption<string>[] = [
  { id: 'Tiempo Completo', name: 'Tiempo Completo' },
  { id: 'Medio Tiempo', name: 'Medio Tiempo' },
  { id: 'Cátedra', name: 'Cátedra' },
  { id: 'Ocasional', name: 'Ocasional' },
];

export const previousPeriodsSummary: Record<string, PreviousPeriodSummary> = {
  '2025-2': { asignaturas: 45, docentes: 18, completado: 100 },
  '2025-1': { asignaturas: 42, docentes: 16, completado: 100 },
  '2024-2': { asignaturas: 40, docentes: 15, completado: 100 },
};

export const teacherBankTeachersMock: TeacherBankTeacher[] = [
  {
    id: 1,
    nombre: 'Dr. Juan Pérez García',
    tipoContrato: 'Tiempo Completo',
    horasAsignadas: 20,
    horasMaximas: 24,
    estado: 'cercano',
    programa: 'Ingeniería de Sistemas',
    asignaturas: [
      { nombre: 'Matemáticas I', grupo: 'A', horas: 4 },
      { nombre: 'Cálculo Diferencial', grupo: 'B', horas: 5 },
      { nombre: 'Álgebra Lineal', grupo: 'C', horas: 4 },
      { nombre: 'Geometría Analítica', grupo: 'A', horas: 4 },
      { nombre: 'Matemáticas Discretas', grupo: 'B', horas: 3 },
    ],
  },
  {
    id: 2,
    nombre: 'Dra. María García López',
    tipoContrato: 'Tiempo Completo',
    horasAsignadas: 16,
    horasMaximas: 24,
    estado: 'disponible',
    programa: 'Ingeniería Civil',
    asignaturas: [
      { nombre: 'Física General', grupo: 'A', horas: 5 },
      { nombre: 'Mecánica Clásica', grupo: 'B', horas: 5 },
      { nombre: 'Termodinámica', grupo: 'A', horas: 6 },
    ],
  },
  {
    id: 3,
    nombre: 'Dr. Carlos López Martínez',
    tipoContrato: 'Medio Tiempo',
    horasAsignadas: 14,
    horasMaximas: 16,
    estado: 'cercano',
    programa: 'Medicina',
    asignaturas: [
      { nombre: 'Química Orgánica', grupo: 'A', horas: 4 },
      { nombre: 'Bioquímica', grupo: 'B', horas: 5 },
      { nombre: 'Química Analítica', grupo: 'C', horas: 5 },
    ],
  },
  {
    id: 4,
    nombre: 'Ing. Ana Martínez Silva',
    tipoContrato: 'Cátedra',
    horasAsignadas: 12,
    horasMaximas: 12,
    estado: 'completo',
    programa: 'Ingeniería de Sistemas',
    asignaturas: [
      { nombre: 'Programación I', grupo: 'A', horas: 6 },
      { nombre: 'Estructuras de Datos', grupo: 'B', horas: 6 },
    ],
  },
  {
    id: 5,
    nombre: 'MSc. Pedro Sánchez Ruiz',
    tipoContrato: 'Medio Tiempo',
    horasAsignadas: 8,
    horasMaximas: 16,
    estado: 'disponible',
    programa: 'Ingeniería de Sistemas',
    asignaturas: [
      { nombre: 'Base de Datos', grupo: 'A', horas: 4 },
      { nombre: 'Sistemas Distribuidos', grupo: 'B', horas: 4 },
    ],
  },
  {
    id: 6,
    nombre: 'Dra. Laura Ramírez Torres',
    tipoContrato: 'Tiempo Completo',
    horasAsignadas: 18,
    horasMaximas: 24,
    estado: 'disponible',
    programa: 'Derecho',
    asignaturas: [
      { nombre: 'Estadística Aplicada', grupo: 'A', horas: 4 },
      { nombre: 'Probabilidad', grupo: 'B', horas: 4 },
      { nombre: 'Investigación Operativa', grupo: 'C', horas: 5 },
      { nombre: 'Análisis Cuantitativo', grupo: 'A', horas: 5 },
    ],
  },
  {
    id: 7,
    nombre: 'Dr. Roberto Fernández Castro',
    tipoContrato: 'Tiempo Completo',
    horasAsignadas: 24,
    horasMaximas: 24,
    estado: 'completo',
    programa: 'Ingeniería Civil',
    asignaturas: [
      { nombre: 'Resistencia de Materiales', grupo: 'A', horas: 6 },
      { nombre: 'Mecánica de Suelos', grupo: 'B', horas: 6 },
      { nombre: 'Estructuras I', grupo: 'C', horas: 6 },
      { nombre: 'Diseño Estructural', grupo: 'A', horas: 6 },
    ],
  },
  {
    id: 8,
    nombre: 'Ing. Sofia Vargas Mendoza',
    tipoContrato: 'Cátedra',
    horasAsignadas: 4,
    horasMaximas: 12,
    estado: 'disponible',
    programa: 'Ingeniería de Sistemas',
    asignaturas: [{ nombre: 'Desarrollo Web', grupo: 'A', horas: 4 }],
  },
];

export const loadAssignmentsMock: LoadAssignment[] = [
  {
    id: 1,
    codigo: 'MAT101',
    nombre: 'Matemáticas I',
    grupo: 'A',
    semestre: 1,
    intensidadHoraria: 4,
    docenteId: 1,
    tipoContrato: 'Tiempo Completo',
    estado: 'asignado',
    periodo: '2026-1',
    programa: 'Ingeniería de Sistemas',
  },
  {
    id: 9,
    codigo: 'MAT101',
    nombre: 'Matemáticas I',
    grupo: 'B',
    semestre: 1,
    intensidadHoraria: 4,
    docenteId: 2,
    tipoContrato: 'Tiempo Completo',
    estado: 'asignado',
    periodo: '2026-1',
    programa: 'Ingeniería de Sistemas',
  },
  {
    id: 2,
    codigo: 'FIS201',
    nombre: 'Física General',
    grupo: 'A',
    semestre: 2,
    intensidadHoraria: 5,
    docenteId: 2,
    tipoContrato: 'Tiempo Completo',
    estado: 'asignado',
    periodo: '2026-1',
    programa: 'Ingeniería de Sistemas',
  },
  {
    id: 3,
    codigo: 'QUI301',
    nombre: 'Química Orgánica',
    grupo: 'A',
    semestre: 3,
    intensidadHoraria: 4,
    docenteId: null,
    tipoContrato: '-',
    estado: 'pendiente',
    periodo: '2026-1',
    programa: 'Ingeniería de Sistemas',
  },
  {
    id: 4,
    codigo: 'PRO102',
    nombre: 'Programación I',
    grupo: 'A',
    semestre: 1,
    intensidadHoraria: 6,
    docenteId: 4,
    tipoContrato: 'Cátedra',
    estado: 'error',
    periodo: '2026-1',
    programa: 'Ingeniería de Sistemas',
  },
  {
    id: 10,
    codigo: 'PRO102',
    nombre: 'Programación I',
    grupo: 'B',
    semestre: 1,
    intensidadHoraria: 6,
    docenteId: null,
    tipoContrato: '-',
    estado: 'pendiente',
    periodo: '2026-1',
    programa: 'Ingeniería de Sistemas',
  },
  {
    id: 11,
    codigo: 'PRO102',
    nombre: 'Programación I',
    grupo: 'C',
    semestre: 1,
    intensidadHoraria: 6,
    docenteId: 5,
    tipoContrato: 'Medio Tiempo',
    estado: 'asignado',
    periodo: '2026-1',
    programa: 'Ingeniería de Sistemas',
  },
  {
    id: 5,
    codigo: 'BDD202',
    nombre: 'Base de Datos',
    grupo: 'A',
    semestre: 2,
    intensidadHoraria: 4,
    docenteId: 5,
    tipoContrato: 'Medio Tiempo',
    estado: 'asignado',
    periodo: '2026-1',
    programa: 'Ingeniería de Sistemas',
  },
  {
    id: 6,
    codigo: 'EST301',
    nombre: 'Estadística Aplicada',
    grupo: 'A',
    semestre: 3,
    intensidadHoraria: 4,
    docenteId: 6,
    tipoContrato: 'Tiempo Completo',
    estado: 'asignado',
    periodo: '2026-1',
    programa: 'Ingeniería de Sistemas',
    esTransversal: true,
  },
  {
    id: 7,
    codigo: 'CAL103',
    nombre: 'Cálculo Diferencial',
    grupo: 'A',
    semestre: 1,
    intensidadHoraria: 5,
    docenteId: null,
    tipoContrato: '-',
    estado: 'pendiente',
    periodo: '2026-1',
    programa: 'Ingeniería de Sistemas',
  },
  {
    id: 8,
    codigo: 'ALG104',
    nombre: 'Álgebra Lineal',
    grupo: 'A',
    semestre: 1,
    intensidadHoraria: 4,
    docenteId: 3,
    tipoContrato: 'Tiempo Completo',
    estado: 'asignado',
    periodo: '2026-1',
    programa: 'Ingeniería de Sistemas',
  },
];

export const loadingRulesMock: LoadingRule[] = [
  {
    id: 1,
    tipoContrato: 'Tiempo Completo',
    horasMaximas: 24,
    horasMinimas: 20,
    descripcion: 'Docentes con contrato de tiempo completo deben cumplir entre 20 y 24 horas semanales de carga académica.',
    activa: true,
  },
  {
    id: 2,
    tipoContrato: 'Medio Tiempo',
    horasMaximas: 16,
    horasMinimas: 12,
    descripcion: 'Docentes con contrato de medio tiempo deben cumplir entre 12 y 16 horas semanales.',
    activa: true,
  },
  {
    id: 3,
    tipoContrato: 'Cátedra',
    horasMaximas: 12,
    horasMinimas: 4,
    descripcion: 'Docentes de cátedra pueden tener entre 4 y 12 horas semanales de carga.',
    activa: true,
  },
  {
    id: 4,
    tipoContrato: 'Ocasional',
    horasMaximas: 10,
    horasMinimas: 4,
    descripcion: 'Contrato ocasional para cubrir necesidades específicas y temporales.',
    activa: false,
  },
];

export const computeTeacherAvailability = (hoursAssigned: number, hoursMax: number): TeacherAvailabilityState => {
  if (!hoursMax) return 'completo';

  const remaining = Math.max(hoursMax - hoursAssigned, 0);
  const availabilityRatio = remaining / hoursMax;

  if (availabilityRatio <= 0.25) return 'completo';
  if (availabilityRatio <= 0.5) return 'cercano';

  return 'disponible';
};

export const getTeacherAvailabilityLabel = (state: TeacherAvailabilityState): string => {
  if (state === 'disponible') return 'Disponible';
  if (state === 'cercano') return 'Cercano al límite';

  return 'Sin disponibilidad';
};

export const getTeacherAvailabilityVariant = (state: TeacherAvailabilityState): string => {
  if (state === 'disponible') return 'success';
  if (state === 'cercano') return 'warning';

  return 'danger';
};

export const getLoadAssignmentLabel = (state: LoadAssignmentState): string => {
  if (state === 'asignado') return 'Asignado';
  if (state === 'pendiente') return 'Pendiente';

  return 'Con conflicto';
};

export const getLoadAssignmentVariant = (state: LoadAssignmentState): string => {
  if (state === 'asignado') return 'success';
  if (state === 'pendiente') return 'warning';

  return 'danger';
};
