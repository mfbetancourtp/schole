import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateProductionTypeService {
  name: string;
  description?: string;
}

export class CreateOrUpdateProductionTypesService extends CreateOrUpdateBaseService<ICreateOrUpdateProductionTypeService> {
  url = `${services.structure}/production-types`;
}
