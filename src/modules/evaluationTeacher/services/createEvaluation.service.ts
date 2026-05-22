import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateEvaluationService extends CreateOrUpdateBaseService<any> {
  url = `${services.evaluationTeacher}/evaluations`;
}
