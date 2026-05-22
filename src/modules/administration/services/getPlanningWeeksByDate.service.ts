import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetPlanningWeeksByDateService {
  run(academicPeriodGroupId: number, params: any): Promise<any> {
    return axios.get(`${services.classroom}/classroom-assessment/academic-period-group/${academicPeriodGroupId}/planning-weeks`, {params}).then((response) => response.data);
  }
}
