import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdatePlanningWeekBudgetsService extends CreateOrUpdateBaseService<any> {
  url = `${services.classroom}/classroom-assessment/planning-week-budgets`;
}
