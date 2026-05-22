import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateApplicationTypeService extends CreateOrUpdateBaseService<Record<string, any>> {
  url = `${services.structure}/application-types`;
}
