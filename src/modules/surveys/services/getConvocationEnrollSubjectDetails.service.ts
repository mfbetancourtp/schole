import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

type ConvocationEnrollSubjectDetailsResponseDto = {
  statusCode: number;
  data: any[];
};

export class GetConvocationEnrollSubjectDetailsService {
  async run(convocationEnrollId: number | string): Promise<any[]> {
    const response = await axios.get<ConvocationEnrollSubjectDetailsResponseDto>(`${services.academic}/convocations/enrolls/${convocationEnrollId}/details/subjects`);
    return response.data.data;
  }
}
