import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdatePeriodicityService extends CreateOrUpdateBaseService<any> {
  url = `${services.configurations}/periodicity`;
}
