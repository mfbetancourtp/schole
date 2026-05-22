import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateTaskService extends CreateOrUpdateBaseService<any> {
  url = `${services.configurations}/institutional-task`;
}
