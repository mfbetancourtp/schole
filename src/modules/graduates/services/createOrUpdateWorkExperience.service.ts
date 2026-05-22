import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import type { UpsertWorkExperienceRequest } from '../dtos/graduateProfile.dto';

export class CreateOrUpdateWorkExperienceService extends CreateOrUpdateBaseService<UpsertWorkExperienceRequest> {
  url = `${services.graduates}/work-experiences`;
  isFormData = false;
}
