import type { Teacher, WorkloadData, AcademicWorkloadFilters, AcademicWorkloadResponse, TeacherSearchResult } from '../dtos/academicWorkload.dto';

/** Datos mock de docentes */
const MOCK_TEACHERS: Teacher[] = [
  {
    id: 1,
    name: 'Dr. Carlos Mendoza García',
    code: 'DOC-2024-001',
    department: 'Ingeniería',
    initials: 'DC',
    email: 'carlos.mendoza@universidad.edu',
    phone: '+51 999 888 777',
  },
  {
    id: 2,
    name: 'Dra. María González López',
    code: 'DOC-2024-002',
    department: 'Ciencias',
    initials: 'MG',
    email: 'maria.gonzalez@universidad.edu',
    phone: '+51 999 888 666',
  },
  {
    id: 3,
    name: 'Mg. Juan Pérez Ramírez',
    code: 'DOC-2024-003',
    department: 'Humanidades',
    initials: 'JP',
    email: 'juan.perez@universidad.edu',
    phone: '+51 999 888 555',
  },
];

/** Datos mock de carga académica - Dr. Carlos Mendoza García */
const MOCK_WORKLOAD_DATA: WorkloadData = {
  hoursTaught: 24,
  hoursScheduled: 24,
  hoursTrend: 5.2,
  compliance: 100.0,
  complianceTrend: 2.1,
  completeDays: 3,
  totalDays: 5,
  completeDaysTrend: 8.3,
  alertCourses: 1,
  alerts: ['1 curso(s) con cumplimiento por debajo del esperado', 'Se detectaron retrasos recurrentes en el curso "Desarrollo Web"', 'Revisa la sección de detalle por curso para más información'],
  weeklyData: [
    { day: 'Lunes', scheduled: 6, taught: 6 },
    { day: 'Martes', scheduled: 4, taught: 4 },
    { day: 'Miércoles', scheduled: 6, taught: 5.5 },
    { day: 'Jueves', scheduled: 4, taught: 4 },
    { day: 'Viernes', scheduled: 4, taught: 4.5 },
  ],
  dailyDetail: [
    {
      date: '03/02',
      dayName: 'Lunes',
      scheduled: '6h',
      taught: '6h',
      compliance: 100,
      status: 'Completo',
    },
    {
      date: '04/02',
      dayName: 'Martes',
      scheduled: '4h',
      taught: '4h',
      compliance: 100,
      status: 'Completo',
    },
    {
      date: '05/02',
      dayName: 'Miércoles',
      scheduled: '6h',
      taught: '5.5h',
      compliance: 91.7,
      status: 'Incompleto',
    },
    {
      date: '06/02',
      dayName: 'Jueves',
      scheduled: '4h',
      taught: '4h',
      compliance: 100,
      status: 'Completo',
    },
    {
      date: '07/02',
      dayName: 'Viernes',
      scheduled: '4h',
      taught: '4.5h',
      compliance: 112.5,
      status: 'Excedido',
    },
  ],
  courseDetail: [
    {
      code: 'ING-101',
      name: 'Programación I',
      hoursPerWeek: '6h',
      hoursTaught: '24h',
      classes: '12/12',
      delays: 0,
      status: 'Excelente',
    },
    {
      code: 'ING-201',
      name: 'Base de Datos',
      hoursPerWeek: '6h',
      hoursTaught: '22h',
      classes: '11/12',
      delays: 1,
      status: 'Bueno',
    },
    {
      code: 'ING-301',
      name: 'Desarrollo Web',
      hoursPerWeek: '4h',
      hoursTaught: '14h',
      classes: '7/12',
      delays: 3,
      status: 'Alerta',
    },
  ],
};

/**
 * Servicio mock para obtener información de carga académica de docentes.
 */
export class GetAcademicWorkloadMockService {
  /**
   * Buscar docentes por nombre o código
   */
  async searchTeachers(query: string): Promise<TeacherSearchResult> {
    // Simula latencia de red
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!query || query.trim().length === 0) {
      return {
        teachers: MOCK_TEACHERS,
        total: MOCK_TEACHERS.length,
      };
    }

    const normalizedQuery = query.toLowerCase().trim();
    const filteredTeachers = MOCK_TEACHERS.filter(
      (teacher) => teacher.name.toLowerCase().includes(normalizedQuery) || teacher.code.toLowerCase().includes(normalizedQuery) || teacher.department.toLowerCase().includes(normalizedQuery)
    );

    return {
      teachers: filteredTeachers,
      total: filteredTeachers.length,
    };
  }

  /**
   * Obtener datos de carga académica de un docente
   */
  async getWorkloadData(filters: AcademicWorkloadFilters): Promise<AcademicWorkloadResponse> {
    // Simula latencia de red
    await new Promise((resolve) => setTimeout(resolve, 500));

    const teacher = MOCK_TEACHERS.find((t) => t.id === filters.teacherId) || MOCK_TEACHERS[0];

    // En un sistema real, estos datos vendrían del backend
    // Por ahora retornamos los datos mock
    return {
      teacher,
      workload: MOCK_WORKLOAD_DATA,
      period: {
        month: filters.period.month,
        year: filters.period.year,
        startDate: `${filters.period.year}-${String(filters.period.month).padStart(2, '0')}-01`,
        endDate: `${filters.period.year}-${String(filters.period.month).padStart(2, '0')}-28`,
      },
    };
  }

  /**
   * Obtener docente por ID
   */
  async getTeacherById(id: number): Promise<Teacher | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_TEACHERS.find((t) => t.id === id) || null;
  }

  /**
   * Exportar reporte de carga académica
   */
  async exportWorkloadReport(teacherId: number, period: { month: number; year: number }): Promise<Blob> {
    // Simula latencia de red
    await new Promise((resolve) => setTimeout(resolve, 800));

    // En un sistema real, esto generaría un PDF o Excel
    const content = JSON.stringify({ teacherId, period }, null, 2);
    return new Blob([content], { type: 'application/json' });
  }
}

// Instancia singleton del servicio
export const academicWorkloadService = new GetAcademicWorkloadMockService();
