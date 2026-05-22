import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteRequiredDocumentService {
  run(id: number) {
    return axios.delete(`${services.structure}/required-documents/${id}`).then((r) => r.data);
  }
}
