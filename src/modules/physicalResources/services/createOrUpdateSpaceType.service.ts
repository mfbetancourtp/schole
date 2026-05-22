import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateSpaceType {
  code: string;
  name: string;
  isActive: boolean;
}

export class CreateOrUpdateSpaceTypeService extends CreateOrUpdateBaseService<ICreateOrUpdateSpaceType> {
  url = `${services.academic}/space-types`;
  isFormData = false;
}
