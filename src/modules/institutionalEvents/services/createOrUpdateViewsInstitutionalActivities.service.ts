import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateViewsInstitutionalActivitiesService extends CreateOrUpdateBaseService<any> {
  url = `${services.configurations}/views-institutional-activities`;
}
