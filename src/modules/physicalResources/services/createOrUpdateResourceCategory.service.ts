import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateResourceCategory {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

export class CreateOrUpdateResourceCategoryService extends CreateOrUpdateBaseService<ICreateOrUpdateResourceCategory> {
  url = `${services.academic}/resource-categories`;
  isFormData = false;
}
