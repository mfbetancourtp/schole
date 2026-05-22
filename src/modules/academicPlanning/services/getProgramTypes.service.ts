import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface ProgramTypeDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  active?: number;
}

export interface ProgramTypesResponse {
  data: ProgramTypeDto[];
  total: number;
  page: number;
  perPage: number;
}

export class GetProgramTypesService {
  async run(
    params: {
      perPage?: number;
      page?: number;
      order?: string;
      search?: string;
    } = {}
  ): Promise<ProgramTypesResponse> {
    const defaultParams = { perPage: 100, page: 1, order: 'asc', ...params };
    return axios.get(`${services.structure}/program-types`, { params: defaultParams }).then((response) => response.data);
  }
}
