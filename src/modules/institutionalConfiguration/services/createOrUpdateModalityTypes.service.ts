import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateModalityTypesService {
  name: string;
  code: string;
  description: string;
}

export class CreateOrUpdateModalityTypesService extends CreateOrUpdateBaseService<ICreateOrUpdateModalityTypesService> {
  url = `${services.structure}/modality-types`;
  isFormData = false;
}
