import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdatePaymentTypeService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/budget-payment-type`;
}
