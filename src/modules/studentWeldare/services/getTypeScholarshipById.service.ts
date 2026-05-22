import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTypeScholarshipByIdService {
  run(id: number) {
    return axios.get(`${services.structure}/type-scholarships/${id}`).then((r) => r.data);
  }
}
