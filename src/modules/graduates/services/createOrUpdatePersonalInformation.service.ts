import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import { UpsertPersonalInformationRequest } from '../dtos/graduateProfile.dto';

export class CreateOrUpdatePersonalInformationService extends CreateOrUpdateBaseService<UpsertPersonalInformationRequest> {
  url = `${services.graduates}/personal-information`;
  isFormData = false;
}
