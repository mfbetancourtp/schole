import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import type { AcademicLoadPeriod } from '../dtos/academicLoadManagement.dto';

export interface GetPlanningAcademicPeriodsParams {
  active?: number;
  sort?: string;
  order?: string;
  page?: number;
  perPage?: number;
  search?: string;
}

export class GetPlanningAcademicPeriodsService {
  async run(params?: GetPlanningAcademicPeriodsParams): Promise<AcademicLoadPeriod[]> {
    const response = await axios.get(`${services.academic}/planning/academic-periods`, { params });
    const body = response.data;
    return Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
  }
}
