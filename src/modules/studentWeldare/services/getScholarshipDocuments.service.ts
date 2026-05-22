import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetScholarshipDocumentsService {
  run(params?: any) {
    return axios.get(`${services.structure}/scholarship-documents`, { params }).then((r) => r.data);
  }
}
