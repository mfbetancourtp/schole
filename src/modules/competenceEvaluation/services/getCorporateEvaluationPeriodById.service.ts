import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCorporateEvaluationPeriodByIdService {
  run(corporateEvaluationPeriodId: number) {
    return axios.get<EvaluationConfigurationDto>(`${services.corporate}/corporate-evaluation-periods/${corporateEvaluationPeriodId}`).then((response) => response.data);
  }
}
