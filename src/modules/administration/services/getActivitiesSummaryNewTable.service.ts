import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetActivitiesSummaryNewTable {
  run(courseId: any, periodId: any) {
    return axios.get(`${services.classroom}/classroom-assessment/courses/activities-summary-new-table?periodId=${periodId}&courseId=${courseId}`).then((response) => response.data);
  }
}
