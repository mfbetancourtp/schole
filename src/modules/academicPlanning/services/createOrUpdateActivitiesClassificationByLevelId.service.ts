import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateActivitiesClassificationByLevelIdService extends CreateOrUpdateBaseService<any> {
  url = `${services.classroom}/classroom-assessment/activity-categories-new`;
}
