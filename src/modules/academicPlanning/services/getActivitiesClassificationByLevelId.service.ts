import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface IParams {
  levelId: number;
  academicPeriodId?: number;
  periodId?: number;
}

export class GetActivitiesClassificationByLevelIdService {
  async run(params: IParams) {
    return axios
      .get<any[]>(`${services.classroom}/classroom-assessment/courses/activity-categories-for-select-new`, {
        params,
      })
      .then((response) => response.data);
  }
}
