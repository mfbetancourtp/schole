import { AppointmentsData } from '../dtos/myAppointments.dto';

export const myAppointmentsMock: AppointmentsData = {
  appointments: [
    {
      id: 1,
      date: '15/03/2025',
      time: '10:00 AM',
      service: 'Apoyo Psicológico',
      status: 'confirmed',
      statusLabel: 'Confirmada',
    },
    {
      id: 2,
      date: '20/03/2025',
      time: '02:30 PM',
      service: 'Consulta Médica General',
      status: 'pending',
      statusLabel: 'Pendiente',
    },
    {
      id: 3,
      date: '05/03/2025',
      time: '09:00 AM',
      service: 'Orientación Vocacional',
      status: 'completed',
      statusLabel: 'Completada',
    },
  ],
  summary: {
    nextAppointment: {
      date: '15/03/2025',
      service: 'Apoyo Psicológico',
    },
    pendingCount: 1,
    completedCount: 1,
  },
};
