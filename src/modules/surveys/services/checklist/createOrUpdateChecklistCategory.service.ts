import { CreateOrUpdateBaseService } from '../../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../../shared/constant/services';

// Manages the master category catalog entries (categoria-pregunta)
export class CreateOrUpdateChecklistCategoryService extends CreateOrUpdateBaseService<any> {
  url = `${services.forms}/categoria-pregunta`;
  isFormData = false;
}
