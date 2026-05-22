import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ConvocationEnrollStatsResponseDto } from '../dtos/convocationEnroll.dto';

export class GetConvocationEnrollStatsService {
  async run(convocationId?: number): Promise<ConvocationEnrollStatsResponseDto> {
    const params: Record<string, any> = {};
    if (convocationId) params.convocationId = convocationId;
    const response = await axios.get<{
      statusCode: number;
      data: ConvocationEnrollStatsResponseDto;
    }>(`${services.academic}/convocations/enrolls/stats`, { params });
    return response.data.data;
  }
}
