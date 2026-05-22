import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateApplicationService extends CreateOrUpdateBaseService<Record<string, any>> {
  url = `${services.graduates}/job-vacancies-applications`;
  isFormData = false;
}
