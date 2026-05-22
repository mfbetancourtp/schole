import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCurriculumOrgJobsRelatedDataService {
  run() {
    return axios.get(`${services.organizational}/admin/curriculum-org-jobs-related-data`).then((response) => response.data);
  }
}
