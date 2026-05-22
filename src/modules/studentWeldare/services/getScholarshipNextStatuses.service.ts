import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetScholarshipNextStatusesService {
  run(scholarshipStatusId: number, params?: any) {
    return axios
      .get(`${services.structure}/scholarship-next-statuses`, {
        params: {
          scholarshipStatusId,
          ...params,
        },
      })
      .then((r) => r.data);
  }
}
