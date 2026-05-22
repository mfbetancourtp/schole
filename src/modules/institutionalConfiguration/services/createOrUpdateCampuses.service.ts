import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateCampusesService {
  name: string;
  code: string;
  description?: string;
  directorUserId: number;
}

export class CreateOrUpdateCampusesService extends CreateOrUpdateBaseService<ICreateOrUpdateCampusesService> {
  url = `${services.structure}/campuses`;
}
