import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateEducationTypesService {
  name: string;
  code: string;
  description: string;
  educationCategoryId: number | null;
  parentId: number | null;
}

export class CreateOrUpdateEducationTypesService extends CreateOrUpdateBaseService<ICreateOrUpdateEducationTypesService> {
  url = `${services.structure}/education-types`;
  isFormData = false;
}
