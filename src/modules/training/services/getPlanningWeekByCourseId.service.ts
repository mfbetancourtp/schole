import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetPlanningWeekByCourseIdService {
  async run(courseId: number, planningWeekId: number | any) {
    return axios.get<any>(`${services.classroom}/classroom-assessment/course/planning-weeks-course?courseId=${courseId}&planningWeekId=${planningWeekId}`).then((response) => response.data);
  }
}
