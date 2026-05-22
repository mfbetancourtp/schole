import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { AcademicPeriodDto } from '../dtos/courseSchedule.dto';

export class GetAcademicPeriodsService {
  async run() {
    return axios.get<AcademicPeriodDto[]>(`${services.academic}/academic-planning/academic-periods`).then((response) => response.data);
  }
}
