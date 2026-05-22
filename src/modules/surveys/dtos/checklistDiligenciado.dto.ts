export type ChecklistDiligenciadoEstado = 'No iniciado' | 'En progreso' | 'Entregado' | 'En revisión' | 'Aprobado' | 'Rechazado';

export interface ChecklistDiligenciadoDto {
  id: number;
  checklistId: number;
  usuarioId: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  puntajeTotal: number | null;
  puntajeObtenido: number | null;
  porcentajePuntaje: number | null;
  obligatoriosSinHacer: number;
  estado: ChecklistDiligenciadoEstado | string;
  activo: number;
  createdAt?: string;
  updatedAt?: string | null;
  totalPreguntas?: number;
  preguntasRespondidas?: number;
  porcentajeProgreso?: number;
}

export interface CreateChecklistDiligenciadoPayload {
  checklistId: number;
  usuarioId: number;
  institutionId: number;
  convocationEnrolId: number;
  convocationStepId: number;
  activo: number;
}

export interface UpdateChecklistDiligenciadoEstadoPayload {
  estado: ChecklistDiligenciadoEstado;
}

export interface ResponderChecklistDiligenciadoPayload {
  preguntaId: number;
  opcionRespuestaId?: number | null;
  opcionesIds?: number[];
  valor?: string;
}
