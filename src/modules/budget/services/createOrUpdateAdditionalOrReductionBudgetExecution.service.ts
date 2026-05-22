import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateAdditionalOrReductionBudgetExecutionService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/financing-sources-periods`;
}
