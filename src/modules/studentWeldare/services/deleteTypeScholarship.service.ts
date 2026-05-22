import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteTypeScholarshipService {
  run(id: number) {
    return axios.delete(`${services.structure}/type-scholarships/${id}`).then((r) => r.data);
  }
}
