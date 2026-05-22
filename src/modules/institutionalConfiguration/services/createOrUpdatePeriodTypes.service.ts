import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdatePeriodTypesService {
  name: string;
  code: string;
  description: string;
  duration: number;
}

export class CreateOrUpdatePeriodTypesService extends CreateOrUpdateBaseService<ICreateOrUpdatePeriodTypesService> {
  url = `${services.structure}/period-types`;
  isFormData = false;
}
