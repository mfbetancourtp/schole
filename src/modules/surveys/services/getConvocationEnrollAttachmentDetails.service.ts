import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

type ConvocationEnrollAttachmentDetailsResponseDto = {
  statusCode: number;
  data: any[];
};

export class GetConvocationEnrollAttachmentDetailsService {
  async run(convocationEnrollId: number | string): Promise<any[]> {
    const response = await axios.get<ConvocationEnrollAttachmentDetailsResponseDto>(`${services.academic}/convocations/enrolls/${convocationEnrollId}/details/attachments`);
    return response.data.data;
  }
}
