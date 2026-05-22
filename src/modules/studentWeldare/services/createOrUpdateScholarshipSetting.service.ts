import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import type { CreateOrUpdateScholarshipSettingDto } from '../dtos/scholarshipConfig.dto';

export class CreateOrUpdateScholarshipSettingService extends CreateOrUpdateBaseService<CreateOrUpdateScholarshipSettingDto> {
  url = `${services.structure}/scholarship-settings`;
  isFormData = false;
}
