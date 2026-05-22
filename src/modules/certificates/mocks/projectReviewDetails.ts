import type { ProjectReviewDetail } from '../dtos/tutorPanel.dto';

export const projectReviewDetailsMock: Record<number, ProjectReviewDetail> = {
  1: {
    projectId: 1,
    title: 'Sistema de Inventarios para PYMES',
    students: 'María González y Carlos Ramírez',
    modality: 'Proyecto de Grado',
    progress: 45,
    currentChapter: 'Capítulo 3: Análisis y Diseño',
    teamSize: 2,
    deliveries: [
      {
        id: 101,
        fileName: 'Analisis_Diseno_v2.pdf',
        chapter: 'Capítulo 3: Análisis y Diseño',
        studentName: 'María González',
        date: '10 de Marzo, 2026',
        time: '3:45 PM',
        comment: 'Hemos incluido los diagramas UML solicitados y ampliado la sección de requerimientos.',
      },
    ],
  },
  4: {
    projectId: 4,
    title: 'Estudio Comparativo de Frameworks JavaScript Modernos',
    students: 'Sofía López y Diego Torres',
    modality: 'Tesis',
    progress: 30,
    currentChapter: 'Capítulo 2: Marco Teórico',
    teamSize: 2,
    deliveries: [
      {
        id: 401,
        fileName: 'Marco_Teorico_v1.pdf',
        chapter: 'Capítulo 2: Marco Teórico',
        studentName: 'Sofía López',
        date: '11 de Marzo, 2026',
        time: '10:20 AM',
        comment: 'Primera entrega del marco teórico con las referencias bibliográficas actualizadas.',
      },
      {
        id: 402,
        fileName: 'Comparativa_Frameworks.xlsx',
        chapter: 'Capítulo 2: Marco Teórico',
        studentName: 'Diego Torres',
        date: '11 de Marzo, 2026',
        time: '11:05 AM',
        comment: 'Tabla comparativa de los frameworks evaluados con métricas de rendimiento.',
      },
    ],
  },
};
