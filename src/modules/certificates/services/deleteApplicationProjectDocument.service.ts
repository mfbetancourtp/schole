import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteApplicationProjectDocumentService {
  run(id: number) {
    return axios.delete(`${services.structure}/application-projects-documents/${id}`).then((r) => r.data);
  }
}
