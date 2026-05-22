import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import type { UpsertGraduateSkillRequest } from '../dtos/graduateProfile.dto';

export class CreateOrUpdateSkillService extends CreateOrUpdateBaseService<UpsertGraduateSkillRequest> {
  url = `${services.graduates}/skills`;
  isFormData = false;
}
