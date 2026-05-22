import { CreateOrUpdateBaseService } from '../../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../../shared/constant/services';

export class CreateOrUpdateChecklistService extends CreateOrUpdateBaseService<any> {
  url = `${services.forms}/checklist`;
  isFormData = false;
}
