import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetActivitiesSummaryFilterPeriodsService {
  run(courseId: number) {
    return axios.get(`${services.academic}/academic-planning/periods-by-course-id/${courseId}`).then((response) => response.data);
  }
}
