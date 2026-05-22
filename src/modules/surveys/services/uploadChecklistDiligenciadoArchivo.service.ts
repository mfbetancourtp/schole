import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ChecklistDiligenciadoDto } from '../dtos/checklistDiligenciado.dto';
import { unwrapChecklistDiligenciadoResponse } from './checklistDiligenciadoResponse.util';

export class UploadChecklistDiligenciadoArchivoService {
  async run(id: number, file: File): Promise<ChecklistDiligenciadoDto> {
    const formData = new FormData();
    formData.append('file', file);

    return axios
      .post(`${services.forms}/checklist-diligenciado/${id}/archivo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => unwrapChecklistDiligenciadoResponse(response.data));
  }
}
