import type { ChecklistDiligenciadoDto } from '../dtos/checklistDiligenciado.dto';

interface ChecklistDiligenciadoApiEnvelope {
  data?: ChecklistDiligenciadoDto;
}

export const unwrapChecklistDiligenciadoResponse = (response: ChecklistDiligenciadoDto | ChecklistDiligenciadoApiEnvelope): ChecklistDiligenciadoDto => {
  const data = (response as ChecklistDiligenciadoApiEnvelope)?.data;

  return data && typeof data === 'object' ? data : (response as ChecklistDiligenciadoDto);
};
