import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteScholarshipNextStatusService {
  async run(id: number): Promise<any> {
    return axios.delete(`${services.structure}/scholarship-next-statuses/${id}`).then((r) => r.data);
  }
}
