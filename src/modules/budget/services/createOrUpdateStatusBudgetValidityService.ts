import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateStatusBudgetValidityService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/status-budget-validates-date`;
}