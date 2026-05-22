import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateResourceType {
  code: string;
  name: string;
  description: string;
  resourceCategoryId: number;
  serialIsRequired: boolean;
  isActive: boolean;
}

export class CreateOrUpdateResourceTypeService extends CreateOrUpdateBaseService<ICreateOrUpdateResourceType> {
  url = `${services.academic}/resource-types`;
  isFormData = false;
}
