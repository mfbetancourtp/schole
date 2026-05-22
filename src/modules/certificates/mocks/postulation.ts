import type { FacultyOption, TutorOption, PartnerResult, PostulationListItem } from '../dtos/postulation.dto';

export const facultyOptionsMock: FacultyOption[] = [
  { id: 1, name: 'Ingeniería' },
  { id: 2, name: 'Ciencias' },
  { id: 3, name: 'Administración' },
  { id: 4, name: 'Derecho' },
  { id: 5, name: 'Medicina' },
];

export const tutorOptionsMock: TutorOption[] = [
  { id: 1, name: 'Dr. Carlos Mendoza', specialty: 'Ingeniería de Software' },
  { id: 2, name: 'Dra. Ana Rodríguez', specialty: 'Inteligencia Artificial' },
  { id: 3, name: 'Dr. Luis García', specialty: 'Bases de Datos y Big Data' },
  { id: 4, name: 'Dra. María Martínez', specialty: 'Ciberseguridad' },
];

export const postulationListMock: PostulationListItem[] = [
  {
    id: 1,
    title: 'Sistema de Gestión de Inventarios para PYMES',
    status: 'En Revisión',
    faculty: 'Ingeniería',
    modality: 'Proyecto de Grado',
    submittedDate: '15 de Febrero, 2026',
    trackingNumber: '#RAD-2026-180',
  },
  {
    id: 2,
    title: 'Análisis de Redes Neuronales en Sistemas de Diagnóstico Médico',
    status: 'Pendiente',
    faculty: 'Ciencias',
    modality: 'Tesis',
    submittedDate: '1 de Marzo, 2026',
    trackingNumber: '#RAD-2026-203',
  },
  {
    id: 3,
    title: 'Plataforma de E-Learning para Educación Rural',
    status: 'Rechazada',
    faculty: 'Ingeniería',
    modality: 'Proyecto de Grado',
    submittedDate: '10 de Enero, 2026',
    trackingNumber: '#RAD-2026-041',
    partner: 'María González Pérez',
  },
];

export const partnerSearchResultsMock: PartnerResult[] = [
  { id: 101, name: 'María González Pérez', code: 'EST-2021-001' },
  { id: 102, name: 'Carlos Ramírez Silva', code: 'EST-2021-002' },
  { id: 103, name: 'Ana Martínez López', code: 'EST-2021-003' },
  { id: 104, name: 'Luis Díaz Torres', code: 'EST-2021-004' },
  { id: 105, name: 'Sofía López Castro', code: 'EST-2021-005' },
];
