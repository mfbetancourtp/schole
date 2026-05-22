import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateContractFormService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/budget-contract-form`;
}
