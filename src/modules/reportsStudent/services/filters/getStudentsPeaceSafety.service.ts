import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetStudentsPeaceSafetyService {
  run(params: any) {
    return axios
      .get(`${services.reports}/filters/matriculates-for-report-store-peace-safety`, {
        params,
      })
      .then((response) => response.data);
  }
}
