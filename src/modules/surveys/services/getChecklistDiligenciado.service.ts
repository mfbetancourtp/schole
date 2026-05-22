import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ChecklistDiligenciadoDto } from '../dtos/checklistDiligenciado.dto';
import { unwrapChecklistDiligenciadoResponse } from './checklistDiligenciadoResponse.util';

export class GetChecklistDiligenciadoService {
  async run(id: number): Promise<ChecklistDiligenciadoDto> {
    return axios.get(`${services.forms}/checklist-diligenciado/${id}`).then((response) => unwrapChecklistDiligenciadoResponse(response.data));
  }
}
