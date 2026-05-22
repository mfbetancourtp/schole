import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateOrganizationTypesService {
  name: string;
  code: string;
  description: string;
}

export class CreateOrUpdateOrganizationTypesService extends CreateOrUpdateBaseService<ICreateOrUpdateOrganizationTypesService> {
  url = `${services.structure}/organization-types`;
  isFormData = false;
}
