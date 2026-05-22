import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { CorporateEvaluationPeriodEmployeeDto } from '../dtos/configureEvaluations.dto';

export class GetCorporateEvaluationPeriodEmployeesConfigureEvaluatorsService {
  run(corporateEvaluationPeriodId: number) {
    const params = { corporateEvaluationPeriodId: corporateEvaluationPeriodId };

    return axios.get<CorporateEvaluationPeriodEmployeeDto[]>(`${services.corporate}/corporate-evaluation-period-employees-to-configure-evaluators`, { params }).then((response) => response.data);
  }
}
