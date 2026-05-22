import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteScholarshipStatusService {
  run(id: number) {
    return axios.delete(`${services.structure}/scholarship-statuses/${id}`).then((r) => r.data);
  }
}
