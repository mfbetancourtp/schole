import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetPlanningWeeksByCourseIdService {
  async run(courseId: number) {
    return axios.get<any>(`${services.classroom}/classroom-assessment/course/${courseId}/planning-weeks`).then((response) => response.data);
  }
}
