import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateInstitutionalActivitiesService extends CreateOrUpdateBaseService<any> {
  url = `${services.configurations}/institutional-activities`;
}
