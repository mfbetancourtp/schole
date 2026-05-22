import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface AcademicPeriodStatsDto {
  totalPrograms: number;
  totalCapacity: number;
  averageValue?: number;
  totalCuts?: number;
}

export interface AcademicPeriodDetailsDto {
  id: number;
  name: string;
  code?: string;
  active?: number;
  startDate?: string;
  endDate?: string;
  programTypeName?: string;
  programTypeId?: number;
  stats: AcademicPeriodStatsDto;
}

export class GetAcademicPeriodDetailsService {
  async run(periodId: number): Promise<AcademicPeriodDetailsDto> {
    const response = await axios.get<AcademicPeriodDetailsDto>(`${services.academic}/planning/academic-periods/${periodId}/details`);
    return response.data;
  }
}
