import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateActivitiesCategoryService {
  abbreviation: any;
  name: any;
  percent: number | null;
  academicPeriodId: number;
  periodId: number | null;
}

export class CreateOrUpdateActivitiesCategoryService extends CreateOrUpdateBaseService<ICreateOrUpdateActivitiesCategoryService> {
  url = `${services.classroom}/classroom-assessment/activity-categories`;
}
