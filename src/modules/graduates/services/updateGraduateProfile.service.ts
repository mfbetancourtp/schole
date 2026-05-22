import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import { GraduateProfileDto } from '../dtos/graduateProfile.dto';

export class UpdateGraduateProfileService extends CreateOrUpdateBaseService<GraduateProfileDto> {
  url = `${services.graduates}/profile`;
  isFormData = false;
}
