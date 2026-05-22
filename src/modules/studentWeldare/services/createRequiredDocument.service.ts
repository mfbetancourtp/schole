import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class CreateRequiredDocumentService {
  run(data: { typeScholarshipId: number; scholarshipDocumentId: number }) {
    return axios.post(`${services.structure}/required-documents`, data).then((r) => r.data);
  }
}
