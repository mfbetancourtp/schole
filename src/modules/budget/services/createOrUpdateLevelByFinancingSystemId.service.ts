import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateLevelByFinancingSystemIdService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/levels-standardized-accounting-system`;
}
