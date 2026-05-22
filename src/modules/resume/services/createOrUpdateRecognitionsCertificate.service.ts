import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateRecognitionsCertificateService extends CreateOrUpdateBaseService<any> {
  url = `${services.structure}/recognitions/certificate`;
  isFormData = true;
}
