import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateAreaService extends CreateOrUpdateBaseService<any> {
  url = `${services.structure}/areas`;
}
