import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetOptionsRelatedDataService {
  run(params: any) {
    return axios
      .get(`${services.reports}/filters/related-data-student-list-options`, {
        params,
      })
      .then((response) => response.data);
  }
}
