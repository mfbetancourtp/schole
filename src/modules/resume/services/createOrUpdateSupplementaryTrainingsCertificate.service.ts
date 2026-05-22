import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateSupplementaryTrainingsCertificateService extends CreateOrUpdateBaseService<any> {
  url = `${services.structure}/supplementary-trainings/certificate`;
  isFormData = true;
}
