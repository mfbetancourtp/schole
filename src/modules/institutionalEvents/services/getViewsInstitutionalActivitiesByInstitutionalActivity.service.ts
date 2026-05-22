import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetViewsInstitutionalActivitiesByInstitutionalActivityService {
  run(id: number) {
    return axios.get(`${services.configurations}/views-institutional-activities-by-institutional-activity/${id}`).then((response) => response.data);
  }
}
