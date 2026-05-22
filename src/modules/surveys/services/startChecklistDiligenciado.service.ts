import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ChecklistDiligenciadoDto } from '../dtos/checklistDiligenciado.dto';
import { unwrapChecklistDiligenciadoResponse } from './checklistDiligenciadoResponse.util';

export class StartChecklistDiligenciadoService {
  async run(id: number): Promise<ChecklistDiligenciadoDto> {
    return axios.post(`${services.forms}/checklist-diligenciado/${id}/iniciar`).then((response) => unwrapChecklistDiligenciadoResponse(response.data));
  }
}
