import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface UpdateEvaluationBreakDto {
  name: string;
  startDate: string;
  endDate: string;
  gradeLoadStartDate: string;
  gradeLoadEndDate: string;
}

export class UpdateEvaluationBreakService {
  async run(breakId: number, payload: UpdateEvaluationBreakDto): Promise<any> {
    // Map frontend fields to backend fields
    const backendPayload = {
      name: payload.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
      uploadStartDate: payload.gradeLoadStartDate,
      uploadEndDate: payload.gradeLoadEndDate,
    };

    return axios.put(`${services.academic}/planning/curriculum-offerings/breaks/${breakId}`, backendPayload).then((response) => response.data);
  }
}
