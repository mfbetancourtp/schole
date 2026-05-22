import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateSourceCategorizationService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/source-categorization`;
}
