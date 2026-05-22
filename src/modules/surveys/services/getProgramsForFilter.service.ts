import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface ProgramFilterDto {
  id: number;
  name: string;
}

interface ProgramsFilterResponse {
  data: ProgramFilterDto[];
  pagination: { page: number; perPage: number; total: number };
}

export class GetProgramsForFilterService {
  async run(params: { search?: string; perPage?: number; page?: number } = {}): Promise<ProgramFilterDto[]> {
    const response = await axios.get<ProgramsFilterResponse>(`${services.structure}/programs`, {
      params: { perPage: 10, page: 1, order: 'asc', ...params },
    });
    return response.data.data ?? [];
  }
}
