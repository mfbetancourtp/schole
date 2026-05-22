import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCourseInscriptionsService {
  async run(courseId: number) {
    return axios.get<any>(`${services.classroom}/classroom-administration/course/${courseId}/course-inscriptions`).then((response) => response.data);
  }
}
