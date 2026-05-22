import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { PaginatedConvocationsDto } from '../dtos/convocationsList.dto';

export interface GetConvocationsListParams {
  academicPeriodId?: number;
  page?: number;
  perPage?: number;
}

export class GetConvocationsListService {
  async run(params?: GetConvocationsListParams): Promise<PaginatedConvocationsDto> {
    const response = await axios.get<PaginatedConvocationsDto>(`${services.academic}/planning/convocations`, { params });
    return response.data;
  }
}
