import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetActiveCoursesService {
  run(params: any = {}) {
    return axios
      .get(`${services.classroom}/classroom-administration/active-courses`, {
        params,
      })
      .then((response) => response.data);
  }
}
