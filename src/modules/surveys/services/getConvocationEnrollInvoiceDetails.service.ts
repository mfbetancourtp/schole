import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

type ConvocationEnrollInvoiceDetailsResponseDto = {
  statusCode: number;
  data: any[];
};

export class GetConvocationEnrollInvoiceDetailsService {
  async run(convocationEnrollId: number | string): Promise<any[]> {
    const response = await axios.get<ConvocationEnrollInvoiceDetailsResponseDto>(`${services.academic}/convocations/enrolls/${convocationEnrollId}/details/invoices`);
    return response.data.data;
  }
}
