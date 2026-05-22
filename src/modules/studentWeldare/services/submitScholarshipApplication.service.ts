import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class SubmitScholarshipApplicationService {
  run(applicationId: number, declarationAccepted: boolean, peopleId?: number) {
    return axios
      .put(
        `${services.structure}/scholarship-catalog/application/${applicationId}/submit`,
        { declarationAccepted },
        {
          headers: peopleId ? { peopleid: String(peopleId) } : undefined,
        }
      )
      .then((r) => r.data);
  }
}
