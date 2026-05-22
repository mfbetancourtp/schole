import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetStudentActivitiesService {
  run(params: any) {
    return axios.get(`${services.classroom}/classroom-assessment/activities-by-user`, { params }).then((response) => response.data);
  }
}
