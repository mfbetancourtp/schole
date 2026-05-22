import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface ConvocationSummaryDto {
  totalProcesses: number;
  activeProcesses: number;
  totalApplicants: number;
  averageSteps: number;
  statusOptions: any;
}

export class GetConvocationsSummaryService {
  async run(): Promise<ConvocationSummaryDto> {
    const response = await axios.get<{
      statusCode: number;
      data: ConvocationSummaryDto;
    }>(`${services.academic}/planning/convocations/summary`);
    return response.data.data;
  }
}
