import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateEventService extends CreateOrUpdateBaseService<any> {
  url = `${services.configurations}/events`;
}
