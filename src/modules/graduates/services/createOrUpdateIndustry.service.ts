import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface IndustryRequest {
  name: string;
  code: string;
}

export class CreateOrUpdateIndustryService extends CreateOrUpdateBaseService<IndustryRequest> {
  url = `${services.graduates}/industries`;
  isFormData = false;
}
