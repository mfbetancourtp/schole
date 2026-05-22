import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateGroupService {
  name: string;
  description?: string;
}

export class CreateOrUpdateEventRolesService extends CreateOrUpdateBaseService<ICreateOrUpdateGroupService> {
  url = `${services.structure}/events-roles`;
}
