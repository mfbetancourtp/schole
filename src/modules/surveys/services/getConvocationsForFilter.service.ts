import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface ConvocationFilterDto {
  id: number;
  title: string;
}

interface ConvocationsFilterResponse {
  data: ConvocationFilterDto[];
  pagination: { page: number; perPage: number; total: number };
}

export class GetConvocationsForFilterService {
  async run(params: { search?: string; perPage?: number; page?: number } = {}): Promise<ConvocationFilterDto[]> {
    const response = await axios.get<ConvocationsFilterResponse>(`${services.academic}/planning/convocations`, {
      params: { perPage: 10, page: 1, order: 'DESC', ...params },
    });
    return response.data.data ?? [];
  }
}
