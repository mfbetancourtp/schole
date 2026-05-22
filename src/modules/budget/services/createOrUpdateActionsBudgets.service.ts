import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateActionsBudgetsService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/actions-budgets`;
  //isFormData = true;
}
