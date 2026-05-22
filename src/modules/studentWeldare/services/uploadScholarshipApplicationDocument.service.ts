import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class UploadScholarshipApplicationDocumentService {
  run(applicationId: number, file: File, requiredDocumentId: number, peopleId?: number) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('requiredDocumentId', String(requiredDocumentId));
    return axios
      .post(`${services.structure}/scholarship-catalog/application/${applicationId}/documents`, formData, {
        headers: peopleId ? { peopleid: String(peopleId) } : undefined,
      })
      .then((r) => r.data);
  }
}
