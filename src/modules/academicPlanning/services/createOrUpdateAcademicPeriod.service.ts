import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface CreateAcademicPeriodDto {
  code: string;
  name: string;
  programTypeId: number;
  active: number;
  startDate: string;
  endDate: string;
  programIds: number[];
}

export interface UpdateAcademicPeriodDto extends CreateAcademicPeriodDto {
  id?: number;
}

export class CreateOrUpdateAcademicPeriodService extends CreateOrUpdateBaseService<CreateAcademicPeriodDto> {
  url = `${services.academic}/planning/academic-periods`;
  isFormData = false;
}
