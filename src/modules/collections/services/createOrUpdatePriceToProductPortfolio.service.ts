import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdatePriceToProductPortfolioService extends CreateOrUpdateBaseService<any> {
  url = `${services.casurid}/admin-product-values`;
}
