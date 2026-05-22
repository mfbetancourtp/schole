import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetSummaryInstitutionalActivityService {
  run(id: number) {
    return axios.get(`${services.configurations}/summary-institutional-activity/${id}`).then((response) => response.data);
  }
}
