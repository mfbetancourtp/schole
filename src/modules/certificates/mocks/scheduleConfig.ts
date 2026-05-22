import type { ScheduleConfigData } from '../dtos/scheduleConfig.dto';

export const scheduleConfigMock: ScheduleConfigData = {
  templates: [
    {
      id: 1,
      modality: 'thesis',
      title: 'Tesis de Grado',
      description: 'Trabajo de investigación académica con enfoque científico y metodológico',
      icon: 'book-open',
      milestonesCount: 8,
      totalDurationDays: 240,
      topMilestones: [
        { order: 1, name: 'Revisión Bibliográfica', durationDays: 30 },
        { order: 2, name: 'Diseño Metodológico', durationDays: 45 },
        { order: 3, name: 'Implementación del Sistema', durationDays: 90 },
      ],
      remainingCount: 5,
    },
    {
      id: 2,
      modality: 'degree_project',
      title: 'Proyecto de Grado',
      description: 'Desarrollo de aplicación práctica con enfoque en implementación tecnológica',
      icon: 'code',
      milestonesCount: 8,
      totalDurationDays: 180,
      topMilestones: [
        { order: 1, name: 'Análisis de Requerimientos', durationDays: 20 },
        { order: 2, name: 'Diseño de Arquitectura', durationDays: 35 },
        { order: 3, name: 'Desarrollo - Sprint 1', durationDays: 60 },
      ],
      remainingCount: 5,
    },
  ],
};
