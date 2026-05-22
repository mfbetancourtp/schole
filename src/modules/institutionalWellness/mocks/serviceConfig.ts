import { ServiceConfig } from '../dtos/serviceConfig.dto';

export const serviceConfigMock: ServiceConfig[] = [
  {
    id: 1,
    icon: 'brain',
    iconLabel: 'Psicología',
    name: 'Apoyo Psicológico',
    description: 'Atención psicológica individual para estudiantes que requieren apoyo emocional y mental.',
    status: 'active',
    pendingCount: 12,
    requirements: ['Carné estudiantil vigente'],
    responsibles: [
      {
        name: 'Dra. Carmen López',
        email: 'carmen.lopez@akademia.edu',
        role: 'Psicólogo',
      },
    ],
  },
  {
    id: 2,
    icon: 'heart',
    iconLabel: 'Salud',
    name: 'Consulta Médica General',
    description: 'Consulta médica general y preventiva para la comunidad estudiantil.',
    status: 'active',
    pendingCount: 7,
    requirements: ['Carné estudiantil vigente', 'Certificado médico reciente'],
    responsibles: [
      {
        name: 'Dr. Andrés Herrera',
        email: 'andres.herrera@akademia.edu',
        role: 'Médico',
      },
    ],
  },
  {
    id: 3,
    icon: 'comment',
    iconLabel: 'Orientación',
    name: 'Orientación Vocacional',
    description: 'Asesoramiento sobre opciones académicas y profesionales para estudiantes.',
    status: 'active',
    pendingCount: 0,
    requirements: ['Carné estudiantil vigente', 'Formato de solicitud firmado'],
    responsibles: [],
  },
  {
    id: 4,
    icon: 'user-friends',
    iconLabel: 'Trabajo Social',
    name: 'Trabajo Social',
    description: 'Apoyo social y gestión de subsidios y beneficios para estudiantes en situación vulnerable.',
    status: 'inactive',
    pendingCount: 3,
    requirements: ['Carné estudiantil vigente', 'Comprobante de matrícula'],
    responsibles: [
      {
        name: 'Lic. Patricia Mora',
        email: 'patricia.mora@akademia.edu',
        role: 'Trabajador Social',
      },
    ],
  },
  {
    id: 5,
    icon: 'running',
    iconLabel: 'Deportes',
    name: 'Actividades Deportivas',
    description: 'Programas deportivos y de acondicionamiento físico para la comunidad estudiantil.',
    status: 'active',
    pendingCount: 18,
    requirements: ['Carné estudiantil vigente', 'Certificado médico reciente'],
    responsibles: [
      {
        name: 'Prof. Luis Vargas',
        email: 'luis.vargas@akademia.edu',
        role: 'Coordinador',
      },
    ],
  },
  {
    id: 6,
    icon: 'tablet-alt',
    iconLabel: 'Académico',
    name: 'Asesoría Académica',
    description: 'Apoyo académico personalizado para mejorar el rendimiento en asignaturas.',
    status: 'active',
    pendingCount: 5,
    requirements: ['Carné estudiantil vigente', 'Semestre mínimo cursado (3er semestre)'],
    responsibles: [],
  },
];
