import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ConvocationEnrollProgressDetailDto, ConvocationEnrollProgressDetailsResponseDto } from '../dtos/convocationEnroll.dto';

export class GetConvocationEnrollProgressDetailsService {
  async run(convocationEnrollId: number | string): Promise<ConvocationEnrollProgressDetailDto[]> {
    const response = await axios.get<ConvocationEnrollProgressDetailsResponseDto>(`${services.academic}/convocations/enrolls/${convocationEnrollId}/progress-details`);
    return response.data.data;
  }
}
