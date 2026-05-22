import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateFinancingSystemsService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/standardized-accounting-system`;
}
