import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateApplicationCategoryService extends CreateOrUpdateBaseService<Record<string, any>> {
  url = `${services.structure}/application-categories`;
}
