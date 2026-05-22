import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import type { TeacherBankStatsData, TeacherBankStatsResponse } from '../dtos/academicLoadManagement.dto';

export interface GetTeacherBankStatsParams {
  academicPeriodId: number;
}

export class GetTeacherBankStatsService {
  async run(params: GetTeacherBankStatsParams): Promise<TeacherBankStatsData> {
    const response = await axios.get<TeacherBankStatsResponse>(`${services.academic}/planning/teacher-contracts/counters`, {
      params,
    });

    return response.data.data;
  }
}
