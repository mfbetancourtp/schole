import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateHierarchicalLevel {
  code: string;
  name: string;
  level: string;
  isActive: boolean;
}

export class CreateOrUpdateHierarchicalLevelService extends CreateOrUpdateBaseService<ICreateOrUpdateHierarchicalLevel> {
  url = `${services.academic}/hierarchical-levels`;
  isFormData = false;
}
