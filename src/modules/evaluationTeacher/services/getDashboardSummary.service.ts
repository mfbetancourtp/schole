import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { DashboardSummaryDto, GetDashboardSummaryResponse } from '../dtos/applicationAssessments.dto';

export class GetDashboardSummaryService {
  run(institutionId: number): Promise<GetDashboardSummaryResponse> {
    return axios
      .get(`${services.evaluationTeacher}/evaluations/dashboard/summary`, {
        params: { institutionId },
      })
      .then((response) => response.data);
  }
}
