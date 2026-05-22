import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface AcademicPeriodDetailResponse {
  id: number;
  code: string;
  name: string;
  programTypeId: number;
  active: number;
  startDate: string;
  endDate: string;
  statistics: {
    totalPrograms: number;
    totalQuota: number;
    averageValue: number;
    totalCuts: number;
  };
  programs: Array<{
    id: number;
    academicPeriodId: number;
    programId: number;
    programName: string;
    totalQuota: number;
    averageValue: number;
    cutCount: number;
    active: number;
    createdAt?: string;
    updatedAt?: string;
  }>;
}

export class GetAcademicPeriodDetailFullService {
  async run(id: number): Promise<AcademicPeriodDetailResponse> {
    return axios.get(`${services.academic}/planning/academic-periods/${id}/details`).then((response) => {
      const data = response.data?.data || response.data;
      // Map backend structure to expected structure
      return {
        ...data,
        statistics: {
          totalPrograms: data.stats?.totalPrograms || 0,
          totalQuota: data.stats?.totalCapacity || 0,
          averageValue: data.stats?.averageValue || 0,
          totalCuts: data.stats?.totalCuts || 0,
        },
        programs: (data.programs || []).map((program: any) => ({
          ...program,
          // Map programTypeId from period to each program if not present
          programTypeId: program.programTypeId || data.programTypeId,
          programTypeName: program.programTypeName || data.programTypeName,
        })),
      };
    });
  }
}
