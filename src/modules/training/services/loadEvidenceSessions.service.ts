import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class LoadEvidenceSessionsService extends CreateOrUpdateBaseService<any> {
  url = `${services.classroom}/classroom-implementation/sessions-load-url-evidence`;
  isFormData = true;
}
