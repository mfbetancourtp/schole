import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeletePlanningWeekBudgetsByIdService {
  async run(planningWeekBudgetId: any) {
    await axios.delete(`${services.classroom}/classroom-assessment/planning-week-budgets/${planningWeekBudgetId}`);
  }
}
