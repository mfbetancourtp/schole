import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetOptionsRelatedDataTutorService {
  run(params: any) {
    return axios
      .get(`${services.reports}/filters/related-data-tutor-list-options`, {
        params,
      })
      .then((response) => response.data);
  }
}
