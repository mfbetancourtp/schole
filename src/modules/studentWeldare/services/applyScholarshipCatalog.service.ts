import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class ApplyScholarshipCatalogService {
  run(id: number, motivation: string, peopleId?: number) {
    return axios
      .post(
        `${services.structure}/scholarship-catalog/${id}/apply`,
        { motivation },
        {
          headers: peopleId ? { peopleid: String(peopleId) } : undefined,
        }
      )
      .then((r) => r.data);
  }
}
