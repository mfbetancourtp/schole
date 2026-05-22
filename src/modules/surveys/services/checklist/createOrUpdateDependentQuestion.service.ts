import { CreateOrUpdateBaseService } from '../../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../../shared/constant/services';

export class CreateOrUpdateDependentQuestionService extends CreateOrUpdateBaseService<any> {
  url = `${services.forms}/pregunta-dependiente`;
  isFormData = false;
}
