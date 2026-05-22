import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import type { ContractTypesStatsData, ContractTypesStatsResponse } from '../dtos/academicLoadManagement.dto';

export class GetContractTypesStatsService {
  run(params: any) {
    return axios.get<any>(`${services.graduates}/contract-types/stats`, { params }).then((response) => response.data);
  }
}
