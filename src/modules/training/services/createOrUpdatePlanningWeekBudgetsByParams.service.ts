import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { PlanningWeekBudgetsByParams } from '../dtos/budgetTracking.dto';

export class UpdatePlanningWeekBudgetsByParamsService extends CreateOrUpdateBaseService<PlanningWeekBudgetsByParams> {
  url = `${services.classroom}/classroom-assessment/planning-week-budgets-params`;
}
