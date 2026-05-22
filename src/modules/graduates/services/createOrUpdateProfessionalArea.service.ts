import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ProfessionalAreaRequest {
  name: string;
  code: string;
}

export class CreateOrUpdateProfessionalAreaService extends CreateOrUpdateBaseService<ProfessionalAreaRequest> {
  url = `${services.graduates}/professional-areas`;
  isFormData = false;
}
