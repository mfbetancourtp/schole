import type { JuryAssignmentPanelData } from '../dtos/juryAssignment.dto';

export const juryAssignmentPanelMock: JuryAssignmentPanelData = {
  summary: {
    complete: 1,
    partial: 1,
    unassigned: 2,
  },
  projects: [
    {
      id: 1,
      title: 'Sistema de Reconocimiento Facial con IA',
      status: 'complete',
      modality: 'degree_project',
      studentName: 'María González',
      tutorName: 'Dra. Ana Rodríguez',
      assignedCount: 3,
      totalRequired: 3,
    },
    {
      id: 2,
      title: 'Impacto de la IA en la Educación Superior',
      status: 'partial',
      modality: 'thesis',
      studentName: 'Carlos Ramírez',
      tutorName: 'Dr. Luis García',
      assignedCount: 1,
      totalRequired: 3,
    },
    {
      id: 3,
      title: 'Plataforma E-commerce con Blockchain',
      status: 'unassigned',
      modality: 'degree_project',
      studentName: 'Ana Martínez',
      tutorName: 'Dr. Carlos Mendoza',
      assignedCount: 0,
      totalRequired: 3,
    },
    {
      id: 4,
      title: 'Análisis de Sentimientos en Redes Sociales',
      status: 'unassigned',
      modality: 'thesis',
      studentName: 'Laura Fernández',
      tutorName: 'Dra. Ana Rodríguez',
      assignedCount: 0,
      totalRequired: 3,
    },
  ],
};
