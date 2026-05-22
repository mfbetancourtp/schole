import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ConvocationEnrollDetailDto, ConvocationEnrollDetailResponseDto } from '../dtos/convocationEnroll.dto';

export class GetConvocationEnrollService {
  async run(convocationEnrollId: number | string): Promise<ConvocationEnrollDetailDto> {
    const response = await axios.get<ConvocationEnrollDetailResponseDto>(`${services.academic}/convocations/enrolls/${convocationEnrollId}`);
    return response.data.data;
  }
}
