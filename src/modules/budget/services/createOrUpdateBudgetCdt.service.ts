import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateBudgetCdtService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/budget-planning-periods-cdt`;
}
