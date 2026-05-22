import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ConvocationEnrollPaginationDto } from '../dtos/convocationEnroll.dto';

interface IGetApplicationsParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  programId?: number;
  convocationId?: number;
  order?: string;
}

export class GetApplicationsService {
  async run(params: IGetApplicationsParams = {}): Promise<ConvocationEnrollPaginationDto> {
    const response = await axios.get<ConvocationEnrollPaginationDto>(`${services.academic}/convocations/enrolls`, { params: { order: 'ASC', perPage: 50, ...params } });
    return response.data;
  }
}
