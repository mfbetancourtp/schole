import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateCorporateEvaluationPeriodsService extends CreateOrUpdateBaseService<any> {
  url = `${services.corporate}/corporate-evaluation-periods`;
}
