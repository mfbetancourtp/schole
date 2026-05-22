import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCorporateEvaluationsService {
  run(academicPeriodId: number) {
    return axios.get<any>(`${services.corporate}/academic-period/${academicPeriodId}/corporate-evaluations`).then((response) => response.data);
  }
}
