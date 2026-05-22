import { CreateOrUpdateBaseService } from '../../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../../shared/constant/services';

export class CreateOrUpdateChecklistQuestionService extends CreateOrUpdateBaseService<any> {
  url = `${services.forms}/pregunta`;
  isFormData = false;
}
