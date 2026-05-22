import { CreateOrUpdateBaseService } from '../../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../../shared/constant/services';

// Links a master category (categoria-pregunta) to a checklist via the junction table
export class LinkCategoryToChecklistService extends CreateOrUpdateBaseService<any> {
  url = `${services.forms}/categoria-pregunta-checklist`;
  isFormData = false;
}
