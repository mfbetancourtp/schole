import { CreateOrUpdateBaseService } from '../../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../../shared/constant/services';

export class CreateOrUpdateAnswerOptionService extends CreateOrUpdateBaseService<any> {
  url = `${services.forms}/opcion-respuesta`;
  isFormData = false;
}
