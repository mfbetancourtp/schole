export type AgreementStatus = 'Activo' | 'Borrador' | 'Finalizado' | 'Suspendido';

export type AgreementTipo = 'Práctica Profesional' | 'Movilidad Internacional' | 'Investigación Conjunta' | 'Intercambio Cultural';

export interface AgreementDto {
  id: string;
  code: string;
  name: string;
  tipo: AgreementTipo | string;
  institution: string;
  country: string;
  startDate: string;
  endDate: string;
  totalSlots: number;
  usedSlots: number;
  status: AgreementStatus;
  totalApplications: number;
}

export interface AgreementStatsDto {
  activeCount: number;
  draftCount: number;
  totalApplications: number;
  availableSlots: number;
}
