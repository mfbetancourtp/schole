import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ExperienceLevelRequest {
  name: string;
  code: string;
}

export class CreateOrUpdateExperienceLevelService extends CreateOrUpdateBaseService<ExperienceLevelRequest> {
  url = `${services.graduates}/experience-levels`;
  isFormData = false;
}
