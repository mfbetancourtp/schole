import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import type { LoadManagementStatsData, LoadManagementStatsResponse } from '../dtos/academicLoadManagement.dto';

export interface GetLoadManagementStatsParams {
  academicPeriodId: number;
  programId?: any;
}

export class GetLoadManagementStatsService {
  async run(params: GetLoadManagementStatsParams) {
    const response = await axios.get<LoadManagementStatsResponse>(`${services.academic}/planning/offering-sections/statistics`, {
      params,
    });

    return response.data.data;
  }
}
