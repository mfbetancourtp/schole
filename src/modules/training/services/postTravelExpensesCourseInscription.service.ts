import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class PostTravelExpensesCourseInscriptionService {
  run(courseId: number, data: any) {
    return axios.post(`${services.classroom}/classroom-administration/travel-expenses-course-inscription?courseId=${courseId}`, data).then((response) => response.data);
  }
}
