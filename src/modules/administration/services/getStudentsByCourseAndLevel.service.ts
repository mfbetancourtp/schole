import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetStudentsByCourseAndLevelService {
  run(courseId: number) {
    return axios.get(`${services.classroom}/classroom-administration/course/${courseId}/course-inscriptions`).then((response) => response.data);
  }
}
