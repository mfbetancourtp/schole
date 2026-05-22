import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { EmployeeDto } from '../dtos/configureEvaluations.dto';

interface IParams {
  corporateEvaluationPeriodId: number;
}

export class GetOrganizationalUnitEmployeeService {
  run(unitOrganizationalId: number, params?: IParams | any = {}) {
    return axios.get<EmployeeDto[]>(`${services.corporate}/organizational-unit/${unitOrganizationalId}/employees`, { params }).then((response) => response.data);
  }
}
