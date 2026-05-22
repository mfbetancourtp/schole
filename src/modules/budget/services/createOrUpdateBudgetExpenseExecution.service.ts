import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateBudgetExpenseExecutionService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/execution-of-expenses`;
}
