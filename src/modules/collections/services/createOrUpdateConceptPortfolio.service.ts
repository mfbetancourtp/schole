import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateConceptPortfolioService extends CreateOrUpdateBaseService<any> {
  url = `${services.casurid}/admin-concepts`;
}
