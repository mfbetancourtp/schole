import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ChecklistDiligenciadoDto, UpdateChecklistDiligenciadoEstadoPayload } from '../dtos/checklistDiligenciado.dto';
import { unwrapChecklistDiligenciadoResponse } from './checklistDiligenciadoResponse.util';

export class UpdateChecklistDiligenciadoEstadoService {
  async run(id: number, data: UpdateChecklistDiligenciadoEstadoPayload): Promise<ChecklistDiligenciadoDto> {
    return axios.patch(`${services.forms}/checklist-diligenciado/${id}/estado`, data).then((response) => unwrapChecklistDiligenciadoResponse(response.data));
  }
}
