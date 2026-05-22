import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCourseInscriptionsEmployeesService {
  async run(courseId: number) {
    return axios.get<any>(`${services.classroom}/classroom-administration/course/${courseId}/course-inscriptions-employees`).then((response) => response.data);
  }
}
