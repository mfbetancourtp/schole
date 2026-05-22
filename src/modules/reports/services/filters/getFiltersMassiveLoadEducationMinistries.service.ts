import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GetFiltersMassiveLoadEducationMinistriesService {
  async run() {
    return axios.get(`${services.reports}/filters/related-data-student-summary-averages-half-unit-end`)
      .then(response => response.data);
  }
}
