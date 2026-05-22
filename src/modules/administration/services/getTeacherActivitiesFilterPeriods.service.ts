import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTeacherActivitiesFilterPeriodsService {
  run(courseId: number, periodId: any) {
    return axios.get(`${services.classroom}/classroom-assessment/courses/${courseId}/teacher-activities?periodId=${periodId}`).then((response) => response.data);
  }
}
