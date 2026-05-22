import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateResponsiblesInstitutionalActivitiesService extends CreateOrUpdateBaseService<any> {
  url = `${services.configurations}/responsibles-institutional-activities`;
}
