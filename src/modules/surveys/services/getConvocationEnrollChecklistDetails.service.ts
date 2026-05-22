import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

type ConvocationEnrollChecklistDetailsResponseDto = {
  statusCode: number;
  data: any[];
};

export class GetConvocationEnrollChecklistDetailsService {
  async run(convocationEnrollId: number | string): Promise<any[]> {
    const response = await axios.get<ConvocationEnrollChecklistDetailsResponseDto>(`${services.academic}/convocations/enrolls/${convocationEnrollId}/details/checklists`);
    return response.data.data;
  }
}
