import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateAmountMonthBudgetExecutionService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/budget-planning-executed`;
}
