import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateSupplementaryTrainingsService extends CreateOrUpdateBaseService<any> {
  url = `${services.structure}/supplementary-trainings`;
}
