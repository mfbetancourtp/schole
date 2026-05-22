import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class UploadApplicationProjectDocumentService {
  run(file: File, applicationProjectsId: number, documentType: string) {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('applicationProjectsId', String(applicationProjectsId));
    formData.append('documentType', documentType);
    return axios.post(`${services.structure}/application-projects-documents`, formData).then((r) => r.data);
  }
}
