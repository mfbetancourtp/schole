import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface CreateRequestAttachmentDto {
  archivo: File;
  requestDocumentsId: number;
  applicationDocumentRequiredId?: number;
}

export class CreateRequestAttachmentService {
  async run(data: CreateRequestAttachmentDto): Promise<any> {
    const formData = new FormData();
    formData.append('archivo', data.archivo);
    formData.append('requestDocumentsId', String(data.requestDocumentsId));
    if (data.applicationDocumentRequiredId !== undefined) {
      formData.append('applicationDocumentRequiredId', String(data.applicationDocumentRequiredId));
    }
    return axios
      .post(`${services.structure}/request-attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  }
}
