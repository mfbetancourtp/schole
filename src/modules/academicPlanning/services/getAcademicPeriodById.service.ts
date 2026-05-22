import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface AcademicPeriodDetailDto {
  id: number;
  code: string;
  name: string;
  programTypeId: number;
  active: number;
  startDate: string;
  endDate: string;
  programIds?: number[];
  programs?: { id: number; name: string; code?: string }[];
}

export class GetAcademicPeriodByIdService {
  async run(id: number): Promise<AcademicPeriodDetailDto> {
    return axios.get(`${services.academic}/planning/academic-periods/${id}`).then((response) => {
      return response.data?.data || response.data;
    });
  }
}
