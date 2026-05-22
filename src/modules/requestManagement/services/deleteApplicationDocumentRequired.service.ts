import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteApplicationDocumentRequiredService {
  run(id: number) {
    return axios.delete<any>(`${services.structure}/application-document-required/${id}`).then((response) => response.data);
  }
}
