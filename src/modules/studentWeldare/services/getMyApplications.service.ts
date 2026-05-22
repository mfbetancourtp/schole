import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetMyApplicationsService {
  run(peopleId?: number) {
    return axios
      .get(`${services.structure}/scholarship-catalog/application/my-applications`, {
        headers: peopleId ? { peopleid: String(peopleId) } : undefined,
      })
      .then((r) => r.data);
  }
}
