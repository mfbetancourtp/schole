import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdatePeriodsAdministration extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/periods-budget-validates`;
}
