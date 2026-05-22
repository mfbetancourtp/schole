import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateIntellectualProductionsCertificateService extends CreateOrUpdateBaseService<any> {
  url = `${services.structure}/intellectual-productions/certificate`;
  isFormData = true;
}
