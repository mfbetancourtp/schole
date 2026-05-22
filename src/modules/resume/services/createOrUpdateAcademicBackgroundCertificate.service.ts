import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateAcademicBackgroundsCertificateService extends CreateOrUpdateBaseService<any> {
  url = `${services.structure}/academic-backgrounds/certificate`;
  isFormData = true;
}
