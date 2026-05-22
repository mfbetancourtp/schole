import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface ProgramByCampusDto {
  id: number;
  code: string;
  name: string;
  programTypeId: number;
  programTypeName: string;
  campusId: number;
  campusName: string;
  facultieId?: number;
  facultieName?: string;
  departmentId?: number;
  departmentName?: string;
  active: number;
  isAssociated?: boolean;
}

export interface CampusProgramsDto {
  campusId: number;
  campusName: string;
  programs: ProgramByCampusDto[];
}

export class GetProgramsByCampusService {
  async run(params?: { programTypeId?: number; campusId?: number; search?: string }): Promise<CampusProgramsDto[]> {
    const response = await axios.get(`${services.structure}/programs/by-campus`, {
      params: {
        order: 'ASC',
        page: 1,
        noPag: 'true',
        perPage: 1000,
        ...params,
      },
    });

    const data = response.data?.data || [];

    // Group programs by campus since the endpoint returns a flat array
    const campusMap = new Map<number, CampusProgramsDto>();

    data.forEach((item: any) => {
      const campusId = item.campusId;
      const campusName = item.campusName;

      if (!campusMap.has(campusId)) {
        campusMap.set(campusId, {
          campusId,
          campusName,
          programs: [],
        });
      }

      campusMap.get(campusId)?.programs.push({
        id: item.programId,
        code: item.codeProgram,
        name: item.programName,
        programTypeId: item.programTypeId || 0,
        programTypeName: item.programTypeName || 'Sin tipo',
        campusId,
        campusName,
        facultieId: item.facultieId,
        facultieName: item.facultieName,
        departmentId: item.departmentId,
        departmentName: item.deparmentName || item.departmentName,
        active: item.active ?? 1,
      });
    });

    return Array.from(campusMap.values());
  }
}
