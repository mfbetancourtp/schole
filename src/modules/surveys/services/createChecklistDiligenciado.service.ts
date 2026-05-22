import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ChecklistDiligenciadoDto, CreateChecklistDiligenciadoPayload } from '../dtos/checklistDiligenciado.dto';
import { unwrapChecklistDiligenciadoResponse } from './checklistDiligenciadoResponse.util';

export class CreateChecklistDiligenciadoService {
  async run(data: CreateChecklistDiligenciadoPayload): Promise<ChecklistDiligenciadoDto> {
    return axios.post(`${services.forms}/checklist-diligenciado`, data).then((response) => unwrapChecklistDiligenciadoResponse(response.data));
  }
}
