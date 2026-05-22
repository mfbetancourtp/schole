import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdatePeriodService extends CreateOrUpdateBaseService<any> {
  url = `${services.academic}/periods`;
}
