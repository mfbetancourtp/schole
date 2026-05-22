import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTravelExpensesByCourseIdService {
  async run(courseId: number, planningWeekId: number | any) {
    return axios.get<any>(`${services.classroom}/classroom-administration/travel-expenses-by-planning-week?courseId=${courseId}&planningWeekId=${planningWeekId}`).then((response) => response.data);
  }
}
