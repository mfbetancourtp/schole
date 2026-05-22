import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface CompanySizeRequest {
  name: string;
  code: string;
}

export class CreateOrUpdateCompanySizeService extends CreateOrUpdateBaseService<CompanySizeRequest> {
  url = `${services.graduates}/company-sizes`;
  isFormData = false;
}
