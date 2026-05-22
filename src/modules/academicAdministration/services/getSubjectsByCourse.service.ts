import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetSubjectsByCourseService {
  run(params: any) {
    return axios
      .get(`${services.academic}/academic-administration/subject-assignments`, {
        params,
      })
      .then((response) => response.data);
  }
}
