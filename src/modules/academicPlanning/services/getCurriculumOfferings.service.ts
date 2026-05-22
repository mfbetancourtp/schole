import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';

export interface CurriculumOfferingDto {
  id: number;
  academicPeriodId: number;
  campusId: number;
  campusName: string;
  programId: number;
  programName: string;
  programTypeName?: string;
  facultieName?: string;
  departmentName?: string;
  directorProgramName?: string;
  minCapacity: number;
  maxCapacity: number;
  periodValue: number;
  totalCuts: number;
  operationalShemeId?: number;
  // Mapped fields for compatibility
  institutionId?: number;
  institutionName?: string;
  totalQuota?: number;
  averageValue?: number;
  cutCount?: number;
  active?: number;
  programTypeId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurriculumOfferingsParams extends ParamsPaginationDto {
  academicPeriodId: number;
  campusId?: number;
  programId?: number;
  noPag?: string;
}

export class GetCurriculumOfferingsService {
  run(params: CurriculumOfferingsParams) {
    return axios.get(`${services.academic}/planning/curriculum-offerings`, { params }).then((response) => response.data);
  }
}
