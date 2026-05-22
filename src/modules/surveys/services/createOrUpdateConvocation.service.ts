import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateConvocationService extends CreateOrUpdateBaseService<any> {
  url = `${services.academic}/academic-planning/convocations`;
  isFormData = true;
}
