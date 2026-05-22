import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateDocumentsBudgetsService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/documents-budgets`;
}
