import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateStatusAdministrationService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/status-budget-validates`;
}
