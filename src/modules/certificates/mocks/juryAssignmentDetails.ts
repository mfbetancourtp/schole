import type { JuryProjectDetail, EvaluatorOption } from '../dtos/juryAssignment.dto';

export const juryProjectDetailsMock: Record<number, JuryProjectDetail> = {
  1: {
    id: 1,
    title: 'Sistema de Reconocimiento Facial con IA',
    studentName: 'María González',
    tutorName: 'Dra. Ana Rodríguez',
    faculty: 'Ingeniería',
    modality: 'degree_project',
    status: 'complete',
    currentJury: [
      {
        id: 1,
        name: 'Dr. Roberto Sánchez',
        role: 'president',
        confirmationStatus: 'confirmed',
      },
      {
        id: 2,
        name: 'Dra. Patricia López',
        role: 'vocal_1',
        confirmationStatus: 'confirmed',
      },
      {
        id: 3,
        name: 'Dr. Fernando Castro',
        role: 'vocal_2',
        confirmationStatus: 'pending',
      },
    ],
    preSelectedEvaluators: [
      { evaluatorId: 1, role: 'president' },
      { evaluatorId: 2, role: 'vocal_1' },
      { evaluatorId: 3, role: 'vocal_2' },
    ],
  },
  2: {
    id: 2,
    title: 'Impacto de la IA en la Educación Superior',
    studentName: 'Carlos Ramírez',
    tutorName: 'Dr. Luis García',
    faculty: 'Ingeniería',
    modality: 'thesis',
    status: 'partial',
    currentJury: [
      {
        id: 4,
        name: 'Dra. Isabel Morales',
        role: 'president',
        confirmationStatus: 'confirmed',
      },
    ],
    preSelectedEvaluators: [{ evaluatorId: 4, role: 'president' }],
  },
  3: {
    id: 3,
    title: 'Plataforma E-commerce con Blockchain',
    studentName: 'Ana Martínez',
    tutorName: 'Dr. Carlos Mendoza',
    faculty: 'Ingeniería',
    modality: 'degree_project',
    status: 'unassigned',
    currentJury: [],
    preSelectedEvaluators: [],
  },
  4: {
    id: 4,
    title: 'Análisis de Sentimientos en Redes Sociales',
    studentName: 'Laura Fernández',
    tutorName: 'Dra. Ana Rodríguez',
    faculty: 'Ciencias',
    modality: 'thesis',
    status: 'unassigned',
    currentJury: [],
    preSelectedEvaluators: [],
  },
};

export const evaluatorOptionsMock: EvaluatorOption[] = [
  {
    id: 1,
    name: 'Dr. Roberto Sánchez',
    department: 'Ingeniería de Sistemas',
    specialties: ['Inteligencia Artificial', 'Machine Learning'],
    activeProjects: 3,
  },
  {
    id: 2,
    name: 'Dra. Patricia López',
    department: 'Ingeniería de Sistemas',
    specialties: ['Visión por Computadora', 'Deep Learning'],
    activeProjects: 2,
  },
  {
    id: 3,
    name: 'Dr. Fernando Castro',
    department: 'Ingeniería de Sistemas',
    specialties: ['Procesamiento de Imágenes', 'IA'],
    activeProjects: 4,
  },
  {
    id: 4,
    name: 'Dra. Isabel Morales',
    department: 'Ciencias de la Computación',
    specialties: ['Educación', 'Tecnologías Educativas'],
    activeProjects: 1,
  },
  {
    id: 5,
    name: 'Dr. Miguel Herrera',
    department: 'Ingeniería de Software',
    specialties: ['Blockchain', 'Criptografía', 'Seguridad'],
    activeProjects: 2,
  },
  {
    id: 6,
    name: 'Dra. Carmen Vega',
    department: 'Ciencias de Datos',
    specialties: ['NLP', 'Análisis de Sentimientos', 'Big Data'],
    activeProjects: 3,
  },
];
