import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetResponsiblesInstitutionalActivitiesService {
  run(id: number) {
    return axios.get(`${services.configurations}/responsibles-institutional-activities-by-institutional-activity/${id}`).then((response) => response.data);
  }
}
