import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class PostCorporateEvaluationsFromArrayService extends CreateOrUpdateBaseService<any> {
  url = `${services.corporate}/corporate-evaluations-from-array`;
}
