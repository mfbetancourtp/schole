import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { ActivityCategoriesListDto } from '../dtos/activityCategory.dto';

interface IParams {
  courseId: number;
  academicPeriodId?: number;
  periodId?: number;
}

export class GetActivityCategoriesService {
  run(params: IParams) {
    return axios.get<ActivityCategoriesListDto[]>(`${services.classroom}/classroom-assessment/courses/activity-categories-for-select`, { params }).then((response) => response.data);
  }
}
