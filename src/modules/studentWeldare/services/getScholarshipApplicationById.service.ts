import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetScholarshipApplicationByIdService {
  run(applicationId: number, peopleId?: number) {
    return axios
      .get(`${services.structure}/scholarship-catalog/application/${applicationId}`, {
        headers: peopleId ? { peopleid: String(peopleId) } : undefined,
      })
      .then((r) => r.data);
  }
}
