import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetPlanningWeeksWithDetailsService {
  async run(planningWeekId: number) {
    return axios.get(`${services.classroom}/classroom-assessment/planning-weeks-with-details/${planningWeekId}`).then((response) => response.data);
  }
}
