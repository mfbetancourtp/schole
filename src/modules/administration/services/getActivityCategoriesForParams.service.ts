import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface IParams {
  courseId: number;
  academicPeriodId?: number;
  periodId?: number;
}

export class GetActivityCategoriesForParamsService {
  run(params: IParams) {
    return axios.get<any>(`${services.classroom}/classroom-assessment/activity-categories-for-params`, { params }).then((response) => response.data);
  }
}
