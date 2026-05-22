import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ChecklistDiligenciadoDto, ResponderChecklistDiligenciadoPayload } from '../dtos/checklistDiligenciado.dto';
import { unwrapChecklistDiligenciadoResponse } from './checklistDiligenciadoResponse.util';

export class RespondChecklistDiligenciadoService {
  async run(id: number, data: ResponderChecklistDiligenciadoPayload): Promise<ChecklistDiligenciadoDto> {
    return axios.post(`${services.forms}/checklist-diligenciado/${id}/responder`, data).then((response) => unwrapChecklistDiligenciadoResponse(response.data));
  }
}
