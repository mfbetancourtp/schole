import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetInstitutionalActivitiesByAcaPerIdService {
  run(academicPeriodId: number) {
    return axios.get(`${services.configurations}/academic-period/${academicPeriodId}/institutional-activities`).then((response) => response.data);
  }
}
