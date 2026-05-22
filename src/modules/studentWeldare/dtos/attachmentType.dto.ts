export interface AttachmentTypeDto {
  id: number;
  code: string;
  name: string;
  description: string;
  abjuntoType: string;
  isActive: boolean;
}

export interface AttachmentTypeStatsDto {
  total: number;
  totalActivos: number;
  totalInactivos: number;
  totalObligatorios: number;
  totalOpcionales: number;
}
