import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCurriculumJobsSubjectsService {
  run(params: any) {
    return axios
      .get(`${services.organizational}/admin/curriculum-jobs-subjects`, {
        params,
      }) // ?levelId=15&organizationalUnitId=5
      .then((response) => response.data);
  }
}
