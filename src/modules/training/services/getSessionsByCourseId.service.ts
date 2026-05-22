import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetSessionsByCourseIdService {
  async run(courseId: number, planningWeekId: number | any) {
    return axios.get<any>(`${services.classroom}/classroom-implementation/sessions-by-planning-week?courseId=${courseId}&planningWeekId=${planningWeekId}`).then((response) => response.data);
  }
}
