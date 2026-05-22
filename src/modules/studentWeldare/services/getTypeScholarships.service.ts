import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTypeScholarshipsService {
  run(params?: any) {
    return axios.get(`${services.structure}/type-scholarships`, { params }).then((r) => r.data);
  }
}
