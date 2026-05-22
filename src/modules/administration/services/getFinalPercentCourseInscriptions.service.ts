import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetFinalPercentCourseInscriptionsService {
  run(courseId: number) {
    return axios.get<any>(`${services.classroom}/classroom-administration/course/${courseId}/final-percent-course-inscriptions`).then((response) => response.data);
  }
}
