import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateIncomeExecutionPlanningService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/budget-planning`;
}
