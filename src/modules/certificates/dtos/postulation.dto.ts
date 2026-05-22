export type PostulationListStatus = 'Pendiente' | 'En Revisión' | 'Aprobada' | 'Rechazada';

export interface PostulationFormData {
  title: string;
  description: string;
  facultyId: number | null;
  postulationType: 'Individual' | 'En Pareja/Equipo';
  partnerId: number | null;
  scheduleSettingsId: number | null;
  proposalFile: File | null;
  annexFile: File | null;
  tutorId: number | null;
  noTutorDefined: boolean;
}
