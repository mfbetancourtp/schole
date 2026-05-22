import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import { UpsertAdditionalEducationRequest } from '../dtos/graduateProfile.dto';

export class CreateOrUpdateAdditionalEducationService extends CreateOrUpdateBaseService<UpsertAdditionalEducationRequest> {
  url = `${services.graduates}/additional-educations`;
  isFormData = false;
}
