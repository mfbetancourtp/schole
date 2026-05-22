import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateAcademicPeriodService {
  name: string;
  curriculumId: number;
  calendarTypeId: number;
  startDate: string;
  endDate: string;
  active: number;
}

export class CreateOrUpdateAcademicPeriodService extends CreateOrUpdateBaseService<ICreateOrUpdateAcademicPeriodService> {
  url = `${services.academic}/academic-planning/academic-periods`;
}
