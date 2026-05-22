export type AppointmentStatus = 'confirmed' | 'pending' | 'completed';

export interface Appointment {
  id: number;
  date: string;
  time: string;
  service: string;
  status: AppointmentStatus;
  statusLabel: string;
}

export interface AppointmentsSummary {
  nextAppointment: { date: string; service: string } | null;
  pendingCount: number;
  completedCount: number;
}

export interface AppointmentsData {
  appointments: Appointment[];
  summary: AppointmentsSummary;
}
