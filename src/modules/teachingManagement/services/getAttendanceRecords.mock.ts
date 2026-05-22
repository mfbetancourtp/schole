import { AttendanceRecordDto, AttendanceSummaryDto, AttendanceStatus } from '../dtos/attendanceRecord.dto';

/** Datos mock de registros de asistencia – Febrero 2026 */
const MOCK_RECORDS: AttendanceRecordDto[] = [
  {
    id: 1,
    date: '2026-02-10',
    dayName: 'Lunes',
    entryTime: '08:05',
    exitTime: '17:15',
    totalHours: 9.17,
    status: 'Puntual',
    validation: 'Validado',
  },
  {
    id: 2,
    date: '2026-02-09',
    dayName: 'Domingo',
    entryTime: null,
    exitTime: null,
    totalHours: null,
    status: 'Falta',
    statusDetail: 'Día no laborable',
    validation: 'Validado',
  },
  {
    id: 3,
    date: '2026-02-07',
    dayName: 'Viernes',
    entryTime: '08:35',
    exitTime: '16:10',
    totalHours: 7.58,
    status: 'Tardanza',
    statusDetail: 'Tardanza de 35 minutos',
    validation: 'Validado',
  },
  {
    id: 4,
    date: '2026-02-06',
    dayName: 'Jueves',
    entryTime: '07:55',
    exitTime: '18:05',
    totalHours: 10.17,
    status: 'Puntual',
    validation: 'Validado',
  },
  {
    id: 5,
    date: '2026-02-05',
    dayName: 'Miércoles',
    entryTime: null,
    exitTime: null,
    totalHours: null,
    status: 'Justificado',
    statusDetail: 'Permiso médico - Certificado presentado',
    validation: 'Validado',
  },
  {
    id: 6,
    date: '2026-02-04',
    dayName: 'Martes',
    entryTime: '08:10',
    exitTime: '17:20',
    totalHours: 9.17,
    status: 'Puntual',
    statusDetail: 'Registro en validación',
    validation: 'Pendiente',
  },
  {
    id: 7,
    date: '2026-02-03',
    dayName: 'Lunes',
    entryTime: '08:05',
    exitTime: '17:15',
    totalHours: 9.17,
    status: 'Puntual',
    validation: 'Validado',
  },
];

/** Resumen mock del período */
const MOCK_SUMMARY: AttendanceSummaryDto = {
  attendedDays: 5,
  totalDays: 7,
  attendancePercentage: 71,
  delays: 1,
  absences: 1,
  totalHours: 45.3,
  validatedRecords: 6,
  totalRecords: 7,
  validationPercentage: 86,
};

/**
 * Servicio mock que simula la obtención de registros de asistencia.
 * Aplica filtros opcionales de fecha y estado.
 */
export class GetAttendanceRecordsMockService {
  async getRecords(filters?: { startDate?: string | null; endDate?: string | null; status?: AttendanceStatus | null }): Promise<AttendanceRecordDto[]> {
    // Simula latencia de red
    await new Promise((resolve) => setTimeout(resolve, 400));

    let records = [...MOCK_RECORDS];

    if (filters?.startDate) {
      records = records.filter((r) => r.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      records = records.filter((r) => r.date <= filters.endDate!);
    }
    if (filters?.status) {
      records = records.filter((r) => r.status === filters.status);
    }

    return records;
  }

  async getSummary(): Promise<AttendanceSummaryDto> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { ...MOCK_SUMMARY };
  }
}
