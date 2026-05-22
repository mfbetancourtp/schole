import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateAbseceTypesService {
  name: string;
}

export class CreateOrUpdateAbseceTypesService extends CreateOrUpdateBaseService<ICreateOrUpdateAbseceTypesService> {
  url = `${services.classroom}/classroom-implementation/absence-types`;
  isFormData = false;
}
