import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface SkillCategoryRequest {
  name: string;
  code: string;
}

export class CreateOrUpdateSkillCategoryService extends CreateOrUpdateBaseService<SkillCategoryRequest> {
  url = `${services.graduates}/skill-categories`;
  isFormData = false;
}
