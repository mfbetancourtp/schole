import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

type ConvocationEnrollDocumentDetailsResponseDto = {
  statusCode: number;
  data: any[];
};

export class GetConvocationEnrollDocumentDetailsService {
  async run(convocationEnrollId: number | string): Promise<any[]> {
    const response = await axios.get<ConvocationEnrollDocumentDetailsResponseDto>(`${services.academic}/convocations/enrolls/${convocationEnrollId}/details/documents`);
    return response.data.data;
  }
}
