import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class SyncActivitiesLmsNewService {
  run(courseId: any) {
    return axios.get(`${services.classroom}/classroom-administration/courses-new/${courseId}/sync-activities`).then((response) => response.data);
  }
}
