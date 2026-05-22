import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetEnrolMatriculateService {
  run(params: any) {
    return axios
      .get(`${services.academic}/academic-planning/enrol-matriculate`, {
        params,
      })
      .then((response) => response.data);
  }
}
