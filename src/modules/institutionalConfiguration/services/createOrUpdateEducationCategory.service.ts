import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateEducationCategoryService {
  name: string;
  code: string;
}

export class CreateOrUpdateEducationCategoryService extends CreateOrUpdateBaseService<ICreateOrUpdateEducationCategoryService> {
  url = `${services.structure}/education-categories`;
  isFormData = false;
}
