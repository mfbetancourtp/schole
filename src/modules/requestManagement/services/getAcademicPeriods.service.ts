import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { AcademicPeriodsResponseDto, GetAcademicPeriodsParams } from '../dtos/documentRequest.dto';

export class GetAcademicPeriodsService {
  run(params: GetAcademicPeriodsParams): Promise<AcademicPeriodsResponseDto> {
    return axios.get<AcademicPeriodsResponseDto>(`${services.academic}/planning/academic-periods`, { params }).then((r) => r.data);
  }
}
