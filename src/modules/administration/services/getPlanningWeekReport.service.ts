import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetPlanningWeekReportService {
  run(planningWeekId: any) {
    return axios.get(`${services.classroom}/classroom-assessment/planning-week-report/${planningWeekId}`).then((response) => response.data);
  }
}
