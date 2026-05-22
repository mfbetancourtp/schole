import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteEvidenceBudgetService {
  async run(planningWeekBudgetsId: any) {
    await axios.delete(`${services.classroom}/classroom-assessment/planning-week-budgets-cover/${planningWeekBudgetsId}`);
  }
}
