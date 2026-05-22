import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdatePlanningWeeksService {
  courseId: number;
  title: string;
  starDate: string;
  endDate: string;
  range: 'day' | 'week' | 'month';
  periodId: number;
}

export class CreateOrUpdatePlanningWeeksService extends CreateOrUpdateBaseService<ICreateOrUpdatePlanningWeeksService> {
  url = `${services.classroom}/classroom-assessment/planning-weeks`;
}
