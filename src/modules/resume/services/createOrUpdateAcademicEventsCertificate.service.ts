import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateAcademicEventsCertificateService extends CreateOrUpdateBaseService<any> {
  url = `${services.structure}/academicEvents/certificate`;
  isFormData = true;
}
