import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateAcademicPeriodBudgetsService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/academic-period-budgets`;
}
