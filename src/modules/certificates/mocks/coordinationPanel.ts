import type { CoordinationPanelData } from '../dtos/coordinationPanel.dto';

export const coordinationPanelDataMock: CoordinationPanelData = {
  summary: {
    pending: 3,
    approved: 2,
    rejected: 1,
  },
  postulations: [
    // Pendientes (3)
    {
      id: 1,
      title: 'Desarrollo de un Sistema de Reconocimiento Facial con IA',
      students: [{ initials: 'MG', name: 'María González' }],
      studentsLabel: 'María González',
      isTeam: false,
      faculty: 'Ingeniería',
      date: '02 de Marzo, 2026',
      status: 'pending',
      modality: 'degree_project',
    },
    {
      id: 2,
      title: 'Impacto de la Inteligencia Artificial en la Educación Superior',
      students: [
        { initials: 'CR', name: 'Carlos Ramírez' },
        { initials: 'SL', name: 'Sofía López' },
      ],
      studentsLabel: 'Carlos Ramírez y Sofía López',
      isTeam: true,
      faculty: 'Ingeniería',
      date: '01 de Marzo, 2026',
      status: 'pending_confirmation',
      modality: 'thesis',
    },
    {
      id: 3,
      title: 'Análisis de Sentimientos en Redes Sociales',
      students: [{ initials: 'LF', name: 'Laura Fernández' }],
      studentsLabel: 'Laura Fernández',
      isTeam: false,
      faculty: 'Ciencias',
      date: '28 de Febrero, 2026',
      status: 'pending',
      modality: 'thesis',
    },
    // Aprobadas (2)
    {
      id: 4,
      title: 'Plataforma de Gestión de Inventarios con IoT',
      students: [{ initials: 'AD', name: 'Andrés Delgado' }],
      studentsLabel: 'Andrés Delgado',
      isTeam: false,
      faculty: 'Ingeniería',
      date: '20 de Febrero, 2026',
      status: 'approved',
      modality: 'degree_project',
    },
    {
      id: 5,
      title: 'Estudio de Factibilidad para Energías Renovables en Campus Universitarios',
      students: [
        { initials: 'PR', name: 'Paula Ríos' },
        { initials: 'JM', name: 'Jorge Morales' },
      ],
      studentsLabel: 'Paula Ríos y Jorge Morales',
      isTeam: true,
      faculty: 'Administración',
      date: '15 de Febrero, 2026',
      status: 'approved',
      modality: 'thesis',
    },
    // Rechazadas (1)
    {
      id: 6,
      title: 'Aplicación Móvil de Delivery para Restaurantes Locales',
      students: [{ initials: 'DV', name: 'Daniel Vargas' }],
      studentsLabel: 'Daniel Vargas',
      isTeam: false,
      faculty: 'Ingeniería',
      date: '10 de Febrero, 2026',
      status: 'rejected',
      modality: 'degree_project',
    },
  ],
};
