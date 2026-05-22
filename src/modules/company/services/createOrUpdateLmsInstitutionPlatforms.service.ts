import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateLmsInstitutionPlatformsService extends CreateOrUpdateBaseService<any> {
  url = `${services.lms}/admin/lms-institution-platforms`;
}
