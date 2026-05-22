import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteApplicationTypeDocumentService {
  run(id: number) {
    return axios.delete<any>(`${services.structure}/application-types-documents/${id}`).then((response) => response.data);
  }
}
