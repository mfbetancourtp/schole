import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

type ConvocationEnrollSurveyDetailsResponseDto = {
  statusCode: number;
  data: any[];
};

export class GetConvocationEnrollSurveyDetailsService {
  async run(convocationEnrollId: number | string): Promise<any[]> {
    const response = await axios.get<ConvocationEnrollSurveyDetailsResponseDto>(`${services.academic}/convocations/enrolls/${convocationEnrollId}/details/surveys`);
    return response.data.data;
  }
}
