import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class LoadEvidenceService extends CreateOrUpdateBaseService<any> {
  url = `${services.classroom}/classroom-assessment/planning-week-budgets-load-cover`;
  isFormData = true;
}
