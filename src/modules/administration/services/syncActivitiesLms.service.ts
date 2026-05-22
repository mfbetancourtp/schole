import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class SyncActivitiesLmsService {
  run(courseId: any) {
    return axios.get(`${services.classroom}/classroom-assessment/courses/${courseId}/sync-activities-by-lms`).then((response) => response.data);
  }
}
