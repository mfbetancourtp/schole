import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdatePeriodTemplateService extends CreateOrUpdateBaseService<any> {
  url = `${services.structure}/period-templates`;
  isFormData = false;
}
