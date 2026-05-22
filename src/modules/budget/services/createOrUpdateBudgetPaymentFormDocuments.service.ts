import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateBudgetPaymentFormDocumentsService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/budget-payment-form-documents`;
}
