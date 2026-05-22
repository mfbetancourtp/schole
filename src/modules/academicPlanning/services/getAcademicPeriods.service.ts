import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import type { AcademicLoadPeriod } from '../dtos/academicLoadManagement.dto';

export class GetAcademicPeriodsService {
  async run(params?: any): Promise<AcademicLoadPeriod[]> {
    const response = await axios.get<AcademicLoadPeriod[]>(`${services.academic}/academic-planning/academic-periods`, {
      params,
    });

    return response.data;
  }
}
