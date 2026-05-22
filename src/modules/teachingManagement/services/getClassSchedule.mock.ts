import { ClassScheduleDto, TeacherProfileDto, ScheduleStatsDto } from '../dtos/classSchedule.dto';

const MOCK_TEACHER: TeacherProfileDto = {
  id: 'DOC-2026-01',
  name: 'Carvajal Niño Martha Carolina',
  department: 'Ciencias e Ingeniería',
  code: 'DOC-2026-01',
  avatarUrl: 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/test/75/2026/avatar/1773093501468.jpg',
};

const MOCK_STATS: ScheduleStatsDto = {
  completed: 0,
  inProgress: 0,
  pending: 9, // hay 9 bloques en la imagen (contando RECESO)
  weeklyHours: 9, // aprox (sin receso). Ajusta si quieres exacto
};

// Semana base (lunes)
const BASE_DATE_MON = '2026-02-16'; // Lunes
const BASE_DATE_TUE = '2026-02-17'; // Martes
const BASE_DATE_THU = '2026-02-19'; // Jueves

const MOCK_CLASSES: ClassScheduleDto[] = [
  // LUNES (2 bloques)
  {
    id: 'LUN-1',
    courseCode: 'SNC',
    courseName: 'Sistema Nacional de Control (Semestre 1)',
    day: 'Lunes',
    startTime: '12:00',
    endTime: '13:00',
    totalHours: 1,
    location: 'Presencial',
    modality: 'Presencial',
    status: 'Pendiente',
    date: BASE_DATE_MON,
  },
  {
    id: 'LUN-2',
    courseCode: 'SNC',
    courseName: 'Sistema Nacional de Control (Semestre 1)',
    day: 'Lunes',
    startTime: '13:00',
    endTime: '14:00',
    totalHours: 1,
    location: 'Presencial',
    modality: 'Presencial',
    status: 'Pendiente',
    date: BASE_DATE_MON,
  },

  // MARTES (Gestión Pública Moderna x2 + RECESO + Marco Normativo x2 + Fundamentos x2)
  {
    id: 'MAR-1',
    courseCode: 'GPM',
    courseName: 'Gestión Pública Moderna (Semestre 1)',
    day: 'Martes',
    startTime: '10:00',
    endTime: '11:00',
    totalHours: 1,
    location: 'Presencial',
    modality: 'Presencial',
    status: 'Pendiente',
    date: BASE_DATE_TUE,
  },
  {
    id: 'MAR-2',
    courseCode: 'GPM',
    courseName: 'Gestión Pública Moderna (Semestre 1)',
    day: 'Martes',
    startTime: '11:00',
    endTime: '12:00',
    totalHours: 1,
    location: 'Presencial',
    modality: 'Presencial',
    status: 'Pendiente',
    date: BASE_DATE_TUE,
  },

  // RECESO (verde en la imagen)
  {
    id: 'MAR-REC',
    courseCode: 'REC',
    courseName: 'RECESO',
    day: 'Martes',
    startTime: '12:00',
    endTime: '12:30',
    totalHours: 0.5,
    location: '',
    modality: 'Presencial',
    status: 'Cumplida', // para que pinte verde con tu lógica actual
    date: BASE_DATE_TUE,
  },

  {
    id: 'MAR-3',
    courseCode: 'MNC',
    courseName: 'Marco Normativo del Control (Semestre 1)',
    day: 'Martes',
    startTime: '12:30',
    endTime: '13:30',
    totalHours: 1,
    location: 'Presencial',
    modality: 'Presencial',
    status: 'Pendiente',
    date: BASE_DATE_TUE,
  },
  {
    id: 'MAR-4',
    courseCode: 'MNC',
    courseName: 'Marco Normativo del Control (Semestre 1)',
    day: 'Martes',
    startTime: '13:30',
    endTime: '14:30',
    totalHours: 1,
    location: 'Presencial',
    modality: 'Presencial',
    status: 'Pendiente',
    date: BASE_DATE_TUE,
  },
  {
    id: 'MAR-5',
    courseCode: 'FUND',
    courseName: 'Fundamentos (Semestre 1)',
    day: 'Martes',
    startTime: '14:30',
    endTime: '15:30',
    totalHours: 1,
    location: 'Presencial',
    modality: 'Presencial',
    status: 'Pendiente',
    date: BASE_DATE_TUE,
  },
  {
    id: 'MAR-6',
    courseCode: 'FUND',
    courseName: 'Fundamentos (Semestre 1)',
    day: 'Martes',
    startTime: '15:30',
    endTime: '16:30',
    totalHours: 1,
    location: 'Presencial',
    modality: 'Presencial',
    status: 'Pendiente',
    date: BASE_DATE_TUE,
  },

  // JUEVES (2 bloques)
  {
    id: 'JUE-1',
    courseCode: 'ERP',
    courseName: 'Ética y Responsabilidad Pública (Semestre 1)',
    day: 'Jueves',
    startTime: '13:15',
    endTime: '14:15',
    totalHours: 1,
    location: 'Presencial',
    modality: 'Presencial',
    status: 'Pendiente',
    date: BASE_DATE_THU,
  },
  {
    id: 'JUE-2',
    courseCode: 'ERP',
    courseName: 'Ética y Responsabilidad Pública (Semestre 1)',
    day: 'Jueves',
    startTime: '14:15',
    endTime: '15:15',
    totalHours: 1,
    location: 'Presencial',
    modality: 'Presencial',
    status: 'Pendiente',
    date: BASE_DATE_THU,
  },
];

export class GetClassScheduleMockService {
  async getTeacherProfile(): Promise<TeacherProfileDto> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_TEACHER), 200));
  }

  async getStats(): Promise<ScheduleStatsDto> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_STATS), 200));
  }

  async getClasses(weekStart?: string): Promise<ClassScheduleDto[]> {
    console.log('Fetching schedule for week starting:', weekStart);
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_CLASSES), 200));
  }
}
