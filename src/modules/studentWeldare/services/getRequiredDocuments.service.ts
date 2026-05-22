import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetRequiredDocumentsService {
  run(params?: any) {
    return axios.get(`${services.structure}/required-documents`, { params }).then((r) => r.data);
  }
}
