import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { AcademicPeriodsDto } from '../dtos/academicPeriods.dto';

export class GetAcademicPeriodsWithPeriodsService {
  run() {
    return axios.get<AcademicPeriodsDto>(`${services.academic}/academic-planning/academic-periods-with-periods`).then((response) => response.data);
  }
}
