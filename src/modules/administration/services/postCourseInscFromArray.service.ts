import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class PostCourseInscFromArrayService {
  run(data: any) {
    return axios.post(`${services.classroom}/classroom-administration/course-inscriptions-from-array`, data).then((response) => response.data);
  }
}
