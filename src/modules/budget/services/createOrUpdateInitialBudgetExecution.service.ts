import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateInitialBudgetExecutionService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/budget-planning-new`;
}
