import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteScholarshipDocumentService {
  run(id: number) {
    return axios.delete(`${services.structure}/scholarship-documents/${id}`).then((r) => r.data);
  }
}
