import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface PendingSummaryDto {
  required: number;
  optional: number;
  total: number;
}

export class GetPendingSummaryService {
  run(): Promise<{ statusCode: number; data: PendingSummaryDto }> {
    return axios.get(`${services.evaluationExecution}/pending-summary`).then((response) => response.data);
  }
}
