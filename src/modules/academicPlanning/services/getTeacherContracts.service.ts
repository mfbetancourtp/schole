import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';

import type { TeacherAvailabilityApiState, TeacherContractsData } from '../dtos/academicLoadManagement.dto';

export interface GetTeacherContractsParams extends ParamsPaginationDto {
  academicPeriodId: number;
  contractTypeId?: number;
  status?: TeacherAvailabilityApiState;
}

export class GetTeacherContractsService {
  run(params: GetTeacherContractsParams) {
    return axios.get<{ data: TeacherContractsData }>(`${services.academic}/planning/teacher-contracts`, { params }).then((response) => response.data.data);
  }
}
