import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';

export class GetAcademicPeriodsService {
  async run(params: any) {
    return axios.get<AcademicPeriodDto[]>(`${services.academic}/academic-planning/academic-periods`, { params }).then((response) => response.data);
  }
}
