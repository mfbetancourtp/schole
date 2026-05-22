import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface ProgramDto {
  id: number;
  code: string;
  name: string;
  programTypeId?: number;
  active?: number;
}

export interface ProgramsResponse {
  data: ProgramDto[];
  total: number;
  page: number;
  perPage: number;
}

export class GetProgramsService {
  async run(params: { perPage?: number; page?: number; order?: string; noPag?: string; search?: string; programTypeId: number }): Promise<ProgramsResponse> {
    const defaultParams = {
      perPage: 100,
      page: 1,
      order: 'ASC',
      noPag: 'true',
      ...params,
    };
    return axios.get(`${services.structure}/programs`, { params: defaultParams }).then((response) => response.data);
  }
}
