import type { DashboardData } from '../dtos/dashboard.dto';

export const dashboardMock: DashboardData = {
  summary: {
    status: 'En Revisión',
    statusDate: 'Actualizado hoy',
    progress: 65,
    modality: 'Proyecto',
    modalityDetail: 'De Grado',
    tutorName: 'Dr. Carlos Mendoza',
    tutorStatus: 'Asignado',
  },
  projects: [
    {
      id: 1,
      title: 'Sistema de Gestión de Inventarios para PYMES',
      description: 'Desarrollo de una plataforma web para automatizar el control de inventarios en pequeñas y medianas empresas.',
      tags: ['Proyecto de Grado', 'En Revisión'],
      enrollmentDate: '15 de Febrero, 2026',
      assignedTutor: 'Dr. Carlos Mendoza',
      status: 'En Revisión',
      dueDate: '20 de Abril, 2026',
    },
    {
      id: 2,
      title: 'Análisis de Redes Neuronales en Sistemas de Diagnóstico Médico',
      description: 'Investigación sobre el uso de inteligencia artificial para mejorar la precisión en diagnósticos clínicos tempranos.',
      tags: ['Investigación', 'Pendiente'],
      enrollmentDate: '1 de Marzo, 2026',
      assignedTutor: 'Sin asignar',
      status: 'Pendiente',
      dueDate: '15 de Mayo, 2026',
    },
  ],
  activities: [
    {
      id: 1,
      title: 'Nuevo comentario del tutor',
      description: 'Revisión del Capítulo 3 - Marco Teórico',
      timeAgo: 'Hace 2 horas',
      type: 'comment',
    },
    {
      id: 2,
      title: 'Capítulo 2 aprobado',
      description: 'El tutor ha aprobado tu capítulo 2',
      timeAgo: 'Hace 1 día',
      type: 'approval',
    },
    {
      id: 3,
      title: 'Entrega pendiente',
      description: 'Capítulo 4 - Vence en 5 días',
      timeAgo: 'Hace 2 días',
      type: 'pending',
    },
  ],
};
